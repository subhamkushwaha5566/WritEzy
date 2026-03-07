const { createHmac,randomBytes } = require('crypto');  //we can also write simple 'crypto'

const {Schema , model}=require('mongoose');
const { createTokenForUser } = require("../services/authentication");


const userSchema=new Schema({
    fullname:{
        type:String,
        required: true
    },
    email:{
         type:String,
        required: true,
        unique:true
    },
    salt:{
        type:String,
    },

    password:{
        type:String,
        required: true,
    },
    ProfileImageURL:{
        type:String,
        default:"/public/images/deafult.webp",
    },

    role:{
        type:String,
        enum:["USER", "ADMIN"],
        default:"USER"
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }]

},{timestamps: true})

userSchema.pre("save", function (next){
    const user =this;
    if(!user.isModified("password")) return;

    const salt=randomBytes(16).toString();
    const HashedPassword=createHmac('sha256',salt).update(user.password).digest('hex')

    this.salt=salt;
    this.password=HashedPassword;

    next();
})

 userSchema.static('matchPasswordAndGenerateToken', async function(email, password){
    const user = await this.findOne({email})
    if(!user) throw new Error('User not found!')

    const salt=user.salt;
    const HashedPassword=user.password;

    const userProvidedHash=createHmac('sha256',salt).update(password).digest('hex')

    if(HashedPassword!==userProvidedHash)  throw new Error('Incorrect Password!')

    const token=createTokenForUser(user);
    return token;

 })

const user=model('user',userSchema)

module.exports=user;