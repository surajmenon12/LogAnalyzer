"use client";

import { useState } from "react";
import { Download, Trash2, Upload, AlertCircle, CheckCircle } from "lucide-react";
import { FileUpload } from "@/components/upload/FileUpload";
import { DataTable, Column } from "@/components/data/DataTable";
import { MetricCard } from "@/components/cards/MetricCard";
import { uploadFile, previewFile, clearData, getTemplateUrl } from "@/lib/api";

type LogType = "calls" | "messages";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface PreviewData {
  total_rows: number;
  valid_rows: number;
  errors: ImportError[];
  preview: Record<string, unknown>[];
}

interface ImportResultData {
  total_rows: number;
  imported_rows: number;
  skipped_rows: number;
  errors: ImportError[];
}

const LOG_TYPE_LABELS: Record<LogType, string> = {
  calls: "Call Logs",
  messages: "Message Logs",
};

const PREVIEW_COLUMNS: Record<LogType, Column[]> = {
  calls: [
    { key: "from_number", label: "From" },
    { key: "to_number", label: "To" },
    { key: "direction", label: "Direction" },
    { key: "status", label: "Status" },
    { key: "duration", label: "Duration" },
    { key: "region", label: "Region" },
    { key: "carrier", label: "Carrier" },
    { key: "initiated_at", label: "Initiated At" },
  ],
  messages: [
    { key: "from_number", label: "From" },
    { key: "to_number", label: "To" },
    { key: "direction", label: "Direction" },
    { key: "status", label: "Status" },
    { key: "message_type", label: "Type" },
    { key: "units", label: "Units" },
    { key: "region", label: "Region" },
    { key: "carrier", label: "Carrier" },
    { key: "sent_at", label: "Sent At" },
  ],
};

const ERROR_COLUMNS: Column[] = [
  { key: "row", label: "Row" },
  { key: "field", label: "Field" },
  { key: "message", label: "Error" },
];

export default function ImportPage() {
  const [logType, setLogType] = useState<LogType>("calls");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const resetState = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleTypeChange = (type: LogType) => {
    setLogType(type);
    resetState();
  };

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const data = await previewFile(selectedFile, logType);
      setPreview(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to preview file";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const data = await uploadFile(file, logType);
      setResult(data);
      setPreview(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to import file";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setLoading(true);
    setError(null);

    try {
      await clearData(logType);
      setShowClearConfirm(false);
      resetState();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to clear data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Log Type Tabs */}
      <div className="flex gap-2">
        {(Object.keys(LOG_TYPE_LABELS) as LogType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              logType === type
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {LOG_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Upload & Template Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            Upload {LOG_TYPE_LABELS[logType]}
          </h3>
          <div className="flex gap-2">
            <a
              href={getTemplateUrl(logType)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Download size={14} />
              Download Template
            </a>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
              Clear Existing Data
            </button>
          </div>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          selectedFile={file}
          onClear={resetState}
        />
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Clear All Data?</h4>
                <p className="text-sm text-gray-500">
                  This will delete all {LOG_TYPE_LABELS[logType].toLowerCase()} from the database.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Clearing..." : "Clear Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && !showClearConfirm && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-gray-500">Processing file...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Import Result */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <h3 className="text-base font-semibold text-gray-900">Import Complete</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Total Rows" value={result.total_rows} />
            <MetricCard
              title="Imported"
              value={result.imported_rows}
              trendColor="green"
              trend="up"
            />
            <MetricCard
              title="Skipped"
              value={result.skipped_rows}
              trendColor={result.skipped_rows > 0 ? "red" : "gray"}
              trend={result.skipped_rows > 0 ? "down" : "neutral"}
            />
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Validation Errors ({result.errors.length})
              </h4>
              <DataTable columns={ERROR_COLUMNS} data={result.errors} />
            </div>
          )}
          <button
            onClick={resetState}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload size={14} />
            Upload Another File
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && !result && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Preview ({preview.valid_rows} of {preview.total_rows} rows valid)
            </h3>
            <button
              onClick={handleImport}
              disabled={preview.valid_rows === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={14} />
              Import {preview.valid_rows} Rows
            </button>
          </div>

          {preview.preview.length > 0 && (
            <DataTable
              columns={PREVIEW_COLUMNS[logType]}
              data={preview.preview}
            />
          )}

          {preview.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Validation Errors ({preview.errors.length})
              </h4>
              <DataTable columns={ERROR_COLUMNS} data={preview.errors} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
