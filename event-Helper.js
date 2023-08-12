const Comment = require("./models/comment");
const mongoose = require("mongoose");
const Post = require("./models/post");

const allCommentsOnAPostEvent = async (post_id) => {
  const allComments = await Comment.aggregate([
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
    { $sort: { createdAt: -1 } },
  ]);

  console.log(allComments);
  return allComments;
};

const newTry = async (comment_id) => {
  return await Comment.findOne({
    _id: comment_id,
  });
};

const newPost = async (post_id) => {
  return await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(post_id),
      },
    },
    {
      $sort: {
        createAt: -1,
      },
    },
    {
      //for getting user details about post owner
      $lookup: {
        from: "userprofiles",
        localField: "author",
        foreignField: "user",
        as: "authorProfile",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    //for total comments on Posts
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post_id",
        as: "comments",
      },
    },
    //for likes comments on Posts
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "post_id",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $addFields: { likes: "$likes" },
    },
    {
      $group: {
        _id: "$_id",
        post_content: { $first: "$post_content" },
        authorProfile: { $first: "$authorProfile" },
        author: { $first: "$author" },
        createAt: { $first: "$createAt" },
        likes: { $first: "$likes" },
        comments: { $first: "$comments" },
      },
    },

    {
      $project: {
        _id: 1,
        post_content: 1,

        author: {
          name: {
            $arrayElemAt: ["$author.name", 0],
          },
          email: {
            $arrayElemAt: ["$author.email", 0],
          },
          profilePicture: {
            $arrayElemAt: ["$authorProfile.profilePicture", 0],
          },
        },

        liked_count: {
          $size: "$likes",
        },
        total_comments: { $size: "$comments" },
      },
    },
  ]);
};
module.exports = { allCommentsOnAPostEvent, newTry, newPost };
