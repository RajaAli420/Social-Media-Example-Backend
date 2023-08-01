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
  if (!user) throw new BadRequestError("Invalid User Not Found");
  return res.status(201).json(user);
};

const addUserProfileInfo = async (req, res) => {
  const { bio, address, id } = req.body;
  const profilePicture = process.env.SERVER_URL + req.file.path;
  const createUserProfile = await UserProfile.create({
    bio,
    address,
    profilePicture: profilePicture,
    user: id,
  });
  res.status(200).json({ message: createUserProfile });
};
const updateUserProfile = async (req, res) => {
  const { id } = req.params;

  if (req.file) {
    req.body.profilePicture = process.env.SERVER_URL + req.file.path;
  }
  // console.log(req.body, id);

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
  if (!user) throw new CustomAPIError("User not Found", StatusCodes.NOT_FOUND);
  const userProfile = await User.findOne({ _id: id })
    .populate({
      options: { limit: pageSize, skip: (pageNumber - 1) * pageSize },
      path: "posts",
      model: "Post",
      select: "post_content -author",
      populate: [
        {
          path: "comments",
          model: "Comments",
          select: "comments_content author -_id",
        },
        {
          path: "likes",
          model: "Likes",
          select: "likes_count liked author -_id",
        },
      ],
    })
    .populate("userprofile", "bio address profilepicture -_id -user  ");

  res.status(200).json(userProfile);
};

module.exports = {
  registerUser,
  addUserProfileInfo,
  getUserProfile,
  updateUserProfile,
};
