"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Download, AlertCircle } from "lucide-react";
import { exportTransactionsToCSV } from "@/actions/export-transactions";
import { importTransactionsFromCSV } from "@/actions/import-transactions";
import { cn } from "@/lib/utils";

interface ImportExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImportExportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ImportExportDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    failed: number;
    errors?: string[];
  } | null>(null);
  const [mode, setMode] = useState<"import" | "export" | null>(null);

  const downloadCSV = (csv: string, filename: string): void => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await exportTransactionsToCSV();
      if (result.success && result.csv) {
        const filename = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
        downloadCSV(result.csv, filename);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const result = await importTransactionsFromCSV(text);
      setImportResult({
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      });
      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({
        imported: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setMode(null);
    setImportResult(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetDialog();
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "import"
              ? "Импорт транзакций"
              : mode === "export"
                ? "Экспорт транзакций"
                : "Импорт / Экспорт"}
          </DialogTitle>
          <DialogDescription>
            {mode === null && "Выберите операцию для работы с транзакциями"}
          </DialogDescription>
        </DialogHeader>

        {mode === null && (
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={() => setMode("import")}
            >
              <Upload className="h-6 w-6" />
              <span>Импорт из CSV</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={handleExport}
              disabled={loading}
            >
              <Download className="h-6 w-6" />
              <span>Экспорт в CSV</span>
            </Button>
          </div>
        )}

        {mode === "import" && !importResult && (
          <div className="py-4">
            <Label htmlFor="csv-file" className="mb-2 block">
              Выберите CSV файл
            </Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground mt-2">
              CSV должен содержать поля: Date, Type, Amount, Description,
              Category
            </p>
          </div>
        )}

        {mode === "import" && importResult && (
          <div className="py-4 space-y-4">
            <div
              className={cn(
                "p-4 rounded-lg",
                importResult.failed === 0
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800",
              )}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">
                  {importResult.failed === 0
                    ? "Успешно импортировано"
                    : "Импорт завершён с ошибками"}
                </span>
              </div>
              <div className="mt-2">
                <p>
                  Импортировано: {importResult.imported}
                  {importResult.failed > 0 &&
                    `, Ошибок: ${importResult.failed}`}
                </p>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto text-sm text-destructive">
                {importResult.errors.map((error, i) => (
                  <p key={i}>{error}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === "export" && loading && (
          <div className="py-8 text-center">
            <p>Экспорт транзакций...</p>
          </div>
        )}

        <DialogFooter>
          {mode === "import" && !importResult && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setMode(null)}
            >
              Назад
            </Button>
          )}
          {importResult && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetDialog();
                onOpenChange(false);
              }}
            >
              Закрыть
            </Button>
          )}
          {!importResult && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetDialog();
                onOpenChange(false);
              }}
            >
              {t("common.cancel")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
