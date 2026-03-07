const { Schema, model } = require("mongoose");

const shortSchema = new Schema(
    {
        content: {
            type: String,
            required: true, // Shayari, poetry, or text description
        },
        mediaURL: {
            type: String,
            required: false, // Optional video, image, or audio
        },
        mediaType: {
            type: String,
            enum: ['image', 'video', 'audio', 'none'],
            default: 'none'
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "user"
        }]
    },
    { timestamps: true }
);

const Short = model("short", shortSchema);

module.exports = Short;
