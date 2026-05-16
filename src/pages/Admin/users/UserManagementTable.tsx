import { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  Plus, 
  FileSpreadsheet, 
  Pencil, 
  Trash2,
  X,
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Calendar as CalendarIcon,
  Loader2,
  Upload,
  ImagePlus
} from "lucide-react";
import * as XLSX from "xlsx";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import type { RegisteredUser as User, UserRole, UserStatus } from "@/types/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface UserManagementTableProps {
  role: UserRole;
  title: string;
}

export default function UserManagementTable({ role, title }: UserManagementTableProps) {
  const users = useUserStore((state) => state.users);
  const addUser = useUserStore((state) => state.addUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const syncWithAuth = useUserStore((state) => state.syncWithAuth);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync users whenever the role or component mounts
  useEffect(() => {
    syncWithAuth();
  }, [role, syncWithAuth]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: role as UserRole,
    status: "Active" as UserStatus,
    photo: "",
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchRole = user.role.toLowerCase() === role.toLowerCase();
      const matchSearch = user.name.toLowerCase().includes(search.trim().toLowerCase()) || 
                          user.email.toLowerCase().includes(search.trim().toLowerCase());
      
      let matchDate = true;
      if (dateRange?.from) {
        const userDate = parseISO(user.createdAt);
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchDate = isWithinInterval(userDate, { start, end });
      }

      return matchRole && matchSearch && matchDate;
    });
  }, [users, role, search, dateRange]);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const baseData = filteredUsers.length > 0 ? filteredUsers : [
      {
        name: "",
        email: "",
        status: "",
        role: "",
        createdAt: new Date().toISOString()
      }
    ];

    const dataToExport = baseData.map(u => ({
      Name: u.name,
      Email: u.email,
      Status: u.status,
      Role: u.role,
      "Created At": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_Export.xlsx`);
    setIsExporting(false);
    toast.success("Exported successfully");
  };

  const openForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't show password on edit for security
        role: user.role,
        status: user.status as any,
        photo: user.photo || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: role,
        status: "Active",
        photo: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    deleteUser(deleteUserId);
    setIsDeleting(false);
    setDeleteUserId(null);
    toast.success("User deleted successfully");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (editingUser) {
        updateUser(editingUser.id, formData);
        toast.success("User updated successfully");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users");
          setIsSubmitting(false);
          return;
        }
        addUser({ ...formData });
        
        if (formData.role !== role) {
          toast.success(`User added successfully to ${formData.role} category`);
        } else {
          toast.success("User added successfully");
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${title}...`}
            className="pl-9 h-10 rounded-lg bg-white dark:bg-card border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 justify-start text-left font-normal rounded-lg border-slate-200 bg-white dark:bg-card w-[240px]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by Date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            disabled={isExporting}
            onClick={handleExport}
            className="h-10 rounded-lg border-slate-200 gap-2 font-medium"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            onClick={() => openForm()}
            className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-500/20 text-white"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-card dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="w-[80px] font-bold text-slate-900 dark:text-slate-100">Photo</TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">Name</TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">Email</TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <TableCell>
                    <div className="size-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                      {user.photo ? (
                        <img src={user.photo} alt={user.name} className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-slate-400">
                          <UserIcon size={18} />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={`
                        capitalize rounded-full px-3 py-0.5 font-medium
                        ${user.status.toLowerCase() === "active" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800" 
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }
                      `}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForm(user)}
                        className="size-8 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteUserId(user.id)}
                        className="size-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? `Edit ${title}` : `Add New ${title}`}</DialogTitle>
            <DialogDescription>
              Enter the details for the {role.toLowerCase()} user account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                required={!editingUser}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "Leave blank to keep current password" : "Set account password"}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val: UserRole) => setFormData({ ...formData, role: val })}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profile Photo (Optional)</Label>
              <div 
                className="rounded-2xl border border-dashed border-border bg-muted/50 p-5 cursor-pointer hover:bg-muted/80 transition-colors relative overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                {formData.photo ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 rounded-full overflow-hidden border shadow-sm">
                      <img src={formData.photo} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <p className="text-xs text-blue-600 font-medium">Click to change photo</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm">
                      <ImagePlus className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Upload Photo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click to select an image from your device.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: UserStatus) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-xl h-11 px-6">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="rounded-xl h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Add User"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
