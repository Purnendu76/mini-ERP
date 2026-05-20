import { useParams, useNavigate } from "react-router-dom";
import { useExpenseStore } from "@/store/expenseStore";
import { useAuthStore } from "@/store/authStore";
import { 
  ChevronLeft, 
  ReceiptText, 
  IndianRupee, 
  Calendar, 
  User, 
  CreditCard,
  Edit3, 
  Trash2,
  Info,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ExpensesDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const rolePrefix = user?.role.toLowerCase() || "admin";
  const { getExpenseById } = useExpenseStore();
  const expense = getExpenseById(id || "");

  if (!expense) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <ReceiptText className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Expense not found</h2>
        <Button onClick={() => navigate(`/${rolePrefix}/expenses`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Expenses
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3" /> Approved</Badge>;
      case "Pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/${rolePrefix}/expenses`)}
            className="-ml-2 mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Expenses
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{expense.title}</h1>
            {getStatusBadge(expense.status)}
          </div>
          <p className="text-muted-foreground">Expense ID: {expense.id.slice(0, 8)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit3 className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Expense Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-blue-500" />
                  <p className="text-xl font-bold">₹{expense.amount.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="font-medium">{expense.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <p>{expense.paymentMethod}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expense Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p>{expense.expenseDate}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submission Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Submitted By</p>
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20">
                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold">
                  {expense.submittedBy.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{expense.submittedBy}</p>
                  <p className="text-xs text-muted-foreground">Member since 2024</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 pt-2">
              <p className="text-sm font-medium text-muted-foreground">System Entry</p>
              <p className="text-xs text-muted-foreground">Created on {new Date(expense.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
