const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom.error");
const Comment = require("../models/comment");
const mongoose = require("mongoose");
const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      comment_content: req.body.comment_content,
      post_id: req.body.post_id,
      author: req.user.id,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json(err);
  }
};
//
const updateComment = async (req, res) => {
  const id = req.params.id;
  const updateComment = await Comment.updateOne(
    { _id: id },
    { comment_content: req.body.comment_content }
  );
  if (!updateComment)
    throw new CustomAPIError("Error Occured During Update", 500);
  res.status(200).json(updateComment);
};
const getAllCommentsPopulateMethod = async (req, res) => {
  console.log(req.query);
  const { post_id, createdAt } = req.query;
  let allComments = {};
  if (!createdAt) {
    allComments = await Comment.find({ post_id: post_id })
      .select("comment_content createdAt _id")
      .populate({
        path: "author",
        model: "User",
        select: "name -_id",
        populate: {
          path: "userprofile",
          model: "UserProfile",
          select: "profilePicture -_id",
        },
      });
    allComments = allComments.map((comment) => {
      return {
        comment_content: comment.comment_content,
        author: {
          name: comment.author.name,
          userprofile: comment.author.userprofile[0].profilePicture, // Assuming there's only one profile per user
        },
      };
    });
    res.status(200).json(allComments);
  } else {
    allComments = await Comment.find({ post_id: post_id })
      .sort({
        createdAt,
      })
      .select("comment_content createdAt _id")
      .populate({
        path: "author",
        model: "User",
        select: "name -_id",
        populate: {
          path: "userprofile",
          model: "UserProfile",
          select: "profilePicture -_id",
        },
      });

    allComments = allComments.map((comment) => {
      return {
        comment_id: comment._id,
        comment_content: comment.comment_content,
        createdAt: comment.createdAt,
        author: {
          name: comment.author.name,
          userprofile: comment.author.userprofile[0].profilePicture, // Assuming there's only one profile per user
        },
      };
    });
    res.status(200).json(allComments);
  }
};
const getAllCommentsAggregateMethod = async (req, res) => {
  const { post_id, createdAt } = req.query;
  console.log("Comment with post_id:", post_id, createdAt);
  let allComments = {};
  if (!post_id)
    throw new CustomAPIError("No Post_ID Provided", StatusCodes.NOT_FOUND);
  if (!createdAt) {
    allComments = await Comment.aggregate([
      {
        $match: { post_id: new mongoose.Types.ObjectId(post_id) },
      },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: "$User",
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "User._id",
          foreignField: "user",
          as: "User.UserProfile",
        },
      },
      {
        $group: {
          _id: "$_id",
          comment_content: { $first: "$comment_content" },
          createdAt: { $first: "$createdAt" },
          UserData: { $addToSet: "$User" },
        },
      },
      {
        $project: {
          comment_content: 1,
          createdAt: 1,
          _id: 1,
          User: {
            $map: {
              input: "$UserData",
              as: "user",
              in: {
                name: "$$user.name",
                UserProfile: {
                  $arrayElemAt: ["$$user.UserProfile.profilePicture", 0],
                },
              },
            },
          },
        },
      },
      { $sort: { createdAt: Number(createdAt) } },
    ]);
    res.status(200).json(allComments);
  } else {
    allComments = await Comment.aggregate([
      {
        $match: { post_id: new mongoose.Types.ObjectId(post_id) },
      },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "User",
        },
      },
      {
        $unwind: "$User",
      },
      {
        $lookup: {
          from: "userprofiles",
          localField: "User._id",
          foreignField: "user",
          as: "User.UserProfile",
        },
      },
      {
        $group: {
          _id: "$_id",
          comment_content: { $first: "$comment_content" },
          createdAt: { $first: "$createdAt" },
          UserData: { $addToSet: "$User" },
          // UserProfile: { $first: "$UserProfile" },
        },
      },
      {
        $project: {
          comment_content: 1,
          createdAt: 1,
          _id: 1,
          User: {
            $map: {
              input: "$UserData",
              as: "user",
              in: {
                name: "$$user.name",
                UserProfile: {
                  $arrayElemAt: ["$$user.UserProfile.profilePicture", 0],
                },
              },
            },
          },
        },
      },
      { $sort: { createdAt: Number(createdAt) } },
    ]);
    res.status(200).json(allComments);
  }
};

module.exports = {
  createComment,
  updateComment,
  getAllCommentsPopulateMethod,
  getAllCommentsAggregateMethod,
};
