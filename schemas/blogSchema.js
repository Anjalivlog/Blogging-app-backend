const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minLength: 3,
        maxLength: 100,
    },
    textBody: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 1000,
    },
    creationDateTime: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    img: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletionDateTime: {
        type: String,
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "user",
        }
    ],
    comments: [
        {
            text: {
                type: String,
                required: true,
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: "user",
                required: true
            },
        },
    ],
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('blog', blogSchema);