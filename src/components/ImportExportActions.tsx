import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Shared parsing helpers for amounts (currencies)
export const cleanAmount = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[₹$,\s]/g, "").trim();
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
};

// Shared parsing helpers for dates (Excel serial date conversion)
export const cleanDate = (val: any): string => {
  if (!val) return new Date().toISOString().split("T")[0];
  
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return val.toISOString().split("T")[0];
    }
  }
  
  const num = Number(val);
  // Excel date numbers are generally between 20000 and 100000 (roughly years 1954 to 2173)
  if (!isNaN(num) && num > 20000 && num < 100000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }
  
  const str = String(val).trim();
  const date = new Date(str);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split("T")[0];
  }
  
  return new Date().toISOString().split("T")[0];
};

export interface ImportExportActionsProps {
  // Export configuration
  exportData: any[] | (() => any[]) | (() => Promise<any[]>);
  exportFileName: string;
  sheetName: string;
  showExport?: boolean;

  // Import configuration
  onImport?: (parsedRows: any[]) => Promise<void> | void;
  showImport?: boolean;
  importAccept?: string;

  // Styling & Layout
  variant?: "premium" | "table";
  importClassName?: string;
  exportClassName?: string;
  containerClassName?: string;

  // Labels
  importLabel?: string;
  exportLabel?: string;
}

export function ImportExportActions({
  exportData,
  exportFileName,
  sheetName,
  showExport = true,
  onImport,
  showImport = !!onImport,
  importAccept = ".xlsx, .xls, .csv",
  variant = "premium",
  importClassName,
  exportClassName,
  containerClassName,
  importLabel = "Import Excel",
  exportLabel = "Export Excel",
}: ImportExportActionsProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      // Wait for a brief timeout to allow loading animation to show (800ms)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const rawData = typeof exportData === "function" ? await exportData() : exportData;
      
      const worksheet = XLSX.utils.json_to_sheet(rawData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      
      XLSX.writeFile(workbook, exportFileName);
      toast.success(`${sheetName} exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${sheetName.toLowerCase()}`);
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        // set cellDates: true so that XLSX parses Excel dates automatically
        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (onImport) {
          await onImport(json);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset input file selection
        }
      } catch (error) {
        toast.error("Failed to import excel file");
        console.error(error);
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      toast.error("Failed to read the file");
    };
    reader.readAsBinaryString(file);
  };

  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", containerClassName)}>
      {showImport && onImport && (
        <>
          <input
            type="file"
            accept={importAccept}
            ref={fileInputRef}
            className="hidden"
            onChange={handleImport}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isImporting}
            className={cn(
              variant === "premium"
                ? "h-10 rounded-xl border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
                : "h-10 rounded-lg border-slate-200 gap-2 font-medium",
              importClassName
            )}
            onClick={triggerImportFile}
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : variant === "premium" ? (
              <Upload className="mr-2 h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4 text-blue-600" />
            )}
            {isImporting ? "Importing..." : importLabel}
          </Button>
        </>
      )}

      {showExport && (
        <Button
          type="button"
          variant="outline"
          disabled={isExporting}
          className={cn(
            variant === "premium"
              ? "h-10 rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
              : "h-10 rounded-lg border-slate-200 gap-2 font-medium",
            exportClassName
          )}
          onClick={handleExport}
        >
          {isExporting ? (
            <Loader2 className={cn("h-4 w-4 animate-spin", variant === "premium" ? "mr-2" : "text-emerald-600")} />
          ) : variant === "premium" ? (
            <Download className="mr-2 h-4 w-4" />
          ) : (
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          )}
          {isExporting ? "Exporting..." : exportLabel}
        </Button>
      )}
    </div>
  );
}
