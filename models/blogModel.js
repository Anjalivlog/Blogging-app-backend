//const { text } = require("express");
const { LIMIT } = require("../privateConstants");
const blogSchema = require("../schemas/blogSchema");

const createBlog = ({ title, textBody, img, userId }) => {
    return new Promise(async (resolve, reject) => {
        const blogObj = new blogSchema({
            title: title,
            textBody: textBody,
            userId: userId,
            img: img,
            creationDateTime: Date.now(),
        });

        console.log(blogObj);

        try {
            const blogDb = await blogObj.save();
            resolve(blogDb);
        } catch (error) {
            reject(error);
        }
    });
}

const getAllBlogs = ({ SKIP }) => {
    return new Promise(async (resolve, reject) => {

        //aggregate -> Pagination (skip, limit), sort
        try {
            const blogDb = await blogSchema
                .find({ isDeleted: { $ne: true } })
                .sort({ creationDateTime: -1 })
                .skip(SKIP)
                .limit(LIMIT)
                .populate({
                    path: 'userId',
                    select: '-password' // Exclude password from user details
                })
                .populate({
                    path: 'comments.user',
                    select: '-password' // Exclude password from user details
                })
                .exec();
            // const blogDb = await blogSchema.aggregate([
            //     {
            //         $match: { isDeleted: { $ne: true } },
            //     },
            //     {
            //         $sort: { creationDateTime: -1 },  //DESc -1, ASCD 1
            //     },
            //      {
            //         $lookup: {
            //             from: 'users', // The collection name in MongoDB (usually the model name in lowercase and plural)
            //             localField: 'userId',
            //             foreignField: '_id',
            //             as: 'userDetails',
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: '$userDetails',
            //             preserveNullAndEmptyArrays: true // Keep documents even if there are no matches
            //         }
            //     },
            //     {
            //         $addFields: { // Embed userDetails content directly into userId
            //             userId: '$userDetails'
            //         }
            //     },
            //     {
            //         $project: { // Remove the userDetails field
            //             userDetails: 0,
            //             'userId.password': 0
            //         }
            //     },
            //     {
            //         $skip: SKIP,
            //     },
            //     {
            //         $limit: LIMIT,
            //     }
            // ]);
            console.log(blogDb)
            console.log("xsxs")
            resolve(blogDb)
        } catch (error) {
            reject(error);
        }

    });
}
const getMyBlogs = ({ userId, SKIP }) => {
    return new Promise(async (resolve, reject) => {

        //console.log(userId);

        try {
            const blogDb = await blogSchema.aggregate([
                {
                    $match: { userId: userId, isDeleted: { $ne: true } }, //DESc -1, ASCD 1
                },
                {
                    $sort: { creationDateTime: -1 }
                },
                {
                    $lookup: {
                        from: 'users', // The collection name in MongoDB (usually the model name in lowercase and plural)
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userDetails',
                    }
                },
                {
                    $unwind: {
                        path: '$userDetails',
                        preserveNullAndEmptyArrays: true // Keep documents even if there are no matches
                    }
                },
                {
                    $addFields: { // Embed userDetails content directly into userId
                        userId: '$userDetails'
                    }
                },
                {
                    $project: { // Remove the userDetails field
                        userDetails: 0,
                        'userId.password': 0
                    }
                },
                {
                    $skip: SKIP,
                },
                {
                    $limit: LIMIT,
                }
            ]);
            resolve(blogDb);
        } catch (error) {
            reject(error);
        }
    });
};

const getBlogWithId = ({ blogId }) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!blogId)
                reject("missing blogId");

            const blogDb = await blogSchema.findOne({ _id: blogId });
            //console.log(blogDb)

            if (!blogDb)
                reject(`Blog not found with blogId: ${blogId}`);

            resolve(blogDb);

        } catch (error) {
            reject(error);
        }
    })
};

const editBlog = ({ title, textBody, blogId }) => {
    return new Promise(async (resolve, reject) => {

        try {
            const blogPrevDb = await blogSchema.findOneAndUpdate(
                { _id: blogId },
                { title: title, textBody: textBody });
            resolve(blogPrevDb);
        } catch (error) {
            reject(error);
        }
    });
};

const deleteBlog = ({ blogId }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // const blogPrevDb = await blogSchema.findOneAndDelete({ _id: blogId });

            const blogPrevDb = await blogSchema.findOneAndUpdate({ _id: blogId },
                { isDeleted: true, deletionDateTime: Date.now() });

            resolve(blogPrevDb);
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    createBlog,
    getAllBlogs,
    getMyBlogs,
    getBlogWithId,
    editBlog,
    deleteBlog
}