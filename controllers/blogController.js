const cloudinary = require('cloudinary').v2;
const blogDataValidation = require("../utils/blogUtils");
const { createBlog, getAllBlogs, getMyBlogs, getBlogWithId, editBlog, deleteBlog } = require("../models/blogModel");
const blogSchema = require('../schemas/blogSchema');
const notificationSchema = require('../schemas/notification.Schema');
const userSchema = require('../schemas/userSchema');
const followSchema = require('../schemas/followSchema');

const createBlogController = async (req, res) => {
    console.log(req.body);

    const { title, textBody } = req.body;
    let { img } = req.body;
    const userId = req.session.user.userId;
    console.log(typeof userId)

    //data validation
    try {
        await blogDataValidation({ title, textBody });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Invalid blog data",
            error: error,
        });
    }

    if (img) {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
    }

    try {
        const blogDb = await createBlog({ title, textBody, img, userId })
        return res.send({
            status: 201,
            message: "Blog created successfully",
            data: blogDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const getBlogController = async (req, res) => {

    const SKIP = parseInt(req.query.skip) || 0;

    //call a function which will read all the data from data base and return it to us
    try {
        const blogsDb = await getAllBlogs({ SKIP });

        if (blogsDb.length === 0) {
            return res.send({
                status: 204,
                message: "No more blogs"
            });
        }
        return res.send({
            status: 200,
            message: "Read Success",
            data: blogsDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const getMyBlogController = async (req, res) => {
    const userId = req.session.user.userId;
    console.log(userId);
    const SKIP = parseInt(req.query.skip) || 0;

    try {
        const blogDb = await getMyBlogs({ userId, SKIP });
        //console.log(blogDb);

        if (blogDb.length === 0) {
            return res.send({
                status: 204,
                message: "No more blogs"
            });
        }

        return res.send({
            status: 200,
            message: "Read Success",
            data: blogDb
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const editBlogController = async (req, res) => {
    //console.log(req.body);
    const { title, textBody, blogId } = req.body;
    const userId = req.session.user.userId;

    //data validation
    //find the blog
    //ownership
    //update the info
    try {
        await blogDataValidation({ title, textBody });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Invalid data",
            error: error,
        });
    }

    try {
        const blogDb = await getBlogWithId({ blogId });
        //console.log(blogDb);

        //console.log(userId.toString() === blogDb.userId.toString());
        if (!userId.equals(blogDb.userId)) {
            return res.send({
                status: 400,
                message: "Not allowed to edit the blog"
            });
        }

        //if i store time in date format 
        //console.log(blogDb.creationDateTime, new Date(Date.now()).getTime());

        //console.log(blogDb.creationDateTime, Date.now());


        //console.log((Date.now() - blogDb.creationDateTime) / (1000 * 60));
        const diff = (Date.now() - blogDb.creationDateTime) / (1000 * 60);

        if (diff > 30) {
            return res.send({
                status: 400,
                message: "Not able to edit after 30 mins of creation"
            });
        }

        const blogPrevDb = await editBlog({ title, textBody, blogId });
        //console.log(blogPrevDb)

        return res.send({
            status: 200,
            message: "blog updated successfully",
            data: blogPrevDb,
        });

    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const deleteBlogController = async (req, res) => {

    const { blogId } = req.body;
    const userId = req.session.user.userId;

    try {
        const blogDb = await getBlogWithId({ blogId });

        if (!userId.equals(blogDb.userId)) {
            return res.send({
                status: 403,
                message: "Not allowed to delete the blog",
            });
        }

        if (blogDb.img) {
            const imgId = blogDb.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        const blogPrevDb = await deleteBlog({ blogId });

        return res.send({
            status: 200,
            message: "blog deleted successfully",
            data: blogPrevDb,
        });
    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error,
        });
    }
}

const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const blogId = req.params.id;
        console.log(blogId)
        const userId = req.session.user.userId;
        console.log(blogId)
        if (!text) {
            return res.send({
                status: 400,
                message: "Text field is required",
            });
        }

        const blog = await blogSchema.findOne({ _id: blogId });
        console.log(blog);
        if (!blog) {
            return res.send({
                status: 404,
                message: "blog not found",
            });
        }

        const comment = { user: userId, text }
        blog.comments.push(comment);
        await blog.save();

        // const notification = new notificationSchema({
        //     from: userId,
        //     to: blog.userId,
        //     type: "like",
        // });

        // await notification.save();

        return res.send({
            status: 200,
            data: blog,
        });

    } catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: " Internal server error",
            error: error,
        });
    }
}

const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.session.user.userId;
        const { id: blogId } = req.params;

        const blog = await blogSchema.findOne({ _id: blogId });
        if (!blog) {
            return res.send({
                status: 404,
                message: "blog not found",
            });
        }

        const userLikedPost = blog.likes.includes(userId);
        if (userLikedPost) {
            //unlike post
            await blogSchema.updateOne({ _id: blogId }, { $pull: { likes: userId } });
            await userSchema.updateOne({ _id: userId }, { $pull: { likedBlogs: blogId }});
            const updatedLikes = blog.likes.filter((id) => id !== userId);
            return res.send({
                status: 200,
                message: "Post unliked successfully",
                data: updatedLikes,
            });
        } else {
            //like post
            blog.likes.push(userId);
            await userSchema.updateOne({ _id: userId }, { $push: { likedBlogs: blogId }});
            await blog.save();

            const notification = new notificationSchema({
                from: userId,
                to: blog.userId,
                type: "like",
            });

            await notification.save();
            const updatedLikes = blog.likes;
            return res.send({
                status: 200,
                message: "Post liked successfully",
                data: updatedLikes,
            });
        }

    } catch (error) {
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

const getLikedBlog = async (req, res) => {
    const userId = req.params.id;
    try {
        const userDb = await userSchema.findOne({ _id: userId });
        console.log(userDb)
        if (!userDb) {
            return res.send({
                status: 404,
                message: "User not found"
            });
        }

        const likedBlog = await blogSchema.find({ likes: userId, isDeleted: { $ne: true } })
            .populate({
                path: 'userId',
                select: '-password'
            }).populate({
                path: 'comments.user',
                select: '-password'
            }).exec();

        return res.send({
            status: 200,
            message: "likedBlogs",
            data: likedBlog,
        });

    } catch (error) {
        console.log(error);
        return res.send({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

// const getLikedPostsController = async (req, res) => {
//     const userId = req.params.userId; // Assuming userId is passed as a route parameter
//     const SKIP = parseInt(req.query.skip) || 0;
//     const LIMIT = 10; // Adjust limit based on your pagination needs

//     try {
//         // Find blogs where the userId exists in the likes array
//         const likedPosts = await blogSchema
//             .find({
//                 likes: userId,
//                 isDeleted: { $ne: true }
//             })
//             .sort({ creationDateTime: -1 })
//             .skip(SKIP)
//             .limit(LIMIT)
//             .populate({
//                 path: 'userId',
//                 select: '-password' // Exclude password from user details
//             })
//             .populate({
//                 path: 'comments.user',
//                 select: '-password' // Exclude password from user details
//             })
//             .exec();

//         if (likedPosts.length === 0) {
//             return res.status(204).json({
//                 status: 204,
//                 message: "No liked posts found"
//             });
//         }

//         return res.status(200).json({
//             status: 200,
//             message: "Liked posts fetched successfully",
//             data: likedPosts,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: 500,
//             message: "Internal server error",
//             error: error.message,
//         });
//     }
// };

const getFollowingBlogs = async (req, res) => {
    const userId = req.session.user.userId;
    try {
        const followingUsers = await followSchema.find({ followerUserId: userId }).select('followingUserId');
        console.log(followingUsers);
        const followingUserIds = followingUsers.map(user => user.followingUserId);
        console.log(followingUserIds);
        const followingBlogs = await blogSchema.find({ userId: { $in: followingUserIds }, isDeleted: { $ne: true } })
        .populate({
            path: 'userId',
            select: '-password' // Exclude password from user details
        })
        .populate({
            path: 'comments.user',
            select: '-password' // Exclude password from user details
        })
        .exec();
        console.log(followingBlogs);

        return res.status(200).json({
            status: 200,
            message: "Posts from following users fetched successfully",
            data: followingBlogs,
        });

    } catch (error) {
        console.error("Error fetching following posts:", error);
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    createBlogController,
    getBlogController,
    getMyBlogController,
    editBlogController,
    deleteBlogController,
    commentOnPost,
    likeUnlikePost,
    getLikedBlog,
    getFollowingBlogs
};