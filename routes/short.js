const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const Short = require('../models/short');

const router = Router();

// Configure multer for shorts (handling images, videos, audio)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/shorts/`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

// POST: Create a new short
router.post('/', upload.single('media'), async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const { content, mediaType } = req.body;
        
        const shortData = {
            content,
            mediaType: mediaType || 'none',
            createdBy: req.user._id
        };

        if (req.file) {
            shortData.mediaURL = `/uploads/shorts/${req.file.filename}`;
            // If the client didn't specify mediaType but provided a file, try to guess
            if (shortData.mediaType === 'none') {
                if (req.file.mimetype.startsWith('video/')) shortData.mediaType = 'video';
                else if (req.file.mimetype.startsWith('audio/')) shortData.mediaType = 'audio';
                else if (req.file.mimetype.startsWith('image/')) shortData.mediaType = 'image';
            }
        }

        const newShort = await Short.create(shortData);
        // Populate author before returning
        await newShort.populate('createdBy', 'fullname profileImageURL ProfileImageURL');

        return res.status(201).json({ success: true, short: newShort });
    } catch (err) {
        console.error("Error creating short:", err);
        return res.status(500).json({ error: "Failed to create short" });
    }
});

// GET: All shorts for the feed
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;

        const totalShorts = await Short.countDocuments({});
        const totalPages = Math.ceil(totalShorts / limit);

        const shorts = await Short.find({})
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('createdBy', 'fullname profileImageURL ProfileImageURL');

        return res.status(200).json({ 
            success: true, 
            shorts,
            currentPage: page,
            totalPages
        });
    } catch (err) {
        console.error("Error fetching shorts:", err);
        return res.status(500).json({ error: "Failed to fetch shorts" });
    }
});

// POST: Toggle like
router.post('/like/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ error: "Authentication required" });

        const short = await Short.findById(req.params.id);
        if (!short) return res.status(404).json({ error: "Short not found" });

        const userId = req.user._id;
        const likeIndex = short.likes.indexOf(userId);

        if (likeIndex === -1) {
            short.likes.push(userId);
        } else {
            short.likes.splice(likeIndex, 1);
        }

        await short.save();
        return res.status(200).json({ success: true, likes: short.likes.length, isLiked: likeIndex === -1 });
    } catch (err) {
        return res.status(500).json({ error: "Failed to toggle like" });
    }
});

module.exports = router;
