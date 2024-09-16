const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const followSchema = require('../schemas/followSchema');
const userSchema = require('../schemas/userSchema');

function isValidPassword(password) {
    const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
}

const getUserProfile = async (req, res) => {
    const { username } = req.params;
    console.log("hm gau");
    console.log(username)

    try {
        const user = await userSchema.findOne({ username });
        console.log(user);
        if (!user) {
            return res.send({
                status: 404,
                message: "User not Found",
            });
        }
        return res.send({
            status: 200,
            messag: "Read successfully",
            data: user,
        });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Error in getting user profile",
            error: error,
        });
    }

}

const getSuggestedUsers = async (req, res) => {
    const followerUserId = req.session.user.userId;
    try {
        const users = await userSchema.aggregate([
            {
                $match: {
                    _id: { $ne: followerUserId },
                },
            },
            { $sample: { size: 10 } },
            { $project: { password: 0 } },
        ]);
        const usersFollowedByMe = await followSchema.find({ followerUserId }).select("followingUserId");
        const followingUserIds = usersFollowedByMe.map(user => user.followingUserId.toString());
        // console.log(usersFollowedByMe);
        console.log(users);
        // console.log(followingUserIds);
        const filteredUsers = users.filter((user) => !followingUserIds.includes(user._id.toString()));
        const suggestedUsers = filteredUsers.slice(0, 5);
        //console.log(filteredUsers);
        //console.log(suggestedUsers);
        return res.send({
            status: 200,
            message: "Read success",
            data: suggestedUsers,
        });
    } catch (error) {
        console.log(error)
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const updateUser = async (req, res) => {
    const { name, username, email, password, newPassword, bio, link } = req.body;
    console.log( name, username, email, password, newPassword, bio, link)
    let { profileImg, coverImg } = req.body;
    const userId = req.session.user.userId;
    try {
        let userDb = await userSchema.findOne({ _id: userId }).select("+password");
        console.log(userDb)
        if (!userDb) {
            return res.send({
                status: 404,
                message: "User not found",
            });
        }
        

        if ((!password && newPassword) || (!newPassword && password) || (!newPassword && !password)) {
            return res.send({
                status: 400,
                message: "Please provide both current password and new password",
            });
        }

        // console.log(userDb)
        const isMatch = await bcrypt.compare(password, userDb.password);
        //const isMatch = await bcrypt.compare(password, userDb.password);
        if (!isMatch) {
            return res.send({
                status: 400,
                message: "Current password is wrong",
            });
        }
        if (!isValidPassword(newPassword)) {
            return res.send({
                status: 400,
                message: "invalid password",
            })
        };

        userDb.password = await bcrypt.hash(newPassword, Number(process.env.SALT));
        // console.log(newPassword);
        // console.log(password);
        if (profileImg) {
            if (userDb.profileImg) {
                await cloudinary.uploader.destroy(userDb.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if (coverImg) {
            if (userDb.coverImg) {
                await cloudinary.uploader.destroy(userDb.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        //update the user profile
        userDb.name = name || userDb.name;
        userDb.email = email || userDb.email;
        userDb.username = username || userDb.username;
        userDb.bio = bio || userDb.bio;
        userDb.link = link || userDb.link;
        userDb.profileImg = profileImg || userDb.profileImg;
        userDb.coverImg = coverImg || userDb.coverImg;


        userDb = await userDb.save();
        const userResponse = userDb.toObject();
        delete userResponse.password;

        console.log(userDb);
        return res.send({
            status: 200,
            message: "updated successfully",
            data: userResponse,
        });
    } catch (error) {
        console.log(error)
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}



module.exports = {
    getUserProfile,
    getSuggestedUsers,
    updateUser,
}