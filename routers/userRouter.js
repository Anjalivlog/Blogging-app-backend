const express = require('express');
const { getUserProfile, getSuggestedUsers, updateUser } = require('../controllers/userController');

const userRouter = express.Router();

userRouter
.get("/profile/:username", getUserProfile)
.get("/suggestion", getSuggestedUsers)
.post("/update", updateUser);

module.exports = userRouter;