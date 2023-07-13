const ApiError = require("../utils/ApiError");
const UserModel = require("../models/user.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getGithubAuthURL, getTokens } = require("../services/github-auth");

class githubAdaptor {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  getLoginUrl = () => {
    return getGithubAuthURL();
  };

  getGithubToken = async (code) => {
    const { access_token } = await getTokens({
      code,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    // Fetch the user's profile with the access token
    const githubUser = await axios
      .get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        next(new ApiError(400, "Failed to fetch user"));
      });

    const existingUser = await UserModel.findOne({ githubId: githubUser.id });
    if (!existingUser) {
      const doc = new UserModel({
        githubId: githubUser.id,
        name: githubUser.name,
        twitterUsername: githubUser.twitter_username,
        tc: "on",
      });
      await doc.save();
    }
    const saved_user = await UserModel.findOne({ githubId: githubUser.id });
    const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    return { token: token, userID: saved_user._id.toString() };
  };
}

module.exports = githubAdaptor;
