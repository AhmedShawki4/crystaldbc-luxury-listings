const InvestmentBox = require("../models/InvestmentBox");

const ensureDefaultBox = async () => {
  const existing = await InvestmentBox.findOne({ isActive: true }).sort({ createdAt: 1 });
  if (existing) return existing;

  return InvestmentBox.create({
    name: "CrystalDBC Investment Box",
    description: "Invest and earn ROI based on the box terms.",
    roiPercentage: 12,
    minInvestmentAmount: 10000,
    isActive: true,
  });
};

exports.getInvestmentBoxes = async (_req, res) => {
  try {
    await ensureDefaultBox();
    const boxes = await InvestmentBox.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ boxes });
  } catch (error) {
    console.error("Failed to fetch investment boxes", error.message);
    res.status(500).json({ message: "Failed to load investment boxes" });
  }
};

exports.getAllInvestmentBoxes = async (_req, res) => {
  try {
    await ensureDefaultBox();
    const boxes = await InvestmentBox.find({}).sort({ createdAt: -1 });
    res.json({ boxes });
  } catch (error) {
    console.error("Failed to fetch investment boxes", error.message);
    res.status(500).json({ message: "Failed to load investment boxes" });
  }
};

exports.createInvestmentBox = async (req, res) => {
  try {
    const { name, description, roiPercentage, minInvestmentAmount, isActive } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const box = await InvestmentBox.create({
      name: name.trim(),
      description: description ?? "",
      roiPercentage: Number(roiPercentage) || 0,
      minInvestmentAmount: Number(minInvestmentAmount) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ box });
  } catch (error) {
    console.error("Failed to create investment box", error.message);
    res.status(500).json({ message: "Failed to create investment box" });
  }
};

exports.updateInvestmentBox = async (req, res) => {
  try {
    const update = {};
    ["name", "description", "roiPercentage", "minInvestmentAmount", "isActive"].forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (update.name) update.name = String(update.name).trim();
    if (update.roiPercentage !== undefined) update.roiPercentage = Number(update.roiPercentage) || 0;
    if (update.minInvestmentAmount !== undefined) update.minInvestmentAmount = Number(update.minInvestmentAmount) || 0;

    const box = await InvestmentBox.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!box) return res.status(404).json({ message: "Investment box not found" });

    res.json({ box });
  } catch (error) {
    console.error("Failed to update investment box", error.message);
    res.status(500).json({ message: "Failed to update investment box" });
  }
};

exports.deleteInvestmentBox = async (req, res) => {
  try {
    const box = await InvestmentBox.findByIdAndDelete(req.params.id);
    if (!box) return res.status(404).json({ message: "Investment box not found" });
    res.json({ message: "Investment box deleted" });
  } catch (error) {
    console.error("Failed to delete investment box", error.message);
    res.status(500).json({ message: "Failed to delete investment box" });
  }
};
