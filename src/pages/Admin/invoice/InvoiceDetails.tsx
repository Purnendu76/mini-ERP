import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceStore } from "@/store/invoiceStore";
import { 
  ChevronLeft, 
  Download, 
  Mail, 
  Printer, 
  IndianRupee, 
  Calendar, 
  User, 
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Share2,
  MoreVertical,
  QrCode,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoiceById, markInvoiceAsPaid } = useInvoiceStore();
  const invoice = getInvoiceById(id || "");

  if (!invoice) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-red-50 p-6 dark:bg-red-950/20"
        >
          <AlertCircle className="h-12 w-12 text-red-500" />
        </motion.div>
        <h2 className="text-2xl font-bold">Invoice Not Found</h2>
        <p className="text-muted-foreground text-center max-w-xs">The invoice you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => navigate("/admin/invoices")} className="rounded-xl px-8">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid": return <CheckCircle2 className="mr-1 h-3.5 w-3.5" />;
      case "Pending": return <Clock className="mr-1 h-3.5 w-3.5" />;
      case "Overdue": return <AlertCircle className="mr-1 h-3.5 w-3.5" />;
      case "Cancelled": return <XCircle className="mr-1 h-3.5 w-3.5" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:border-emerald-500/30 ring-4 ring-emerald-500/5";
      case "Pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:border-amber-500/30 ring-4 ring-amber-500/5";
      case "Overdue": return "bg-red-500/10 text-red-600 border-red-500/20 dark:border-red-500/30 ring-4 ring-red-500/5";
      case "Cancelled": return "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:border-slate-500/30 ring-4 ring-slate-500/5";
      default: return "";
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20 relative">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />

      {/* Floating Action Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sticky top-[72px] z-20 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl p-3 rounded-2xl border border-white/40 dark:border-slate-800/40 shadow-lg ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/admin/invoices")}
            className="rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Exit View
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Current Status:</span>
            <Badge className={`rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm transition-all ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {invoice.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:scale-[1.02] transition-transform">
            <Share2 className="mr-2 h-4 w-4 text-slate-500" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:scale-[1.02] transition-transform">
            <Printer className="mr-2 h-4 w-4 text-slate-500" />
            Print
          </Button>
          {invoice.status !== "Paid" ? (
            <Button 
              size="sm" 
              className="rounded-xl h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 font-bold px-6 hover:scale-[1.02] active:scale-95 transition-all"
              onClick={() => markInvoiceAsPaid(invoice.id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Collect Payment
            </Button>
          ) : (
            <Button 
              disabled
              size="sm" 
              className="rounded-xl h-9 bg-emerald-500/10 text-emerald-600 border border-emerald-200 font-bold px-6"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Fully Settled
            </Button>
          )}
        </div>
      </motion.div>

      {/* Main Premium Invoice */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="overflow-hidden rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-0">
            {/* Top Banner Gradient */}
            <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            
            <div className="px-12 py-16 space-y-16">
              {/* Logo & Basic Info */}
              <div className="flex flex-col md:flex-row justify-between gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-2xl shadow-blue-500/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                      <Building2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">ERP Cloud</h2>
                      <p className="text-[10px] font-black tracking-[0.2em] text-blue-600 dark:text-blue-400 uppercase opacity-80">Enterprise Management</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-2">
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tightest">
                      INVOICE
                    </h1>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-300 dark:text-slate-600">ID:</span>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">{invoice.invoiceNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-16 gap-y-8 bg-slate-50 dark:bg-slate-800/40 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/50">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Date of Issue</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                      <Calendar className="h-4 w-4 text-blue-500/70" />
                      {format(new Date(invoice.invoiceDate), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Payment Due</p>
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                      <Clock className="h-4 w-4 text-amber-500/70" />
                      {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total Outstanding</p>
                    <div className="flex items-center gap-2 text-3xl font-black text-slate-900 dark:text-white">
                      <IndianRupee className="h-6 w-6 text-emerald-500" />
                      {invoice.total.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid gap-16 md:grid-cols-2">
                <div className="relative p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100/50 dark:border-slate-800/50 overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <User size={120} />
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-blue-600/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Client Information</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{invoice.customerName}</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Mail className="h-4 w-4 text-blue-500/60" />
                        {invoice.customerEmail}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-6 group hover:border-blue-500/30 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-emerald-600/10 flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-emerald-600" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Scan & Pay</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">Use any UPI app to scan and settle this invoice instantly via secure portal.</p>
                    <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest cursor-pointer group-hover:underline">
                      View QR Code <ArrowUpRight size={10} />
                    </div>
                  </div>
                  <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-inner overflow-hidden">
                    <QrCode className="size-16 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Order Summary</h3>
                  <Badge variant="outline" className="rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 border-slate-200">
                    {invoice.items.length} Items Total
                  </Badge>
                </div>

                <div className="relative">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-slate-900 dark:border-slate-100 hover:bg-transparent">
                        <TableHead className="font-black text-slate-900 dark:text-white h-14 uppercase tracking-widest text-[11px]">Services / Description</TableHead>
                        <TableHead className="text-center font-black text-slate-900 dark:text-white h-14 uppercase tracking-widest text-[11px]">Quantity</TableHead>
                        <TableHead className="text-right font-black text-slate-900 dark:text-white h-14 uppercase tracking-widest text-[11px]">Unit Price</TableHead>
                        <TableHead className="text-right font-black text-slate-900 dark:text-white h-14 uppercase tracking-widest text-[11px]">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, index) => (
                        <TableRow key={index} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-slate-100 dark:border-slate-800 transition-colors">
                          <TableCell className="py-8">
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Service Code: {id?.slice(0, 4)}-{index}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-black">
                              {item.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-bold text-slate-600 dark:text-slate-400">
                            ₹{item.price.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-xl font-black text-slate-900 dark:text-white">
                              ₹{item.total.toLocaleString("en-IN")}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary Calculations */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="w-full md:max-w-xs space-y-6 bg-blue-50/30 dark:bg-blue-900/10 p-8 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Security Guarantee</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                    This invoice is digitally signed and encrypted. All payments are processed through secure 256-bit encrypted channels.
                  </p>
                  <div className="pt-4 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Encrypted Session Active</span>
                  </div>
                </div>

                <div className="w-full md:max-w-md space-y-4">
                  <div className="flex justify-between items-center px-4 py-2 text-slate-500">
                    <span className="text-xs font-black uppercase tracking-widest">Base Subtotal</span>
                    <span className="text-lg font-bold">₹{invoice.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2 text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-blue-500">Tax Levied</span>
                      <Badge variant="outline" className="text-[9px] font-black border-blue-200 bg-blue-50/50 text-blue-600">{invoice.taxRate}% GST</Badge>
                    </div>
                    <span className="text-lg font-bold">₹{invoice.tax.toLocaleString("en-IN")}</span>
                  </div>
                  
                  <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                  
                  <div className="relative overflow-hidden bg-slate-900 dark:bg-white rounded-3xl p-8 text-white dark:text-slate-900 shadow-2xl group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <IndianRupee size={120} />
                    </div>
                    <div className="relative z-10 flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Total Amount Payable</span>
                      <div className="flex items-center gap-2">
                        <span className="text-5xl font-black tracking-tighter">
                          ₹{invoice.total.toLocaleString("en-IN")}
                        </span>
                        <ArrowUpRight className="h-6 w-6 text-emerald-400 dark:text-emerald-500 animate-bounce" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature Area */}
              <div className="flex justify-between items-end pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-4 max-w-sm">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Terms & Conditions</h4>
                  <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                    1. All payments must be made within the due date stated above.<br/>
                    2. A late fee of 1.5% per month will be applicable on overdue invoices.<br/>
                    3. Goods once sold cannot be returned under any circumstances.
                  </p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="h-16 w-48 border-b-2 border-slate-900 dark:border-white relative group">
                    <span className="absolute bottom-1 right-2 text-[10px] font-black text-blue-600/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">Verified Signature</span>
                    {/* Placeholder for Signature Font */}
                    <span className="font-serif text-3xl italic text-slate-400 dark:text-slate-600 opacity-30 select-none">Auth Signature</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Premium Footer Graphic */}
            <div className="bg-slate-900 dark:bg-slate-100 py-6 px-12 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/50 dark:text-slate-500">Certified Authentic Document</span>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/30 dark:text-slate-400">
                Generated at {format(new Date(invoice.createdAt), "PPP p")} &bull; Cloud Token: {id?.toUpperCase()}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Design Note Animation */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-400"
      >
        Enterprise Cloud Identity System
      </motion.p>
    </div>
  );
}
