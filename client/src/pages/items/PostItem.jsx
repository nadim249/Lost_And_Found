import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { itemsApi } from "../../api/items.api";
import { UploadCloud, Trash2, ArrowLeft } from "lucide-react";

export default function PostItem() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("LOST");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const onDrop = (e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 5);
    setFiles(list);
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("type", type);
      form.append("location", location);
      files.forEach((f) => form.append("images", f));
      const res = await itemsApi.create(form);
      toast.success("Listing created successfully");
      if (res.data) navigate(`/items/${res.data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to listings</span>
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
          <div className="border-b border-zinc-100 pb-4 mb-5">
            <h1 className="text-base font-semibold text-zinc-900">Report an Item</h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              Provide clear details to help connect this listing to its owner.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Title</label>
              <input
                className="input"
                placeholder="E.g. Silver iPhone 13 Pro in clear case"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Listing Type</label>
                <select
                  className="input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="LOST">Lost Item (Looking for it)</option>
                  <option value="FOUND">Found Item (I found it)</option>
                </select>
              </div>

              <div>
                <label className="label">Category</label>
                <input
                  className="input"
                  placeholder="E.g. Electronics, Keys, Bags"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="E.g. Library 2nd Floor, Terminal B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-[90px]"
                placeholder="Distinctive features, colors, markings, date or approximate time..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={5}
              />
            </div>

            <div>
              <label className="label">Item Images (optional, max 5)</label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:border-zinc-300"
              >
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
                  Click to upload or drag &amp; drop
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5">
                  PNG, JPG up to 5 images
                </span>
              </label>

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Attached images ({files.length})
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 flex h-16 w-16"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt={`preview ${i}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
                          title="Remove image"
                          aria-label="Remove image"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full py-2.5 text-xs font-semibold"
                disabled={submitting}
              >
                {submitting ? "Publishing listing..." : "Publish Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
