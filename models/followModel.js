const { LIMIT } = require('../privateConstants');
const followSchema = require('../schemas/followSchema');
const userSchema = require('../schemas/userSchema');

const followUser = ({ followerUserId, followingUserId }) => {
    return new Promise(async (resolve, reject) => {
        const followObj = new followSchema({
            followerUserId: followerUserId,
            followingUserId: followingUserId,
        });

        try {
            const followDb = await followObj.save();
            resolve(followDb);
        } catch (error) {
            reject(error);
        }
    });
};

const getFollowingList = ({ followerUserId, SKIP }) => {
    return new Promise(async (resolve, reject) => {
        //console.log(followerUserId)
        try {
            // const followDb = await followSchema
            //     .find({ followerUserId: followerUserId })
            //     .populate("followingUserId");

            const followingListDb = await followSchema.aggregate([
                {
                    $match: { followerUserId: followerUserId },
                },
                {
                    $sort: { creationDateTime: -1 },
                },
                {
                    $skip: SKIP,
                },
                {
                    $limit: LIMIT,
                }
            ]);

            // followingListDb.map(async (follow) => {
            //     console.log(follow.followingUserId);
            //     console.log(await userSchema.findOne({_id: follow.followingUserId}));
            // });


            const followingUserIdsArray = followingListDb.map(
                (follow) => follow.followingUserId
            );

            const followingUserDetails = await userSchema.find({ _id: { $in: followingUserIdsArray } });

            //  console.log(followingListDb);
            //  console.log(followingUserIdsArray);
            //  console.log(followingUserDetails);

            resolve(followingUserDetails.reverse());
        } catch (error) {
            reject(error);
        }
    });
};

const getFollowerList = ({ followingUserId, SKIP }) => {
    return new Promise(async (resolve, reject) => {
        console.log(followingUserId)
        try {
            const followerListDb = await followSchema.aggregate([
                {
                    $match: { followingUserId: followingUserId },
                },
                {
                    $sort: { creationDateTime: -1 },
                },
                {
                    $skip: SKIP,
                },
                {
                    $limit: LIMIT,
                },
            ]);

            // console.log(followerListDb);
        
            const followerUserIdsArray = followerListDb.map(
                (follow) => follow.followerUserId
            );

            const followerUserDetails = await userSchema.find({
                _id: { $in: followerUserIdsArray },
            });

            
            resolve(followerUserDetails.reverse());

        } catch (error) {
            reject(error);
        }
    });
};

const unfollow = ({ followerUserId, followingUserId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deleteDb = await followSchema.findOneAndDelete({ followerUserId, followingUserId })
            resolve(deleteDb);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    followUser,
    getFollowingList,
    getFollowerList,
    unfollow
}