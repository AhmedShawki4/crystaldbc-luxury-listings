const CMSSection = require("../models/CMSSection");
const logActivity = require("../utils/logActivity");

exports.getAllSections = async (_req, res) => {
  try {
    const sections = await CMSSection.find();
    res.json({ sections });
  } catch (error) {
    console.error("Failed to fetch CMS sections", error.message);
    res.status(500).json({ message: "Failed to load CMS content" });
  }
};

exports.getSection = async (req, res) => {
  try {
    const section = await CMSSection.findOne({ key: req.params.key });
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json({ section });
  } catch (error) {
    console.error("Failed to fetch CMS section", error.message);
    res.status(500).json({ message: "Failed to load section" });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const section = await CMSSection.findOneAndUpdate(
      { key: req.params.key },
      { content: req.body.content, updatedBy: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logActivity({
      user: req.user._id,
      action: "updated-cms",
      entityType: "CMSSection",
      entityId: section._id,
      metadata: { key: section.key },
    });

    res.json({ section });
  } catch (error) {
    console.error("Failed to update CMS section", error.message);
    res.status(500).json({ message: "Failed to update section" });
  }
};
