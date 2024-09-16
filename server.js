const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const cloudinary = require('cloudinary').v2;
const db = require("./db");
const cors = require("cors");
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
//file-inports
const authRouter = require("./routers/authRouter");
const blogRouter = require("./routers/blogRouter");
const isAuth = require("./middlewares/isAuthMiddleware");
const followRouter = require("./routers/followRouter");
const cleanUpBin = require("./cron");
const userRouter = require("./routers/userRouter");
const notificationRouter = require("./routers/notificationRouter");

const app = express();
const PORT = process.env.PORT;
const store = new mongodbSession({
    uri: process.env.MONGO_URI,
    collection: "sessions",
});

//app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json({limit:"5mb"}));
app.use(session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
}));

// file stroage
                    
// /auth/register
// /auth/login
app.use("/auth", authRouter);
app.use("/user", isAuth, userRouter);
app.use("/blog", isAuth, blogRouter)
app.use("/follow", isAuth, followRouter);
app.use("/mynotification", isAuth, notificationRouter);

app.listen(PORT, () => {
    console.log(clc.yellowBright.bold((`Server is running at PORT:${PORT}`)));
    cleanUpBin();
});