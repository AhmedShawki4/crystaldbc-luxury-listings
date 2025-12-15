const RentalRequest = require("../models/RentalRequest");
const Property = require("../models/Property");

const PAY_PERIODS = ["day", "month", "year"];

exports.createRentalRequest = async (req, res) => {
  try {
    const { propertyId, payPeriod, startDate, notes } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.status !== "For Rent") {
      return res.status(400).json({ message: "This property is not available for rent" });
    }

    const selectedPayPeriod = payPeriod ?? property.rentPayPeriod ?? "month";
    if (!PAY_PERIODS.includes(selectedPayPeriod)) {
      return res.status(400).json({ message: "payPeriod must be day, month, or year" });
    }

    const start = startDate ? new Date(startDate) : undefined;
    if (startDate && Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "startDate is invalid" });
    }

    const existingPending = await RentalRequest.findOne({
      user: req.user._id,
      property: property._id,
      status: "Pending",
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a pending rental request for this property" });
    }

    const request = await RentalRequest.create({
      user: req.user._id,
      property: property._id,
      status: "Pending",
      payPeriod: selectedPayPeriod,
      priceValue: property.priceValue || 0,
      startDate: start,
      notes: notes ?? "",
    });

    await request.populate([
      { path: "user", select: "name email role phone" },
      { path: "property", select: "title location coverImage priceLabel priceValue rentPayPeriod status" },
    ]);

    res.status(201).json({ request });
  } catch (error) {
    console.error("Failed to create rental request", error.message);
    res.status(500).json({ message: "Failed to create rental request" });
  }
};

exports.getMyRentalRequests = async (req, res) => {
  try {
    const requests = await RentalRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate([{ path: "property", select: "title location coverImage priceLabel priceValue rentPayPeriod status" }]);

    res.json({ requests });
  } catch (error) {
    console.error("Failed to load rental requests", error.message);
    res.status(500).json({ message: "Failed to load rental requests" });
  }
};

exports.getRentalRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};
    if (status) filters.status = status;

    const requests = await RentalRequest.find(filters)
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "name email role phone" },
        { path: "property", select: "title location coverImage priceLabel priceValue rentPayPeriod status" },
      ]);

    const filtered = search
      ? requests.filter((reqItem) => {
          const term = String(search).toLowerCase();
          return (
            reqItem.property?.title?.toLowerCase().includes(term) ||
            reqItem.user?.name?.toLowerCase().includes(term) ||
            reqItem.user?.email?.toLowerCase().includes(term) ||
            reqItem.notes?.toLowerCase().includes(term)
          );
        })
      : requests;

    res.json({ requests: filtered });
  } catch (error) {
    console.error("Failed to fetch rental requests", error.message);
    res.status(500).json({ message: "Failed to fetch rental requests" });
  }
};

exports.updateRentalRequest = async (req, res) => {
  try {
    const allowedFields = ["status", "payPeriod", "priceValue", "startDate", "dueDate", "endDate", "notes"];
    const update = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (update.payPeriod !== undefined && !PAY_PERIODS.includes(update.payPeriod)) {
      return res.status(400).json({ message: "payPeriod must be day, month, or year" });
    }

    ["startDate", "dueDate", "endDate"].forEach((field) => {
      if (update[field] !== undefined && update[field] !== null && update[field] !== "") {
        const d = new Date(update[field]);
        if (Number.isNaN(d.getTime())) throw new Error(`${field} is invalid`);
        update[field] = d;
      }
    });

    if (update.priceValue !== undefined) {
      const price = Number(update.priceValue);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({ message: "priceValue must be a valid number" });
      }
      update.priceValue = price;
    }

    const request = await RentalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Rental request not found" });
    }

    Object.assign(request, update);

    if (request.startDate && request.dueDate && request.startDate > request.dueDate) {
      return res.status(400).json({ message: "dueDate must be after startDate" });
    }
    if (request.dueDate && request.endDate && request.dueDate > request.endDate) {
      return res.status(400).json({ message: "endDate must be after dueDate" });
    }

    await request.save();
    await request.populate([
      { path: "user", select: "name email role phone" },
      { path: "property", select: "title location coverImage priceLabel priceValue rentPayPeriod status" },
    ]);

    res.json({ request });
  } catch (error) {
    console.error("Failed to update rental request", error.message);
    res.status(500).json({ message: "Failed to update rental request" });
  }
};

exports.deleteRentalRequest = async (req, res) => {
  try {
    const request = await RentalRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Rental request not found" });
    }
    res.json({ message: "Rental request deleted" });
  } catch (error) {
    console.error("Failed to delete rental request", error.message);
    res.status(500).json({ message: "Failed to delete rental request" });
  }
};
