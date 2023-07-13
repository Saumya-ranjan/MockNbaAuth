const dotenv = require("dotenv");
const httpStatus = require("http-status");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ApiError = require("./utils/ApiError");
const { greetingsRouter } = require("./routes");
const db = require("./configs/db");
const errorHandler = require("./middlewares/error");

dotenv.config({ path: `.env` });
// console.log(process.env);

function startApp() {
  const app = express();
  return Promise.resolve()
    .then(() => {
      // add Database configs here
      return db.connectDatabase();
    })

    .then(() => {
      // add Middlewares here
      app.use(cors());
      app.use(cookieParser());
      app.use(express.json());
      app.use(
        bodyParser.urlencoded({
          extended: false,
        })
      );
      app.use(express.urlencoded({ extended: true }));
    })

    .then(() => {
      // add Routers here
      app.use("/", greetingsRouter);
    })

    .then(() => {
      // send back a 404 error for any unknown api request [Error Handler]
      app.use((req, res, next) => {
        next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
      });
      app.use(errorHandler);
    })

    .then(() => {
      // add listener here
      app.listen(process.env.PORT, (error) => {
        if (error) {
          console.log("--- server start error ---", error);
        }
        console.log(`--- server is running on port ${process.env.PORT} ---`);
      });

      return app;
    });
}

module.exports = {
  startApp: startApp,
};
