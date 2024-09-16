const notificationSchema = require("../schemas/notification.Schema");

const getNotification = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const notification = await notificationSchema.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg"
        });
        await notificationSchema.updateMany({ to: userId }, { read: true });
        return res.send({
            status: 200,
            message: "successfully",
            data: notification,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

const deleteNotifications = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        await notificationSchema.deleteMany({ to: userId });
        return res.send({
            status: 200,
            message: "Notifications deleted successfully",
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.session.user.userId;
        const notification = await notificationSchema.findOne({ _id: notificationId });

        if(!notification) {
            return res.send({
                status: 404,
                message: "Notification not Found",
            });
        }
        if(notification.to !== userId) {
            return res.send({
                status: 403,
                message: "You are not allowed to delete this notification",
            });
        }
        await notificationSchema.findOneAndDelete({ _id: notificationId });
        return res.send({
            status: 200,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    getNotification,
    deleteNotifications,
    deleteNotification
}