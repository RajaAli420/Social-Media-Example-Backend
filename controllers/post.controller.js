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
const getPost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id })
    .populate({ path: "likes", select: "liked author" })
    .populate({
      path: "comments",
      select: "comment_content",
    });
  if (!post) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(post);
};
module.exports = { createPost, getPost, editPost };
