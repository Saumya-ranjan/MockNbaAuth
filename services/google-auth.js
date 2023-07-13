const axios = require("axios");
const querystring = require("querystring");
require("dotenv").config({ path: "./.local.env" });

function getGoogleAuthURL(next) {
  try {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: "http://localhost:8000/auth/google/callback",
      client_id: process.env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };
    const url = `${rootUrl}?${querystring.stringify(options)}`;
    return url;
  } catch (err) {
    next(new ApiError(400, "Google Auth Url Not Found"));
  }
}

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };
    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        console.error("Failed to fetch auth tokens");
        throw new Error(error.message);
      });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  getGoogleAuthURL,
  getTokens,
};
