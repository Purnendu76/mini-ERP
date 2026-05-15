import { useState, useMemo } from "react";
import { 
  Search, 
  Calendar as CalendarIcon, 
  X, 
  Eye, 
  Filter, 
  Trash2,
  RefreshCcw,
  RotateCcw
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useAuditStore } from "@/store/auditStore";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";

export default function AuditLog() {
  const { logs, clearLogs } = useAuditStore();
  
  // Filter states
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchEntity = entityFilter === "all" || log.entity === entityFilter;
      const matchAction = actionFilter === "all" || log.action === actionFilter;
      
      let matchDate = true;
      if (dateRange?.from) {
        const logDate = parseISO(log.timestamp.replace(' ', 'T'));
        const start = startOfDay(dateRange.from);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchDate = isWithinInterval(logDate, { start, end });
      }
      
      return matchEntity && matchAction && matchDate;
    });
  }, [logs, entityFilter, actionFilter, dateRange]);

  const uniqueEntities = useMemo(() => Array.from(new Set(logs.map(l => l.entity))), [logs]);
  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);

  const handleResetFilters = () => {
    setEntityFilter("all");
    setActionFilter("all");
    setDateRange(undefined);
  };

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear all logs?")) {
      clearLogs();
      toast.success("All logs cleared");
    }
  };

  return (
    <div className="container mx-auto space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Audit Logs</h2>
        <p className="text-muted-foreground text-sm">Monitor system activities and user interactions across the application.</p>
      </div>

      {/* Filter Section - Fixed Alignment & Date Range */}
      <div className="flex flex-wrap items-center gap-6 bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entity</label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-slate-200 bg-slate-50/50">
              <SelectValue placeholder="Filter by Entity" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Entities</SelectItem>
              {uniqueEntities.map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Action</label>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px] h-10 rounded-lg border-slate-200 bg-slate-50/50">
              <SelectValue placeholder="Filter by Action" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Actions</SelectItem>
              {uniqueActions.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] h-10 justify-start text-left font-normal rounded-lg border-slate-200 bg-slate-50/50",
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
                  <span>Pick a date range</span>
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
        </div>

        <div className="flex items-center gap-2 ml-auto self-end pb-1">
          <Button 
            variant="secondary" 
            onClick={handleResetFilters}
            className="h-10 px-4 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border-none flex items-center gap-2 font-medium"
          >
            <RotateCcw size={16} />
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={handleClearLogs}
            className="h-10 px-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium"
          >
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Table Section - Matching SS */}
      <div className="rounded-xl border border-slate-200 bg-white dark:bg-card dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Timestamp</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Action</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Entity</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">User</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">IP Address</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4">Details</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCcw className="size-8 text-slate-300 animate-spin-slow" />
                    <span className="font-medium">No activity logs found matching your filters</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <TableCell className="text-sm font-medium text-slate-500 tabular-nums">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 hover:bg-purple-100 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-black text-slate-900 dark:text-slate-100 text-[13px] tracking-tight">
                    {log.entity}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.user.name}</span>
                      <span className="text-[11px] text-slate-400 font-medium">{log.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[12px]">Method:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.details.replace('Method: ', '')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-all"
                    >
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}