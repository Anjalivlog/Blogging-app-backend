const { followUser, getFollowingList, getFollowerList, unfollow } = require("../models/followModel");
const User = require("../models/userModel");
const notificationSchema = require("../schemas/notification.Schema");

const followUserController = async (req, res) => {

    const followingUserId = req.body.followingUserId;
    const followerUserId = req.session.user.userId;
    console.log(followingUserId);


    try {
        await User.findUserWithKey({ key: followingUserId });
    } catch (error) {
        return res.send({
            status: 400,
            message: "following user not found",
            error: error,
        });
    }

    try {
        await User.findUserWithKey({ key: followerUserId });
    } catch (error) {
        return res.send({
            status: 400,
            message: "follower user not found",
            error: error,
        });
    }

    try {
        const followDb = await followUser({ followerUserId, followingUserId });
        const newNotification = new notificationSchema({
            type: "follow",
            from: req.session.user.userId,
            to: followingUserId,     
        });
        await newNotification.save();
        return res.send({
            status: 201,
            message: "Follow successfull",
            data: followDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

const getFollowingListController = async (req, res) => {

    const followerUserId = req.session.user.userId;
    //console.log(followerUserId)
    const SKIP = Number(req.query.skip) || 0;

    try {
        const followingListDb = await getFollowingList({ followerUserId, SKIP });
        return res.send({
            status: 200,
            message: "Read success",
            data: followingListDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

const getFollowerListController = async (req, res) => {
    const followingUserId = req.session.user.userId;
    const SKIP = Number(req.query.skip) || 0;

    try {
        const followerListDb = await getFollowerList({ followingUserId, SKIP });
        console.log(followerListDb);

        return res.send({
            status: 200,
            message: "Read Success",
            data: followerListDb,
        });
    } catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

const unfollowController = async (req, res) => {
    const followingUserId = req.body.followingUserId; //userB
    const followerUserId = req.session.user.userId;//userA

    try {
        const deleteDB = await unfollow({ followerUserId, followingUserId })

        return res.send({
            status: 200,
            message: "Unfollow successfull",
            data: deleteDB,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
};

module.exports = {
    followUserController,
    getFollowingListController,
    getFollowerListController,
    unfollowController
}