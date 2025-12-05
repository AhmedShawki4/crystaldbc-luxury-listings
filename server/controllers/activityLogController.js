const ActivityLog = require("../models/ActivityLog");

exports.getActivityLogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit ?? "25", 10), 1), 100);
    const { userId, search } = req.query;

    const filter = {};
    if (userId) {
      filter.user = userId;
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      filter.$or = [{ action: regex }, { entityType: regex }, { entityId: regex }];
    }

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("user", "name email role"),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to load activity logs", error.message);
    res.status(500).json({ message: "Failed to load activity logs" });
  }
};
