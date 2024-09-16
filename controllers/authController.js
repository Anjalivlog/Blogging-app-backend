const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const User = require("../models/userModel");
const { userDataValidation } = require("../utils/authUtils");
const userSchema = require("../schemas/userSchema");

const registerController = async (req, res) => {
    // console.log('register working');

    const { name, username, email, password } = req.body;

    //data validation
    try {
        await userDataValidation({ name, username, email, password });
    } catch (error) {
        console.log(error)
        return res.send({
            status: 400,
            message: "Data invalid",
            error: error,
        })
    }

    //store user data
    const obj = new User({ name, username, email, password });

    try {
        const userDb = await obj.registerUser();
        console.log(userDb);

        return res.send({
            status: 201,
            message: "User registered successfully",
            data: userDb,
        });

    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

const loginController = async (req, res) => {
    console.log('login working');

    const { loginId, password } = req.body;

    if (!loginId || !password) {
        return res.send({
            status: 400,
            message: "Missing user credentials",
        });
    }

    // find the user

    try {
        const userDb = await User.findUserWithKey({ key: loginId });

        //compare the password

        const isMatch = await bcrypt.compare(password, userDb.password);

        if (!isMatch) {
            return res.send({
                status: 400,
                message: "Incorrect password",
            });
        }

        //jwt base
        //const token = jwt.sign({id: userDb._id}, process.env.SECRET_KEY);

        //session base
        console.log(req.session);
        req.session.isAuth = true;
        req.session.user = {
            username: userDb.username,
            email: userDb.email,
            userId: userDb._id,
        };

        return res.send({
            status: 200,
            message: "Login successfully",
        });
    } catch (error) {
        console.log(error)
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

const logoutController = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send({
                status: 500,
                message: "Unable to Logout",
            });
        }
        return res.send({
            status: 200,
            message: "Logout successfully",
        });
    });
}

const logoutAllDeviceController = async (req, res) => {

    const userId = req.session.user.userId;
    //create a session schema
    const sessionSchema = new Schema({ _id: String }, { strict: false });

    //convert into a model
    const sessionModel = mongoose.model('session', sessionSchema);
    //mongoose query to delete the entry

    try {
        const deleteDb = await sessionModel.deleteMany({ "session.user.userId": userId });
        return res.send({
            status: 200,
            message: `Logout from ${deleteDb.deletedCount} devices is successful`,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });

    }

}

const getMe = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        console.log(userId)
        const userDb = await userSchema.findOne({ _id: userId });
        console.log(userDb)
        return res.send({
            status: 200,
            data: userDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    logoutAllDeviceController,
    getMe
}