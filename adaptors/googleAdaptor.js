const ApiError = require("../utils/ApiError");
const UserModel = require("../models/user.js");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getGoogleAuthURL, getTokens } = require("../services/google-auth");

class googleAdaptor {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  getLoginUrl = () => {
    return getGoogleAuthURL();
  };

  getToken = async (code) => {
    const { id_token, access_token } = await getTokens({
      code,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    // Fetch the user's profile with the access token and bearer
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => {
        next(new ApiError(400, "Failed to fetch User"));
      });

    const existingUser = await UserModel.findOne({ email: googleUser.email });
    if (!existingUser) {
      const doc = new UserModel({
        googleId: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        tc: "on",
      });
      await doc.save();
    }
    const saved_user = await UserModel.findOne({ email: googleUser.email });
    const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    });
    return { token: token, userID: saved_user._id.toString() };
  };
}

module.exports = googleAdaptor;
