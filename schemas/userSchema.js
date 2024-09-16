const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 50,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    profileImg: {
        type: String,
        default: "",
    },
    coverImg: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    link: {
        type: String,
        default: "",
    },
    likedBlogs: [
        {
            type: Schema.Types.ObjectId,
            ref: "blog",
            default: [],
        },
    ]
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model("user", userSchema);