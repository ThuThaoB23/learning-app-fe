"use client";

import { createPortal } from "react-dom";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/loading-overlay";
import {
  importVocabCsv,
  type VocabularyImportResultResponse,
} from "@/lib/admin-vocab-client";

type Status = {
  type: "success" | "error";
  message: string;
} | null;

type PreviewRow = {
  term: string;
  definition: string;
  language: string;
  definitionVi: string;
  examples: string;
  phonetic: string;
  partOfSpeech: string;
  topicIds: string;
  status: string;
};

const REQUIRED_COLUMNS = ["term", "definition", "language"] as const;

const detectDelimiter = (text: string) => {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const commaCount = firstLine.split(",").length;
  const semicolonCount = firstLine.split(";").length;
  const tabCount = firstLine.split("\t").length;

  if (semicolonCount > commaCount && semicolonCount >= tabCount) {
    return ";";
  }
  if (tabCount > commaCount && tabCount > semicolonCount) {
    return "\t";
  }
  return ",";
};

const parseCsvText = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(field);
      const hasData = row.some((value) => value.trim().length > 0);
      if (hasData) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    const hasData = row.some((value) => value.trim().length > 0);
    if (hasData) {
      rows.push(row);
    }
  }

  return rows;
};

const normalizeHeader = (header: string) =>
  header.replace(/^\uFEFF/, "").trim().toLowerCase();

const resolveColumnIndex = (
  indexes: Record<string, number>,
  keys: string[],
): number | undefined => {
  for (const key of keys) {
    const index = indexes[key];
    if (index !== undefined) {
      return index;
    }
  }
  return undefined;
};

const readCell = (
  values: string[],
  index?: number,
) => {
  if (index === undefined || index < 0 || index >= values.length) {
    return "";
  }
  return values[index]?.trim() ?? "";
};

export default function ImportVocabCsvModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] =
    useState<VocabularyImportResultResponse | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const missingRequiredColumns = useMemo(
    () =>
      REQUIRED_COLUMNS.filter(
        (column) => !headers.some((header) => header === column),
      ),
    [headers],
  );

  const canSubmit =
    selectedFile !== null &&
    missingRequiredColumns.length === 0 &&
    totalRows > 0 &&
    !parseError &&
    !isLoading;

  const resetState = () => {
    setStatus(null);
    setSelectedFile(null);
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setParseError(null);
    setImportResult(null);
    setHasSubmitted(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetState();
  };

  const handleFileChange = async (file: File | null) => {
    setSelectedFile(file);
    setStatus(null);
    setImportResult(null);
    setParseError(null);
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setHasSubmitted(false);

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setParseError("Vui lòng chọn file .csv");
      return;
    }

    try {
      const content = await file.text();
      const delimiter = detectDelimiter(content);
      const rows = parseCsvText(content, delimiter);
      if (rows.length === 0) {
        setParseError("File CSV trống.");
        return;
      }

      const csvHeaders = rows[0].map(normalizeHeader);
      const columnIndex: Record<string, number> = {};
      csvHeaders.forEach((header, index) => {
        columnIndex[header] = index;
      });

      const termIndex = resolveColumnIndex(columnIndex, ["term"]);
      const definitionIndex = resolveColumnIndex(columnIndex, [
        "definition",
        "deinition",
      ]);
      const languageIndex = resolveColumnIndex(columnIndex, ["language", "lang"]);
      const definitionViIndex = resolveColumnIndex(columnIndex, [
        "definitionvi",
        "definition_vi",
        "meaningvi",
        "meaning_vi",
      ]);
      const examplesIndex = resolveColumnIndex(columnIndex, [
        "examples",
        "example",
      ]);
      const phoneticIndex = resolveColumnIndex(columnIndex, ["phonetic", "ipa"]);
      const partOfSpeechIndex = resolveColumnIndex(columnIndex, [
        "partofspeech",
        "part_of_speech",
        "pos",
      ]);
      const topicIdsIndex = resolveColumnIndex(columnIndex, [
        "topicids",
        "topic_ids",
        "topics",
      ]);
      const statusIndex = resolveColumnIndex(columnIndex, ["status"]);

      const dataRows = rows.slice(1);
      const mappedPreview = dataRows.slice(0, 8).map((values) => ({
        term: readCell(values, termIndex),
        definition: readCell(values, definitionIndex),
        language: readCell(values, languageIndex),
        definitionVi: readCell(values, definitionViIndex),
        examples: readCell(values, examplesIndex),
        phonetic: readCell(values, phoneticIndex),
        partOfSpeech: readCell(values, partOfSpeechIndex),
        topicIds: readCell(values, topicIdsIndex),
        status: readCell(values, statusIndex),
      }));

      setHeaders(csvHeaders);
      setPreviewRows(mappedPreview);
      setTotalRows(dataRows.length);
    } catch {
      setParseError("Không thể đọc file CSV.");
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !canSubmit) {
      return;
    }

    setIsLoading(true);
    setStatus(null);
    setImportResult(null);
    setHasSubmitted(true);

    const result = await importVocabCsv(selectedFile);
    if (!result.ok) {
      setStatus({ type: "error", message: result.message });
      setIsLoading(false);
      return;
    }
    if (!result.data) {
      setStatus({ type: "error", message: "API không trả về kết quả import." });
      setIsLoading(false);
      return;
    }

    setImportResult(result.data);
    setStatus({
      type: "success",
      message: `Import hoàn tất: ${result.data.importedRows}/${result.data.totalRows} dòng thành công.`,
    });
    router.refresh();
    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/20"
      >
        Import CSV
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4 py-10">
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-sm"
                onClick={handleClose}
              />
              <div className="relative z-[131] w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(6,10,18,0.7)]">
                <LoadingOverlay show={isLoading} />
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#e7edf3]">
                      Import từ vựng từ CSV
                    </h2>
                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Cột bắt buộc: term, definition, language
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-[#e7edf3] transition hover:bg-white/10"
                  >
                    Đóng
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/60 p-4">
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(event) =>
                        handleFileChange(event.target.files?.[0] ?? null)
                      }
                      className="w-full text-sm text-[#e7edf3] file:mr-3 file:rounded-full file:border-0 file:bg-[#e7edf3] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#0b0f14] hover:file:bg-white"
                    />
                    {selectedFile ? (
                      <p className="mt-2 text-xs text-[#94a3b8]">
                        File: {selectedFile.name} ({totalRows} dòng dữ liệu)
                      </p>
                    ) : null}
                    {parseError ? (
                      <p className="mt-2 text-xs text-[#fb7185]">{parseError}</p>
                    ) : null}
                    {missingRequiredColumns.length > 0 ? (
                      <p className="mt-2 text-xs text-[#fb7185]">
                        Thiếu cột bắt buộc: {missingRequiredColumns.join(", ")}
                      </p>
                    ) : null}
                  </div>

                  {!hasSubmitted ? (
                    <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#e7edf3]">
                          Preview CSV (tối đa 8 dòng đầu)
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          Tổng dòng dữ liệu: {totalRows}
                        </p>
                      </div>

                      {previewRows.length === 0 ? (
                        <p className="text-sm text-[#64748b]">
                          Chưa có dữ liệu để preview.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                          <table className="min-w-[1000px] divide-y divide-white/10 text-xs">
                            <thead className="bg-[#0b0f14]/70 text-[#94a3b8]">
                              <tr>
                                <th className="px-3 py-2 text-left">term</th>
                                <th className="px-3 py-2 text-left">definition</th>
                                <th className="px-3 py-2 text-left">language</th>
                                <th className="px-3 py-2 text-left">definitionVi</th>
                                <th className="px-3 py-2 text-left">examples</th>
                                <th className="px-3 py-2 text-left">phonetic</th>
                                <th className="px-3 py-2 text-left">partOfSpeech</th>
                                <th className="px-3 py-2 text-left">topicIds</th>
                                <th className="px-3 py-2 text-left">status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10 text-[#e7edf3]">
                              {previewRows.map((row, index) => (
                                <tr key={`preview-row-${index}`}>
                                  <td className="px-3 py-2">{row.term || "—"}</td>
                                  <td className="px-3 py-2">{row.definition || "—"}</td>
                                  <td className="px-3 py-2">{row.language || "—"}</td>
                                  <td className="px-3 py-2">{row.definitionVi || "—"}</td>
                                  <td className="px-3 py-2">{row.examples || "—"}</td>
                                  <td className="px-3 py-2">{row.phonetic || "—"}</td>
                                  <td className="px-3 py-2">{row.partOfSpeech || "—"}</td>
                                  <td className="px-3 py-2">{row.topicIds || "—"}</td>
                                  <td className="px-3 py-2">{row.status || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {importResult?.errors && importResult.errors.length > 0 ? (
                    <div className="rounded-2xl border border-[#fb7185]/30 bg-[#fb7185]/10 p-4">
                      <p className="text-sm font-semibold text-[#fecdd3]">
                        Lỗi import ({importResult.failedRows} dòng)
                      </p>
                      <div className="mt-2 max-h-40 overflow-y-auto text-xs text-[#fecdd3]">
                        {importResult.errors.map((error, index) => (
                          <p key={`import-error-${error.row}-${index}`}>
                            Dòng {error.row}: {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {status ? (
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm ${
                        status.type === "success"
                          ? "bg-[#34d399]/15 text-[#34d399]"
                          : "bg-[#fb7185]/15 text-[#fb7185]"
                      }`}
                    >
                      {status.message}
                    </div>
                  ) : null}

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[#e7edf3] transition-all duration-200 ease-out hover:bg-white/10"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={!canSubmit}
                      className="rounded-full bg-[#e7edf3] px-4 py-2 text-sm font-semibold text-[#0b0f14] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading ? "Đang import..." : "Xác nhận import"}
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
