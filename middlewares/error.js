const ApiError = require("../utils/ApiError");

module.exports = (err, req, res, next) => {
  let HTTPStatusCode = 400;

  const responseObject = {
    message: "Internal Server Error",
    error: err.message ? err.message : err.toString(),
  };

  if (err instanceof ApiError) {
    HTTPStatusCode = err.statusCode;
    responseObject.error = err.err;
    responseObject.message = err.message;
  }

  return res.status(HTTPStatusCode).json({
    ...responseObject,
  });
};
