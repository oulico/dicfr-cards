import { useState, useCallback, type DragEvent } from "react";
import type { ExportData } from "../lib/types";

interface Props {
  onImport: (data: ExportData) => void;
  hasData: boolean;
  dueCount: number;
  onStudy: () => void;
}

export function ImportScreen({ onImport, hasData, dueCount, onStudy }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      setError("");
      try {
        const text = await file.text();
        const data: ExportData = JSON.parse(text);
        if (data.version !== 1 || !Array.isArray(data.words)) {
          throw new Error("Invalid format");
        }
        onImport(data);
      } catch {
        setError("Invalid JSON file. Export from dicfr extension first.");
      }
    },
    [onImport]
  );

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="import-screen">
      {hasData && (
        <div className="study-prompt">
          {dueCount > 0 ? (
            <>
              <p className="due-count">{dueCount} cards due for review</p>
              <button type="button" className="btn-study" onClick={onStudy}>
                Study Now
              </button>
            </>
          ) : (
            <p className="all-done">All caught up! No cards due.</p>
          )}
        </div>
      )}

      <section
        className={`drop-zone ${dragging ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <p>{hasData ? "Import new words" : "Drop dicfr export here"}</p>
        <label className="file-label">
          or choose file
          <input
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </section>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
