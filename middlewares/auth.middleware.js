const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const CustomAPIError = require("../errors/custom.error");
const { StatusCodes } = require("http-status-codes");
const verifyUserCredentials = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById({ _id: decoded.id });

    if (!user)
      throw new CustomAPIError("NO USER FOUND", StatusCodes.BAD_REQUEST);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

module.exports = verifyUserCredentials;
