const express = require("express");
const { getNotification, deleteNotifications, deleteNotification } = require("../controllers/notificationController");

const notificationRouter = express.Router();

notificationRouter
.get("/", getNotification)
.delete("/:id",deleteNotification)
.delete("/", deleteNotifications);

module.exports = notificationRouter;