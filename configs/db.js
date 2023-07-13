const mongoose = require("mongoose");

module.exports = {
  connectDatabase: () => {
    return mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log("database connection established");
      })
      .catch((error) => {
        console.log("Database connection failed due to error: ", error);
        process.exit(0);
      });
  },
};
