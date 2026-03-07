const { Schema, model } = require("mongoose");

const discussionSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    replyToMessage: {
      type: Schema.Types.ObjectId,
      ref: "discussion",
      default: null
    }
  },
  { timestamps: true }
);

const Discussion = model("discussion", discussionSchema);

module.exports = Discussion;
