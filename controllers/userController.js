const ApiError = require("../utils/ApiError");
const UserModel = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./.env" });

const userRegistration = async (req, res, next) => {
  const { fname, lname, email, password, password_confirmation } = req.body;
  const user = await UserModel.findOne({ email: email });
  if (user) {
    next(new ApiError(400, "Email already exists"));
  } else {
    if (fname && lname && email && password && password_confirmation) {
      if (password === password_confirmation) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashPassword = await bcrypt.hash(password, salt);
          const doc = new UserModel({
            fname: fname,
            lname: lname,
            email: email,
            password: hashPassword,
          });
          console.log(`Register Done : ${email}, ${password}`);
          await doc.save();

          res.status(201).send({
            status: "success",
            message: "Registration Success",
          });
        } catch (error) {
          next(new ApiError(400, "unable to Register"));
        }
      } else {
        next(new ApiError(400, "Password and Confirm password doesn't match"));
      }
    } else {
      next(new ApiError(400, "All Fields are Required"));
    }
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Login Done: ${email}, ${password}`);
    if (email && password) {
      const user = await UserModel.findOne({ email: email });
      if (user != null) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (user.email === email && isMatch) {
          const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET, {
            expiresIn: "5d",
          });
          // res.cookie("jwttoken", token, {
          //   expires: new Date(Date.now() + 25892000000),
          //   httpOnly: true,
          // });
          const userId = user._id.toString();
          // res.redirect(`/loggeduser/${userId}`);
          res.send({
            status: "success",
            message: "Login Success",
            token: token,
            userId: userId,
            email: user.email,
            fname: user.fname,
            lname: user.lname,
          });
        } else {
          next(new ApiError(400, "Email or Password is not Valid"));
        }
      } else {
        next(new ApiError(400, "you are not registered User"));
      }
    } else {
      next(new ApiError(400, "All Fields are Required"));
    }
  } catch (error) {
    next(new ApiError(400, "unable to login"));
  }
};

const loggedUser = async (req, res) => {
  const userId = await req.params.id;
  const cookieToken = await req.userID;
  if (userId !== cookieToken) {
    return res.redirect("/logout");
  }
  const user = await UserModel.findById(userId).select("-password");
  const logout = `http://localhost:8000/logout`;
  res.send({
    user: user,
    logout: logout,
  });
};

const userLogout = (req, res) => {
  res.clearCookie("jwttoken");
  res.redirect("/login");
};

module.exports = {
  userRegistration,
  userLogin,
  loggedUser,
  userLogout,
};
