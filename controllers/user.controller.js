const mongoose = require("mongoose");
const BadRequestError = require("../errors/bad-request.error");
const { User, UserProfile } = require("../models/user");
const Post = require("../models/post");
const CustomAPIError = require("../errors/custom.error");
const { StatusCodes } = require("http-status-codes");
const { request } = require("express");
const likes = require("../models/likes");
const registerUser = async (req, res) => {
  const { name, email, username, password } = req.body;
  if (!name || !email || !username || !password)
    throw new BadRequestError("Values required");

  const user = await User.create({
    name,
    email,
    username,
    password,
  });
  console.log(user);
  if (!user) throw new BadRequestError("Invalid User Not Found");
  return res.status(201).json(user);
};

const addUserProfileInfo = async (req, res) => {
  const { bio, address, id } = req.body;
  const profilePicture = process.env.SERVER_URL + req.file.path;
  console.log(req.user.id);
  const createUserProfile = await UserProfile.create({
    bio,
    address,
    profilePicture: profilePicture,
    user: req.user.id,
  });
  res.status(200).json({ message: createUserProfile });
};
const updateUserProfile = async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    req.body.profilePicture = process.env.SERVER_URL + req.file.path;
  }

  const updateUser = await UserProfile.findOneAndUpdate(
    { user: id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  console.log(updateUser);
  if (!updateUser)
    throw new CustomAPIError("NO Values provided", StatusCodes.NOT_MODIFIED);
  res.status(200).json({ message: updateUser });
};
const getUserProfile = async (req, res) => {
  const { pageNumber } = req.query;
  const id = req.user.id;
  const user = await User.findById(id);
  let pageSize = 3;
  console.log("in here");
  if (!user) throw new CustomAPIError("User not Found", StatusCodes.NOT_FOUND);
  //options: { limit: pageSize, skip: (pageNumber - 1) * pageSize },

  const userProfile = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "author",
        as: "posts",
      },
    },

    {
      $unwind: { path: "$posts", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "comments",
        localField: "posts._id",
        foreignField: "post_id",
        as: "posts.comments",
      },
    },
    {
      $lookup: {
        from: "userprofiles",
        localField: "_id",
        foreignField: "user",
        as: "userprofile",
      },
    },

    {
      $lookup: {
        from: "likes",
        localField: "posts._id",
        foreignField: "post_id",
        pipeline: [
          {
            $match: {
              liked: true,
            },
          },
        ],
        as: "posts.likes",
      },
    },

    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        userprofile: { $first: "$userprofile" },
        posts: {
          $addToSet: "$posts",
        },
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        profilePicture: { $arrayElemAt: ["$userprofile.profilePicture", 0] },

        posts: {
          $map: {
            input: "$posts",
            as: "post",
            in: {
              postId: "$$post._id",
              postContent: "$$post.post_content",
              totalLikes: { $size: "$$post.likes" },

              totalComments: { $size: "$$post.comments" },
            },
          },
        },
      },
    },
  ]);
  if (!userProfile[0].posts[0].postId || !userProfile[0].posts[0].postContent) {
    userProfile[0].posts = [];
  }

  res.status(200).json(userProfile);
};

module.exports = {
  registerUser,
  addUserProfileInfo,
  getUserProfile,
  updateUserProfile,
};
