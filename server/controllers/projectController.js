const TrendingProject = require("../models/TrendingProject");
const logActivity = require("../utils/logActivity");

exports.getProjects = async (_req, res) => {
  try {
    const projects = await TrendingProject.find().populate("property", "title priceLabel coverImage");
    res.json({ projects });
  } catch (error) {
    console.error("Failed to fetch projects", error.message);
    res.status(500).json({ message: "Failed to load projects" });
  }
};

exports.createProject = async (req, res) => {
  try {
    const project = await TrendingProject.create(req.body);

    await logActivity({
      user: req.user._id,
      action: "created-project",
      entityType: "TrendingProject",
      entityId: project._id,
      metadata: { name: project.name },
    });

    res.status(201).json({ project });
  } catch (error) {
    console.error("Failed to create project", error.message);
    res.status(500).json({ message: "Failed to create project" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await TrendingProject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await logActivity({
      user: req.user._id,
      action: "updated-project",
      entityType: "TrendingProject",
      entityId: project._id,
      metadata: { name: project.name },
    });

    res.json({ project });
  } catch (error) {
    console.error("Failed to update project", error.message);
    res.status(500).json({ message: "Failed to update project" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await TrendingProject.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    await logActivity({
      user: req.user._id,
      action: "deleted-project",
      entityType: "TrendingProject",
      entityId: project._id,
      metadata: { name: project.name },
    });

    res.json({ message: "Project deleted" });
  } catch (error) {
    console.error("Failed to delete project", error.message);
    res.status(500).json({ message: "Failed to delete project" });
  }
};
