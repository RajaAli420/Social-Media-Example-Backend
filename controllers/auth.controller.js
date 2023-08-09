const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors/custom.error");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const login = async (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  const user = await User.findOne({ username: username });
  console.log(user);
  if (!user) throw new CustomAPIError("User Not Found", StatusCodes.NOT_FOUND);
  if (user.password !== password)
    throw new CustomAPIError("Paswords do not match", StatusCodes.UNAUTHORIZED);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(StatusCodes.OK).json({ token: token });
};
const changePassword = async (req, res) => {
  console.log(req.body);
  const user = await User.updateOne(
    { _id: req.user.id },
    {
      password: req.body.newpassword,
    }
  );
  console.log(user);
  if (!user) {
    throw new CustomAPIError("User Not Found", StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({ message: "Password Changed" });
};

const forgotPassword = async (req, res) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    throw new CustomAPIError("User Not Found", StatusCodes.NOT_FOUND);
  }
  const verificationNumber=Math.floor(100000 + Math.random() * 900000);

}
//forgot and reset password later
module.exports = {
  login,
  changePassword,
};
