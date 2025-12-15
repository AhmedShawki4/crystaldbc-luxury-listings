const Investment = require("../models/Investment");
const InvestmentBox = require("../models/InvestmentBox");
const Property = require("../models/Property");
const logActivity = require("../utils/logActivity");

const computeExpectedProfit = (investment) => {
  if (investment.status === "Approved" && investment.paymentStatus === "Paid" && investment.roiPercentage > 0) {
    investment.expectedProfit = investment.investmentAmount * (investment.roiPercentage / 100);
  }
};

const advancePayoutDate = (investment) => {
  const base = investment.payoutDate ? new Date(investment.payoutDate) : new Date();
  base.setMonth(base.getMonth() + 1);
  investment.payoutDate = base;
};

const canManageInvestment = (user, investment) => {
  if (!user || !investment) return false;
  if (user.role === "admin") return true;
  return investment.user?.toString() === user._id.toString();
};

exports.createInvestment = async (req, res) => {
  try {
    const { investmentBoxId, investmentAmount, notes } = req.body;
    const parsedAmount = Number(investmentAmount);

    if (!investmentBoxId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Investment box and investment amount are required" });
    }

    const box = await InvestmentBox.findById(investmentBoxId);
    if (!box || box.isActive === false) {
      return res.status(404).json({ message: "Investment box not found" });
    }

    const minAmount = box.minInvestmentAmount || 0;
    if (minAmount > 0 && parsedAmount < minAmount) {
      return res.status(400).json({ message: `Minimum investment for this box is EGP ${minAmount.toLocaleString()}` });
    }

    const existing = await Investment.findOne({ user: req.user._id, investmentBox: investmentBoxId });
    if (existing) {
      return res.status(400).json({ message: "You already have an investment for this investment box" });
    }

    const investment = await Investment.create({
      user: req.user._id,
      investmentBox: box._id,
      investmentAmount: parsedAmount,
      roiPercentage: box.roiPercentage || 0,
      notes,
    });

    await investment.populate([
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
      { path: "user", select: "name email role phone" },
    ]);

    res.status(201).json({ investment });
  } catch (error) {
    console.error("Failed to create investment", error.message);
    res.status(500).json({ message: "Failed to create investment" });
  }
};

exports.getMyInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate([
        { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
        { path: "property", select: "title location coverImage priceLabel" },
      ]);

    res.json({ investments });
  } catch (error) {
    console.error("Failed to load investments", error.message);
    res.status(500).json({ message: "Failed to load investments" });
  }
};

exports.getInvestments = async (req, res) => {
  try {
    const { status, paymentStatus, search } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    const investments = await Investment.find(filters)
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "name email role phone" },
        { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
        { path: "property", select: "title location coverImage priceLabel" },
        { path: "increaseRequest.reviewedBy", select: "name email role phone" },
      ]);

    const filtered = search
      ? investments.filter((inv) => {
          const term = search.toLowerCase();
          return (
            inv.investmentBox?.name?.toLowerCase().includes(term) ||
            inv.property?.title?.toLowerCase().includes(term) ||
            inv.user?.name?.toLowerCase().includes(term) ||
            inv.user?.email?.toLowerCase().includes(term) ||
            inv.notes?.toLowerCase().includes(term) ||
            inv.increaseRequest?.note?.toLowerCase().includes(term)
          );
        })
      : investments;

    res.json({ investments: filtered });
  } catch (error) {
    console.error("Failed to fetch investments", error.message);
    res.status(500).json({ message: "Failed to fetch investments" });
  }
};

exports.getInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id).populate([
      { path: "user", select: "name email role phone" },
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
    ]);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.json({ investment });
  } catch (error) {
    console.error("Failed to fetch investment", error.message);
    res.status(500).json({ message: "Failed to fetch investment" });
  }
};

exports.updateInvestment = async (req, res) => {
  try {
    const allowedFields = [
      "investmentAmount",
      "status",
      "paymentStatus",
      "roiPercentage",
      "notes",
      "amountReceived",
      "payoutDate",
    ];
    const update = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    });

    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    const becamePaid = update.paymentStatus === "Paid" && investment.paymentStatus !== "Paid";

    Object.assign(investment, update);
    if (becamePaid) {
      advancePayoutDate(investment);
    }
    computeExpectedProfit(investment);
    await investment.save();
    await investment.populate([
      { path: "user", select: "name email role phone" },
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
    ]);

    res.json({ investment });
  } catch (error) {
    console.error("Failed to update investment", error.message);
    res.status(500).json({ message: "Failed to update investment" });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Payment amount must be greater than zero" });
    }

    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (!canManageInvestment(req.user, investment)) {
      return res.status(403).json({ message: "You cannot update this investment" });
    }

    investment.amountReceived += amount;

    if (investment.amountReceived <= 0) {
      investment.paymentStatus = "Not Paid";
    } else if (investment.amountReceived < investment.investmentAmount) {
      investment.paymentStatus = "Partially Paid";
    } else {
      investment.paymentStatus = "Paid";
      advancePayoutDate(investment);
    }

    computeExpectedProfit(investment);
    await investment.save();
    await investment.populate([
      { path: "user", select: "name email role phone" },
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
    ]);

    res.json({ investment });
  } catch (error) {
    console.error("Failed to add payment", error.message);
    res.status(500).json({ message: "Failed to add payment" });
  }
};

exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.json({ message: "Investment deleted" });
  } catch (error) {
    console.error("Failed to delete investment", error.message);
    res.status(500).json({ message: "Failed to delete investment" });
  }
};

exports.requestIncrease = async (req, res) => {
  try {
    const { additionalAmount, note } = req.body;
    const parsedAmount = Number(additionalAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Additional amount must be greater than zero" });
    }

    const investment = await Investment.findById(req.params.id).populate([
      { path: "investmentBox", select: "name" },
      { path: "user", select: "name email role phone" },
    ]);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.user?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot request changes for this investment" });
    }

    if (investment.increaseRequest?.status === "Pending") {
      return res.status(400).json({ message: "You already have a pending increase request for this investment" });
    }

    investment.increaseRequest = {
      additionalAmount: parsedAmount,
      note: note ? String(note).trim() : undefined,
      status: "Pending",
      createdAt: new Date(),
    };

    await investment.save();

    await investment.populate([
      { path: "investmentBox", select: "name" },
      { path: "user", select: "name email role phone" },
    ]);

    await logActivity({
      user: req.user._id,
      action: "requested-investment-increase",
      entityType: "Investment",
      entityId: investment._id,
      metadata: { additionalAmount: parsedAmount },
    });

    res.status(201).json({ message: "Increase request sent", investment });
  } catch (error) {
    console.error("Failed to request investment increase", error.message);
    res.status(500).json({ message: "Failed to request increase" });
  }
};

exports.reviewIncreaseRequest = async (req, res) => {
  try {
    const { decision } = req.body;
    if (decision !== "approve" && decision !== "reject") {
      return res.status(400).json({ message: "Decision must be approve or reject" });
    }

    const investment = await Investment.findById(req.params.id).populate([
      { path: "user", select: "name email role phone" },
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
      { path: "increaseRequest.reviewedBy", select: "name email role phone" },
    ]);

    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }

    if (investment.increaseRequest?.status !== "Pending") {
      return res.status(400).json({ message: "No pending increase request to review" });
    }

    const additional = Number(investment.increaseRequest.additionalAmount) || 0;
    investment.increaseRequest.status = decision === "approve" ? "Approved" : "Rejected";
    investment.increaseRequest.reviewedAt = new Date();
    investment.increaseRequest.reviewedBy = req.user._id;

    if (decision === "approve") {
      investment.investmentAmount = (Number(investment.investmentAmount) || 0) + additional;

      // Re-evaluate payment status after increasing the required total.
      if (investment.amountReceived <= 0) {
        investment.paymentStatus = "Not Paid";
      } else if (investment.amountReceived < investment.investmentAmount) {
        investment.paymentStatus = "Partially Paid";
      } else {
        investment.paymentStatus = "Paid";
      }

      computeExpectedProfit(investment);
    }

    await investment.save();
    await investment.populate([
      { path: "user", select: "name email role phone" },
      { path: "investmentBox", select: "name description roiPercentage minInvestmentAmount" },
      { path: "property", select: "title location coverImage priceLabel" },
      { path: "increaseRequest.reviewedBy", select: "name email role phone" },
    ]);

    res.json({ investment });
  } catch (error) {
    console.error("Failed to review increase request", error.message);
    res.status(500).json({ message: "Failed to review increase request" });
  }
};
