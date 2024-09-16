const express = require("express");
const { createBlogController, getBlogController, getMyBlogController, editBlogController, deleteBlogController, commentOnPost, likeUnlikePost, getLikedBlog, getFollowingBlogs } = require("../controllers/blogController");

const blogRouter = express.Router();

blogRouter
    .post('/create-blog', createBlogController)
    .get('/get-blogs', getBlogController)
    .get('/get-myblogs', getMyBlogController)
    .get('/following', getFollowingBlogs)
    .get('/likes/:id', getLikedBlog)
    .post('/edit-blogs', editBlogController)
    .post('/delete-blogs', deleteBlogController)
    .post('/like/:id', likeUnlikePost)
    .post('/comment/:id', commentOnPost);


module.exports = blogRouter;
