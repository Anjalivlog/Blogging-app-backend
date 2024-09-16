const express = require("express");
const { registerController, loginController, logoutController, logoutAllDeviceController, getMe } = require("../controllers/authController");
const isAuth = require("../middlewares/isAuthMiddleware");
const authRouter = express.Router();

authRouter
    .post('/register', registerController)
    .post('/login', loginController)
    .post('/logout', isAuth, logoutController)
    .post('/logout_all_device', isAuth, logoutAllDeviceController)
    .get('/me', isAuth, getMe);

module.exports = authRouter; 