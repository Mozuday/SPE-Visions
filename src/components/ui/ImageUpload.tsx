import { useRef, useState } from "react";
import { AlertCircle, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";

import { uploadImage } from "../../lib/cloudinary";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: "courses" | "blogs" | "portfolio" | "services" | "misc";
  disabled?: boolean;
};

const ImageUpload = ({
  label,
  value,
  onChange,
  folder,
  disabled = false,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Allow choosing the same file again later
    event.target.value = "";

    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      onChange(await uploadImage(file, folder));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div className="flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-slate-400" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
          </button>

          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={disabled}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      <p className="mt-2 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB.</p>

      {error && (
        <p className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;