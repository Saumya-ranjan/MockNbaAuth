const axios = require("axios");
const querystring = require("querystring");
const ApiError = require("../utils/ApiError");

function getGithubAuthURL(next) {
  try {
    const rootUrl = "https://github.com/login/oauth/authorize";
    const options = {
      redirect_uri: "http://localhost:8000/auth/github/callback",
      client_id: process.env.GITHUB_CLIENT_ID,
      scope: "user:email",
    };
    const url = `${rootUrl}?${querystring.stringify(options)}`;
    return url;
  } catch (err) {
    next(new ApiError(400, "GitHub Auth URL Not Found"));
  }
}

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  try {
    const url = "https://github.com/login/oauth/access_token";
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    };

    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          Accept: "application/json",
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
  getGithubAuthURL,
  getTokens,
};
