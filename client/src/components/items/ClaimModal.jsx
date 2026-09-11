import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";
import { claimsApi } from "../../api/claims.api";
import { UploadCloud, File, Info } from "lucide-react";

// Modal dialog for claiming ownership of a lost/found item
export default function ClaimModal({ open, onClose, item, onSuccess }) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (description.trim().length < 5) {
      toast.error("Please describe your proof (min 5 characters)");
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("itemId", item.id);
      form.append("proofDescription", description);
      files.forEach((f) => form.append("proofImages", f));
      await claimsApi.create(form);
      toast.success("Claim submitted successfully");
      setDescription("");
      setFiles([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Claim ownership of "${item.title}"`}
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 leading-relaxed">
          <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
          <p>
            Please provide unique markers, serial codes, physical details, receipts, or approximate date/time to verify your ownership.
          </p>
        </div>

        <div>
          <label className="label">Proof Description</label>
          <textarea
            className="input min-h-[110px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe unique features, markings, serial number, when lost..."
          />
          <p className="mt-1 text-[11px] text-zinc-400">
            Minimum 5 characters required.
          </p>
        </div>

        <div>
          <label className="label">Upload Proof Attachments (optional, max 5)</label>
          <label className="flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:border-zinc-300">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) =>
                setFiles(Array.from(e.target.files ?? []).slice(0, 5))
              }
            />

            <UploadCloud className="h-5 w-5 text-zinc-400 mb-1" />
            <span className="font-medium text-xs text-zinc-800">
              Click to upload receipts or matching photos
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">
              PNG, JPG up to 5 images
            </span>
          </label>

          {files.length > 0 && (
            <div className="mt-2.5 space-y-1">
              <p className="text-[11px] font-medium text-zinc-500">
                Attached files ({files.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-700"
                  >
                    <File className="h-3.5 w-3.5 text-zinc-400" />
                    <span className="truncate max-w-[120px]">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Claim"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
