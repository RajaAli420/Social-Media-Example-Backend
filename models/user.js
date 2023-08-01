const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ], //add regular expression later
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phoneNumber: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);
const ProfileSchema = new mongoose.Schema({
  bio: {
    type: String,
    maxlenght: 250,
  },
  profilePicture: {
    type: String,
  },
  address: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});
UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});
UserSchema.virtual("userprofile", {
  ref: "UserProfile",
  localField: "_id",
  foreignField: "user",
});
const User = mongoose.model("User", UserSchema);
const UserProfile = mongoose.model("UserProfile", ProfileSchema);
module.exports = {
  User: User,
  UserProfile: UserProfile,
};
