const {Router} =require('express')
const multer =require('multer')
const router=Router();
const path=require('path')
const { checkForAuthenticationCookie } = require('../middlewares/authentication');

const Blog=require('../models/blog')
const Comment=require('../models/comments')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/images/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName= `${Date.now()}-${file.originalname}`
    cb(null,fileName)
  },
})

const upload = multer({ storage: storage })

// Removed GET /add-new as frontend React will handle the Add New Blog form rendering

router.post('/ai-generate', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const aiPrompt = `You are an expert blog author. Write a highly engaging, structured, and informative blog post based on this topic: "${prompt}". 
        Return the response strictly as a JSON object with this exact format: {"title": "Catchy Title Here", "body": "Full body text formatted cleanly..."}. Do not wrap the JSON in markdown code blocks. Just valid JSON string.`;
        
        const response = await fetch(`https://text.pollinations.ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: aiPrompt }] })
        });
        
        let text = await response.text();
        
        // Aggressively strip markdown code blocks if the AI decided to include them despite instructions
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        // Look for the first genuine '{' bracket
        const jsonStartIndex = text.indexOf('{');
        const jsonEndIndex = text.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
            text = text.substring(jsonStartIndex, jsonEndIndex + 1);
        }
        
        const data = JSON.parse(text);
        return res.json({ success: true, title: data.title, body: data.body });
    } catch (err) {
        console.error("AI Generation Error:", err);
        return res.status(500).json({ error: "Failed to generate AI blog content." });
    }
});

router.get('/:id',async (req,res)=>{
    try {
        const blog= await Blog.findById(req.params.id).populate("createdBy", "fullname ProfileImageURL profileImageURL email");
        if (!blog) return res.status(404).json({ error: "Blog not found" });
        const comments= await Comment.find({blogId:req.params.id }).populate("createdBy", "fullname ProfileImageURL profileImageURL");
        
        return res.json({
          blog,
          comments,
        });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

router.post('/comment/:blogId',async (req,res)=>{
  try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const comment = await Comment.create({
        content:req.body.content,
        blogId:req.params.blogId,
        createdBy:req.user._id,
      });
      return res.status(201).json({ success: true, comment });
  } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
  }
})

router.post("/", checkForAuthenticationCookie("token"), upload.single("coverImage") ,async (req,res)=>{
   try {
       if (!req.user) return res.status(401).json({ error: "Unauthorized" });
       const {title, body, category} = req.body;
       const blog = await Blog.create({
        body,
        title,
        category: category || 'Others',
        createdBy: req.user._id,
        coverimageURL:`/uploads/${req.file.filename}`
       });
       return res.status(201).json({ success: true, blogId: blog._id });
   } catch (err) {
       return res.status(500).json({ error: "Internal Server Error" });
   }
})

router.post('/like/:id', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  
  const blogId = req.params.id;
  const userId = req.user._id;

  try {
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    let isLiked = false;
    if (blog.likes.includes(userId)) {
        blog.likes.pull(userId);
    } else {
        blog.likes.push(userId);
        isLiked = true;
    }
    await blog.save();
    return res.json({ success: true, likesCount: blog.likes.length, isLiked });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post('/delete/:id', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: "Blog not found" });

        if (blog.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: "You are not authorized to delete this blog" });
        }

        await Blog.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ blogId: req.params.id }); 
        return res.json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports=router;