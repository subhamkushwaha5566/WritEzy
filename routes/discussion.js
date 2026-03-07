const { Router } = require("express");
const Discussion = require("../models/discussion");

const router = Router();

// Render discussion board
router.get("/", async (req, res) => {
  try {
    const messages = await Discussion.find({})
        .sort({ createdAt: -1 })
        .populate("createdBy", "fullname ProfileImageURL profileImageURL email")
        .populate({
            path: 'replyToMessage',
            populate: { path: 'createdBy', select: "fullname ProfileImageURL profileImageURL" }
        });
        
    return res.json({
      messages: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Post a new message
router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  
  try {
    const { content, replyToId } = req.body;
    const newMessage = await Discussion.create({
      content,
      createdBy: req.user._id,
      replyToMessage: replyToId || null
    });
    return res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
