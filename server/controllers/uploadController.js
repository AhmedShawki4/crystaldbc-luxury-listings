exports.handleImageUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const publicUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: publicUrl });
};
