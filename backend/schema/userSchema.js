const mongoose = require('mongoose');
const bcrypt= require('bcrypt')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String, 
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        enum:['Male','Female','Non Binary','Prefer not to say'],
        default:"Prefer not to say"
    },

})

userSchema.method.encryptedPassword=function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

userSchema.method.comparePassword=function(password){
    return bcrypt.compare(password,this.password)
}

const User = mongoose.model("User", userSchema)

module.exports= User;