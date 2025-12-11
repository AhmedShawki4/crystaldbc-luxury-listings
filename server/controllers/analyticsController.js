const Property = require("../models/Property");
const Lead = require("../models/Lead");
const Message = require("../models/Message");
const User = require("../models/User");
const WishlistItem = require("../models/WishlistItem");
const Investment = require("../models/Investment");

exports.getSummary = async (_req, res) => {
  try {
      const [propertyCount, leadCount, messageCount, userCount, wishlistCount, recentLeads, investmentAgg] =
        await Promise.all([
          Property.countDocuments(),
          Lead.countDocuments(),
          Message.countDocuments(),
          User.countDocuments(),
          WishlistItem.countDocuments(),
          Lead.find().sort({ createdAt: -1 }).limit(5),
          Investment.aggregate([
            {
              $facet: {
                totals: [
                  {
                    $group: {
                      _id: null,
                      totalReceived: { $sum: "$amountReceived" },
                      totalInvested: { $sum: "$investmentAmount" },
                    },
                  },
                ],
                investedProperties: [
                  { $match: { amountReceived: { $gt: 0 } } },
                  { $group: { _id: "$property" } },
                  { $count: "count" },
                ],
              },
            },
            {
              $project: {
                totalReceived: { $ifNull: [{ $arrayElemAt: ["$totals.totalReceived", 0] }, 0] },
                totalInvested: { $ifNull: [{ $arrayElemAt: ["$totals.totalInvested", 0] }, 0] },
                investedProperties: { $ifNull: [{ $arrayElemAt: ["$investedProperties.count", 0] }, 0] },
              },
            },
          ]),
        ]);

      const investmentSummary = investmentAgg?.[0] || { totalReceived: 0, totalInvested: 0, investedProperties: 0 };
      const actualProfit = investmentSummary.totalReceived || 0;
      const investedProperties = investmentSummary.investedProperties || 0;
      const totalInvested = investmentSummary.totalInvested || 0;

    res.json({
      stats: {
        properties: propertyCount,
        leads: leadCount,
        messages: messageCount,
        users: userCount,
        wishlistItems: wishlistCount,
          investedProperties,
          totalInvested,
        actualProfit,
      },
      recentLeads,
    });
  } catch (error) {
    console.error("Failed to fetch analytics", error.message);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};
