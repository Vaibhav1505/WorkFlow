const mongoose = require('mongoose')
const User = require('../schema/userSchema')

exports.user_signup = async function (req, res, next) {
    User.find({ email: email }).then().catch((err) => {
        res.status(500).json({
            message: "Unable to Signup"
        })
    })
}