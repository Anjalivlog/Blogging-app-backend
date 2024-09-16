const blogDataValidation = ({ title, textBody }) => {
    return new Promise((resolve, reject) => {
        if (!title || !textBody) reject("Missing blog data");
        if (typeof title !== "string") reject("Title is not a text");
        if (typeof textBody !== "string") reject("TextBody is not a string");

        resolve();
    });
};

module.exports = blogDataValidation;