const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    post_content: {
      type: String,
      required: [true, "Post Can Not Be Empty"],
    },
    createAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);
PostSchema.virtual("comments", {
  ref: "Comments",
  localField: "_id",
  foreignField: "post_id",
});
PostSchema.virtual("likes", {
  ref: "Likes",
  localField: "_id",
  foreignField: "post_id",
});
const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
