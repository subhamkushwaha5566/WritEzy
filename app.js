require('dotenv').config()

const express=require('express');
const cors = require('cors');
const path=require('path')
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')

const Blog=require('./models/blog')

const userRoute=require("./routes/user");
const blogRoute=require("./routes/blog");
const discussionRoute=require("./routes/discussion");
const shortRoute=require("./routes/short");

const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const app=express();
const PORT=process.env.PORT || 5000;

 mongoose.connect(process.env.MONGO_URL).then(e => console.log(`mongodb connected`))

const allowedOrigins = [
    'https://writ-ezy.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
];

app.use(cors({ 
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public/images")))
app.use("/uploads", express.static(path.resolve("./public/uploads")))

app.get("/api/blogs", async (req , res)=>{
    try {
        const search = req.query.search || '';
        const category = req.query.category || 'All';
        const page = parseInt(req.query.page) || 1;
        const limit = 6; 

        const query = {};
        if (search) {
            query.title = { $regex: search, $options: 'i' }; 
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const totalBlogs = await Blog.countDocuments(query);
        const totalPages = Math.ceil(totalBlogs / limit);

        const allBlogs = await Blog.find(query)
                                   .sort({ createdAt: -1 })
                                   .skip((page - 1) * limit)
                                   .limit(limit)
                                   .populate("createdBy", "fullname ProfileImageURL profileImageURL email");

        return res.json({
            blogs: allBlogs,
            searchQuery: search,
            currentCategory: category,
            currentPage: page,
            totalPages: totalPages
        });
    } catch(err) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/api/feed", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    try {
        const currentUser = await require('./models/user').findById(req.user._id);
        const followingIds = currentUser.following || [];
        
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        
        const totalBlogs = await Blog.countDocuments({ createdBy: { $in: followingIds } });
        const totalPages = Math.ceil(totalBlogs / limit);
        
        const feedBlogs = await Blog.find({ createdBy: { $in: followingIds } })
                                   .sort({ createdAt: -1 })
                                   .skip((page - 1) * limit)
                                   .limit(limit)
                                   .populate("createdBy", "fullname ProfileImageURL profileImageURL email");

        return res.json({
            blogs: feedBlogs,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/api/help", (req, res) => {
    const { name, email, subject, message } = req.body;
    return res.json({ success: "Your query has been sent successfully! Our support team will get back to you soon." });
});

app.use("/api/user", userRoute);
app.use("/api/blog", blogRoute);
app.use("/api/discussion", discussionRoute);
app.use("/api/shorts", shortRoute);

app.listen(PORT ,()=> console.log(`Server is live at ${PORT}`))