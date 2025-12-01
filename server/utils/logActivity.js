const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({ user, action, entityType, entityId, metadata }) => {
  try {
    await ActivityLog.create({
      user,
      action,
      entityType,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity", error.message);
  }
};

module.exports = logActivity;
