const Comment = require("../models/comment");
const mongoose = require("mongoose");
const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      comment_content: req.body.comment_content,
      post_id: req.body.post_id,
      author: req.body.user_id,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json(err);
  }
};

const getComment = async (req, res) => {
  console.log(req.params.id);
  // console.log(await Comment.findOne({ _id: req.params.id }));
  const comment = await Comment.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "post_id",
        foreignField: "_id",
        as: "post",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "users",
      },
    },
  ]);
  console.log("Comment with User Lookup:", comment); // Log the result of the aggregation

  res.status(200).json(comment);
};
module.exports = { createComment, getComment };
