const {Schema , model}=require('mongoose');

const blogSchema=new Schema({
    title:{
        type:String,
        required:true
    },

    body:{
        type:String,
        required:true
    },

    coverimageURL:{
        type:String,
    },

    category: {
        type: String,
        default: 'Others',
        enum: ['Technology', 'Lifestyle', 'Education', 'Entertainment', 'Others', 'News', 'Gaming', 'Fitness']
    },

    createdBy:{
        type:Schema.Types.ObjectId,
        ref :'user'
    },
    likes:[{
        type:Schema.Types.ObjectId,
        ref: 'user'
    }]

},{timestamps:true});

const Blog=model("blog",blogSchema)

module.exports=Blog;