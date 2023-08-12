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

const getSinglePost = async (req, res) => {
  const { id } = req.params;

  const postAgg = await Post.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
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

    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post_id",
        pipeline: [
          {
            $sort: {
              createdAt: -1,
            },
          },
        ],
        as: "comments",
      },
    },

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
    { $unwind: { path: "$comments", preserveNullAndEmptyArrays: true } }, // Unwind the comments array
    { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$authorProfile", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "userprofiles",
        localField: "author._id",
        foreignField: "user",
        as: "userProfile",
      },
    },
    { $unwind: { path: "$userProfile", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "users",
        localField: "comments.author",
        foreignField: "_id",
        as: "comments.authorInfo",
      },
    },

    {
      $lookup: {
        from: "userprofiles",
        localField: "comments.author",
        foreignField: "user",
        as: "comments.userProfile",
      },
    },

    {
      $group: {
        _id: "$_id",
        post_content: { $first: "$post_content" },
        author: { $first: "$author" },
        createAt: { $first: "$createAt" },
        authorProfile: { $first: "$authorProfile" },
        commentsData: { $addToSet: "$comments" },
        likes: { $first: "$likes" },
      },
    },

    {
      $project: {
        _id: 0,
        post_content: 1,
        author: {
          name: "$author.name",
          email: "$author.email",
          profilePicture: {
            $cond: {
              if: { $eq: ["$authorProfile", null] }, // Check if authorProfile is null
              then: "", // Provide null if authorProfile is null
              else: "$authorProfile.profilePicture", // Use profilePicture if authorProfile is not null
            },
          },
        },
        comments: {
          $cond: {
            if: "$isCommentsEmpty",
            then: [], // Empty array if no comments
            else: {
              $map: {
                input: "$commentsData",
                as: "comment",
                in: {
                  id: "$$comment._id",
                  createdAt: "$$comment.createdAt",
                  comment_content: "$$comment.comment_content",
                  authorName: {
                    $arrayElemAt: ["$$comment.authorInfo.name", 0],
                  },
                  authorProfile: {
                    $arrayElemAt: ["$$comment.userProfile.profilePicture", 0],
                  },
                },
              },
            },
          },
        },
        totalLikes: { $size: "$likes" },
        total_comments: { $size: "$commentsData.comment_content" },
      },
    },
  ]);
  if (!postAgg[0].comments[0].authorName) {
    postAgg[0].comments = [];
  }
  if (postAgg[0].comments) {
    postAgg[0].comments.sort((a, b) => b.createdAt - a.createdAt);
  }
  console.log(postAgg);
  if (!postAgg) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(postAgg);
};
const getAllPosts = async (req, res) => {
  const postAgg = await Post.aggregate([
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
  if (!postAgg) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(postAgg);
};
//not tested
const deletePost = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findOneAndDelete({ _id: id });
  if (!post) throw new CustomAPIError("Post not found", BAD_REQUEST);
  res.status(200).json(post);
};
module.exports = {
  createPost,
  getSinglePost,
  getAllPosts,
  editPost,
  deletePost,
};
