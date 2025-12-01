const WishlistItem = require("../models/WishlistItem");

exports.getWishlist = async (req, res) => {
  try {
    const items = await WishlistItem.find({ user: req.user._id }).populate("property");
    res.json({ items });
  } catch (error) {
    console.error("Failed to fetch wishlist", error.message);
    res.status(500).json({ message: "Failed to load wishlist" });
  }
};

exports.addWishlistItem = async (req, res) => {
  try {
    const existing = await WishlistItem.findOne({
      user: req.user._id,
      property: req.body.property,
    });

    if (existing) {
      return res.status(200).json({ item: existing });
    }

    const item = await WishlistItem.create({
      user: req.user._id,
      property: req.body.property,
      note: req.body.note,
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error("Failed to add wishlist item", error.message);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
};

exports.removeWishlistItem = async (req, res) => {
  try {
    const item = await WishlistItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.json({ message: "Wishlist item removed" });
  } catch (error) {
    console.error("Failed to remove wishlist item", error.message);
    res.status(500).json({ message: "Failed to remove wishlist item" });
  }
};
