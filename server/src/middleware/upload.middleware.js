import multer from "multer";

const memoryStorage = multer.memoryStorage();

// Validates that the uploaded file has an image mimetype
const imageOnly = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files are allowed"));
    return;
  }
  cb(null, true);
};

// Configures Multer middleware for item images upload
export const uploadItemImages = multer({
  storage: memoryStorage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// Configures Multer middleware for claims proof images upload
export const uploadProofImages = multer({
  storage: memoryStorage,
  fileFilter: imageOnly,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

