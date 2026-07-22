"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileUp, Download, Users, DollarSign, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface ImportHistory {
  id: number;
  filename: string;
  type: string;
  status: string;
  rowsProcessed: number;
  errors: number;
  createdAt: string;
}

interface ImportError {
  row: number;
  message: string;
}

export default function ImportPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [errorDetails, setErrorDetails] = useState<Record<number, ImportError[]>>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/import/history");
      setHistory(res.data?.content ?? res.data ?? []);
    } catch {
      toast.error("Failed to load import history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  const downloadTemplate = async (type: string) => {
    const path = `/templates/${type}-template.csv`;
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Template not found");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-template.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Template file is missing. Please try again later.");
    }
  };

  const handleUpload = async (type: string, file: File) => {
    setUploading(type);
    setProgress(0);
    const fd = new FormData();
    fd.append("file", file);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      await api.post(`/import/${type}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProgress(100);
      toast.success(`${type} import completed successfully`);
      fetchHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to import ${type}`);
    } finally {
      clearInterval(progressInterval);
      setUploading(null);
      setProgress(0);
    }
  };

  const handleFileDrop = useCallback(
    (type: string, e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(type, file);
    },
    []
  );

  const handleFileSelect = useCallback(
    (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(type, file);
    },
    []
  );

  const toggleErrors = async (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      if (!errorDetails[id]) {
        try {
          const res = await api.get(`/import/${id}/errors`);
          setErrorDetails((prev) => ({ ...prev, [id]: res.data }));
        } catch {
          toast.error("Failed to load error details");
        }
      }
    }
    setExpandedRows(newExpanded);
  };

  const statusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      COMPLETED: "default",
      FAILED: "destructive",
      PROCESSING: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const importCards = [
    {
      type: "members",
      title: "Members",
      description: "Import member records from CSV",
      icon: Users,
      color: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      type: "donations",
      title: "Donations",
      description: "Import donation records from CSV",
      icon: DollarSign,
      color: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      type: "expenses",
      title: "Expenses",
      description: "Import expense records from CSV",
      icon: Receipt,
      color: "bg-red-100 dark:bg-red-900/30",
      iconColor: "text-red-600 dark:text-red-400",
    },
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Bulk Import</h2>
        <p className="text-muted-foreground">Import data from CSV files in bulk</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {importCards.map((card) => (
          <Card key={card.type}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center hover:bg-muted/50 transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(card.type, e)}
              >
                <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a CSV file here, or
                </p>
                <label className="mt-2 cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:underline">
                    browse files
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => handleFileSelect(card.type, e)}
                  />
                </label>
              </div>

              {uploading === card.type && (
                <div className="space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 100 ? "Uploading..." : "Complete!"}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => downloadTemplate(card.type)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Template
                </Button>
                <Button
                  className="flex-1"
                  disabled={uploading !== null}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".csv";
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(card.type, file);
                    };
                    input.click();
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Filename</th>
                    <th className="p-4 text-left font-medium">Type</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Rows Processed</th>
                    <th className="p-4 text-left font-medium">Errors</th>
                    <th className="p-4 text-left font-medium">Date</th>
                    <th className="p-4 text-left font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{h.filename}</td>
                      <td className="p-4 capitalize">{h.type}</td>
                      <td className="p-4">{statusBadge(h.status)}</td>
                      <td className="p-4">{h.rowsProcessed}</td>
                      <td className="p-4">
                        {h.errors > 0 ? (
                          <span className="text-red-600 font-medium">{h.errors}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                      <td className="p-4">{new Date(h.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        {h.errors > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleErrors(h.id)}
                          >
                            {expandedRows.has(h.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            Errors
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No import history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
