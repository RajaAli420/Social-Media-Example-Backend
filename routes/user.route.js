const express = require("express");
const upload = require("../middlewares/file-upload.middleware");
const {
  registerUser,
  addUserProfileInfo,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/user.controller");
const verifyUserCredentials = require("../middlewares/auth.middleware");
const userRouter = express.Router();

userRouter.route("/").post(registerUser);
userRouter.post(
  "/editProfile",
  verifyUserCredentials,
  upload.single("profilepicture"),
  addUserProfileInfo
);
userRouter
  .route("/getuser")
  .get(verifyUserCredentials, getUserProfile)
  .patch(
    verifyUserCredentials,
    upload.single("profilepicture"),
    updateUserProfile
  );
module.exports = userRouter;
