const Property = require("../models/Property");
const logActivity = require("../utils/logActivity");

const buildFilters = (query) => {
  const filters = {};
  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { location: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.type) {
    filters.type = query.type;
  }
  if (query.location) {
    filters.location = query.location;
  }
  if (query.status) {
    filters.status = query.status;
  }
  if (query.minBeds) {
    filters.beds = { $gte: Number(query.minBeds) };
  }
  if (query.priceMin || query.priceMax) {
    filters.priceValue = {};
    if (query.priceMin) filters.priceValue.$gte = Number(query.priceMin);
    if (query.priceMax) filters.priceValue.$lte = Number(query.priceMax);
  }
  if (query.featured === "true") {
    filters.isFeatured = true;
  }
  if (query.exclude) {
    filters._id = { $ne: query.exclude };
  }
  return filters;
};

exports.getProperties = async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const sortMap = {
      "price-low": { priceValue: 1 },
      "price-high": { priceValue: -1 },
      beds: { beds: -1 },
      sqft: { sqftValue: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[req.query.sort] || {};

    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const propertiesQuery = Property.find(filters).sort(sort);
    if (limit) {
      propertiesQuery.limit(limit);
    }

    const properties = await propertiesQuery.exec();
    res.json({ properties });
  } catch (error) {
    console.error("Failed to fetch properties", error.message);
    res.status(500).json({ message: "Failed to load properties" });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json({ property });
  } catch (error) {
    console.error("Failed to fetch property", error.message);
    res.status(500).json({ message: "Failed to load property" });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      action: "created-property",
      entityType: "Property",
      entityId: property._id,
      metadata: { title: property.title },
    });

    res.status(201).json({ property });
  } catch (error) {
    console.error("Failed to create property", error.message);
    res.status(500).json({ message: "Failed to create property" });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await logActivity({
      user: req.user._id,
      action: "updated-property",
      entityType: "Property",
      entityId: property._id,
      metadata: { title: property.title },
    });

    res.json({ property });
  } catch (error) {
    console.error("Failed to update property", error.message);
    res.status(500).json({ message: "Failed to update property" });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await logActivity({
      user: req.user._id,
      action: "deleted-property",
      entityType: "Property",
      entityId: property._id,
      metadata: { title: property.title },
    });

    res.json({ message: "Property deleted" });
  } catch (error) {
    console.error("Failed to delete property", error.message);
    res.status(500).json({ message: "Failed to delete property" });
  }
};
