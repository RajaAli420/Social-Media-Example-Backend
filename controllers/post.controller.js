const { BAD_REQUEST } = require("http-status-codes");
const CustomAPIError = require("../errors/custom.error");
const Post = require("../models/post");
const createPost = async (req, res) => {
  const { postContent } = req.body;
  const { id } = req.user;
  const createPost = await Post.create({
    post_content: postContent,
    author: id,
  });
  if (!createPost) throw new CustomAPIError("Wasnt ablt to post", BAD_REQUEST);
  res.status(201).json(createPost);
};
const editPost = async (req, res) => {
  const { id } = req.params;
  const { postContent } = req.body;
  const post = await Post.findOneAndUpdate(
    { _id: id },
    { post_content: postContent },
    { new: true }
  );
  if (!post) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(post);
};
const mongoose = require("mongoose");

const getPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id })
    .populate({ path: "likes", select: "liked author -post_id" })
    .populate({
      path: "comments",
      select: "comment_content author -post_id",
      populate: {
        path: "User",
        // select: "username",
        strictPopulate: false,
      },
    });

  const postAgg = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "User",
        localField: "_id",
        foreignField: "author",
        as: "authorInfo",
      },
    },
    {
      $lookup: {
        from: "Comments",
        localField: "_id",
        foreignField: "post_id",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "Likes",
        localField: "_id",
        foreignField: "post_id",
        as: "likes",
      },
    },

    {
      $project: {
        _id: 0,
        post_content: 1,
        author: 1,
        authorInfo: 1,
        likes: {
          $map: {
            input: "$likes",
            as: "like",
            in: {
              author: "$$like.author",
            },
          },
        },
        liked_count: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: { $eq: ["$$like.liked", true] },
            },
          },
        },
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              comment_content: "$$comment.comment_content",
              author: "$$comment.author",
              authorInfo: { $arrayElemAt: ["$$comment.authorInfo", 0] },
            },
          },
        },
        total_comments: { $size: "$comments" },
      },
    },
  ]);

  console.log(postAgg);
  if (!post) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(postAgg);
};
//not tested
const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOneAndDelete({ _id: id });
  if (!post) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(post);
};
module.exports = { createPost, getPost, editPost, deletePost };
