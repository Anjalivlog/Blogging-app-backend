const express = require('express');
const { followUserController, getFollowingListController, getFollowerListController, unfollowController } = require('../controllers/followController');

const followRouter = express.Router();

followRouter
.post('/follow-user', followUserController)
.get('/following-list', getFollowingListController)
.get('/follower-list', getFollowerListController)
.post('/unfollow', unfollowController);



module.exports = followRouter;