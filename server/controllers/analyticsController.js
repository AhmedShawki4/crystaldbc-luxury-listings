const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Message = require("../models/Message");
const User = require("../models/User");
const WishlistItem = require("../models/WishlistItem");

exports.getSummary = async (_req, res) => {
  try {
    const [propertyCount, leadCount, messageCount, userCount, wishlistCount, recentLeads] =
      await Promise.all([
        Property.countDocuments(),
        Lead.countDocuments(),
        Message.countDocuments(),
        User.countDocuments(),
        WishlistItem.countDocuments(),
        Lead.find().sort({ createdAt: -1 }).limit(5),
      ]);

    res.json({
      stats: {
        properties: propertyCount,
        leads: leadCount,
        messages: messageCount,
        users: userCount,
        wishlistItems: wishlistCount,
      },
      recentLeads,
    });
  } catch (error) {
    console.error("Failed to fetch analytics", error.message);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
