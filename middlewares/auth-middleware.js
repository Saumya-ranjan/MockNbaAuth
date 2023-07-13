const jwt = require("jsonwebtoken");

const checkUserAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwttoken) {
    try {
      token = req.cookies.jwttoken;
      const { userID } = jwt.verify(token, "shhhhh");
      req.userID = userID;
      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ status: "failed", message: "Unauthorized User" });
    }
  } else {
    res
      .status(401)
      .send({ status: "failed", message: "Unauthorized User, No Token" });
  }
};

module.exports = checkUserAuth;
