exports.handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Cloudinary stores the full URL in req.file.path
  // Local disk stores only the filename in req.file.filename
  const publicUrl = req.file.path && req.file.path.startsWith("http")
    ? req.file.path           // Cloudinary URL
    : `/uploads/${req.file.filename}`; // local fallback

  res.status(201).json({ url: publicUrl });
};
