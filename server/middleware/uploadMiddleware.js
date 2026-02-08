const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

/* ──────────────────────────────────────────────
   Decide storage backend based on env vars
   ────────────────────────────────────────────── */
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let storage;

if (useCloudinary) {
  /* ---------- Cloudinary (production / deployment) ---------- */
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "crystaldbc", // all uploads go under this folder in Cloudinary
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "svg"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    },
  });

  console.log("📷  Upload storage: Cloudinary");
} else {
  /* ---------- Local disk (development fallback) ---------- */
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeName = file.originalname
        .replace(ext, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      cb(null, `${Date.now()}-${safeName}${ext}`);
    },
  });

  console.log("📷  Upload storage: Local disk (set CLOUDINARY_* env vars for cloud storage)");
}

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
