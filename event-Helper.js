const Comment = require("./models/comment");
const mongoose = require("mongoose");

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

const newTry = async (post_id, user_id, comment_id) => {
  return await Comment.findOne({
    post_id: post_id,
    _id: comment_id,
    author: user_id,
  }).sort({ createdAt: -1 });
};

module.exports = { allCommentsOnAPostEvent, newTry };
