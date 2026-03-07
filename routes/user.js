const {Router} =require('express')
const User=require("../models/user")
const multer = require('multer');
const path = require('path');
const router=Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/images/avatars'));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});
const upload = multer({ storage: storage });
// Authentication routes
// GET /signin and GET /signup are removed because React handles frontend routing
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.matchPasswordAndGenerateToken(email, password);
    const userPayload = require('../services/authentication').validateToken(token);

    return res
      .cookie("token", token, { httpOnly: true, sameSite: 'none', secure: true })
      .json({ success: true, token, user: userPayload });
  } catch (error) {
    return res.status(401).json({ error: "Incorrect Email or Password" });
  }
});

router.post("/logout",(req,res)=>{
    res.clearCookie("token").json({ success: true, message: "Logged out successfully" });
})

router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    await User.create({ fullname, email, password });
    return res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

router.get("/profile/:id", async (req, res) => {
    try {
        const userProfile = await User.findById(req.params.id);
        if (!userProfile) return res.status(404).json({ error: "User not found" });

        const userBlogs = await require('../models/blog').find({ createdBy: userProfile._id }).sort({ createdAt: -1 });

        let totalLikesReceived = 0;
        userBlogs.forEach(blog => {
            totalLikesReceived += blog.likes.length;
        });

        return res.json({
            userProfile,
            blogs: userBlogs,
            totalLikes: totalLikesReceived
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/follow/:id", async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" });
        
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ error: "Cannot follow yourself" });
        }

        const currentUser = await User.findById(currentUserId);
        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
            return res.json({ success: true, isFollowing: false });
        } else {
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
            await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
            return res.json({ success: true, isFollowing: true });
        }
    } catch(err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/upload-avatar", upload.single("avatar"), async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }
        const profileImageUrl = `/avatars/${req.file.filename}`;
        await User.findByIdAndUpdate(req.user._id, { ProfileImageURL: profileImageUrl });
        
        const updatedUser = await User.findById(req.user._id);
        const token = await require('../services/authentication').createTokenForUser(updatedUser);
        
        return res
            .cookie("token", token, { httpOnly: true, sameSite: 'none', secure: true })
            .json({ success: true, user: updatedUser, token });
        
    } catch (err) {
        console.error("Avatar upload error", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports=router;