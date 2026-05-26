import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { useAuthStore } from "@/store/authStore";
import { getRegisteredUsers, saveRegisteredUsers } from "@/lib/registeredUsers";
import { useUserStore } from "@/store/userStore";
import { axiosClient } from "@/api/axiosClient";
import { setAuthCookies } from "@/lib/authCookies";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingPage() {
  const { user } = useAuthStore();
  const [avatarPreview, setAvatarPreview] = useState(user?.photo || "");
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name || "System Admin",
      email: user?.email || "admin@example.com",
      role: user?.role || "Admin",
      bio: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.name,
        email: user.email,
        role: user.role,
        bio: "",
      });
      if (user.photo) {
        setAvatarPreview(user.photo);
      }
    }
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = passwordForm.watch("newPassword");

  const passwordRequirements = useMemo(
    () => [
      {
        label: "Minimum 8 characters long",
        valid: newPassword.length >= 8,
      },
      {
        label: "At least one uppercase character",
        valid: /[A-Z]/.test(newPassword),
      },
      {
        label: "At least one special character (!@#$%)",
        valid: /[!@#$%]/.test(newPassword),
      },
      {
        label: "At least one number",
        valid: /\d/.test(newPassword),
      },
    ],
    [newPassword],
  );

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image to B2 storage...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");

      const response = await axiosClient.post("/uploads/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        const uploadedUrl = response.data.data.url;
        setAvatarPreview(uploadedUrl);
        toast.success("Profile photo uploaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to upload photo", { id: toastId });
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Error uploading photo to storage", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }

    try {
      const response = await axiosClient.put(`/auth/users/${user.id}`, {
        name: values.fullName,
        photo: avatarPreview,
      });

      if (response.status === 200) {
        const updatedUser = {
          ...user,
          name: values.fullName,
          photo: avatarPreview,
        };

        const token = useAuthStore.getState().token;
        if (token) {
          setAuthCookies(token, updatedUser);
        }

        useAuthStore.setState({ user: updatedUser });

        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!user) {
      toast.error("You must be logged in to change your password.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    const registeredUsers = getRegisteredUsers();
    const currentUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === user.email.toLowerCase(),
    );

    if (!currentUser) {
      toast.error("User account not found.");
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = bcrypt.compareSync(
      values.currentPassword.trim(),
      currentUser.password,
    );

    if (!isCurrentPasswordValid) {
      passwordForm.setError("currentPassword", {
        message: "Current password is incorrect",
      });
      toast.error("Current password is incorrect.");
      return;
    }

    // Hash and save new password
    const hashedNewPassword = bcrypt.hashSync(values.newPassword.trim(), 10);
    const updatedUsers = registeredUsers.map((u) =>
      u.id === currentUser.id ? { ...u, password: hashedNewPassword } : u,
    );
    saveRegisteredUsers(updatedUsers);

    // Sync user store so other components pick up the change
    useUserStore.getState().syncWithAuth();

    passwordForm.reset();
    toast.success("Password updated successfully!");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile information and account security.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="h-auto gap-2 rounded-2xl bg-transparent p-0">
            <TabsTrigger
              value="profile"
              className="h-10 rounded-xl border border-border bg-card px-5 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>

            <TabsTrigger
              value="security"
              className="h-10 rounded-xl border border-border bg-card px-5 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <LockKeyhole className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-0">
            <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border px-6 py-5">
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>
                  Update your account&apos;s profile information and email
                  address.
                </CardDescription>
              </CardHeader>

              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <CardContent className="grid gap-8 px-6 py-6 lg:grid-cols-[180px_1fr]">
                  <div className="space-y-4 text-center">
                    <div className="relative mx-auto h-32 w-32">
                      <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={avatarPreview} alt="System Admin" />
                        <AvatarFallback className="bg-red-600 text-3xl font-semibold text-white">
                          SA
                        </AvatarFallback>
                      </Avatar>

                      <label
                        htmlFor="avatarUpload"
                        className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 ${
                          isUploading ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                        }`}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </label>

                      <input
                        id="avatarUpload"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploading}
                      />
                    </div>

                    <div>
                      <label htmlFor={isUploading ? undefined : "avatarUpload"}>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 cursor-pointer rounded-lg"
                          disabled={isUploading}
                          asChild
                        >
                          <span>{isUploading ? "Uploading..." : "Change Photo"}</span>
                        </Button>
                      </label>

                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        Allowed *.jpeg, *.jpg, *.png, *.gif <br />
                        Maximum size of 5MB
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="fullName"
                          className="h-11 rounded-lg bg-background pl-10"
                          {...profileForm.register("fullName")}
                        />
                      </div>

                      {profileForm.formState.errors.fullName && (
                        <p className="text-sm text-red-500">
                          {profileForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed for security reasons.
                      </p>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          disabled
                          className="h-11 rounded-lg bg-muted pl-10 text-muted-foreground"
                          {...profileForm.register("email")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="role"
                          disabled
                          className="h-11 rounded-lg bg-muted pl-10 text-muted-foreground"
                          {...profileForm.register("role")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">
                        Short Bio{" "}
                        <span className="font-normal text-muted-foreground">
                          (Optional)
                        </span>
                      </Label>

                      <Textarea
                        id="bio"
                        rows={4}
                        placeholder="Write a few sentences about yourself."
                        className="resize-none rounded-lg bg-background"
                        {...profileForm.register("bio")}
                      />
                    </div>
                  </div>
                </CardContent>

                <Separator />

                <div className="flex justify-end gap-3 px-6 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-lg px-6"
                    onClick={() => profileForm.reset()}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                    className="h-10 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {profileForm.formState.isSubmitting
                      ? "Saving..."
                      : "Save Profile"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-0">
            <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border px-6 py-5">
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay
                  secure.
                </CardDescription>
              </CardHeader>

              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                <CardContent className="grid gap-8 px-6 py-6 lg:grid-cols-[1fr_0.7fr]">
                  <div className="space-y-5">
                    <PasswordField
                      id="currentPassword"
                      label="Current Password"
                      placeholder="Enter current password"
                      showPassword={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword((prev) => !prev)}
                      register={passwordForm.register("currentPassword")}
                      error={
                        passwordForm.formState.errors.currentPassword?.message
                      }
                    />

                    <PasswordField
                      id="newPassword"
                      label="New Password"
                      placeholder="Enter new password"
                      showPassword={showNewPassword}
                      onToggle={() => setShowNewPassword((prev) => !prev)}
                      register={passwordForm.register("newPassword")}
                      error={passwordForm.formState.errors.newPassword?.message}
                    />

                    <PasswordField
                      id="confirmPassword"
                      label="Confirm New Password"
                      placeholder="Confirm new password"
                      showPassword={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((prev) => !prev)}
                      register={passwordForm.register("confirmPassword")}
                      error={
                        passwordForm.formState.errors.confirmPassword?.message
                      }
                    />
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/40 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Password Requirements</h3>
                      <Badge variant="outline" className="rounded-full bg-card">
                        Security
                      </Badge>
                    </div>

                    <div className="mt-5 space-y-4">
                      {passwordRequirements.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-3"
                        >
                          <CheckCircle2
                            className={
                              item.valid
                                ? "h-5 w-5 text-blue-600 dark:text-blue-400"
                                : "h-5 w-5 text-muted-foreground/40"
                            }
                          />

                          <span
                            className={
                              item.valid
                                ? "text-sm font-medium text-foreground"
                                : "text-sm text-muted-foreground"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <Separator />

                <div className="flex justify-end px-6 py-4">
                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                    className="h-10 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
                  >
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    {passwordForm.formState.isSubmitting
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
  register: UseFormRegisterReturn;
  error?: string;
};

function PasswordField({
  id,
  label,
  placeholder,
  showPassword,
  onToggle,
  register,
  error,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="h-11 rounded-lg bg-background pr-11"
          {...register}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
