const greetingsRouter = require("express").Router();
const checkUserAuth = require("../middlewares/auth-middleware.js");
const googleAdaptor = require("../adaptors/googleAdaptor");
const githubAdaptor = require("../adaptors/githubAdaptor");
const {
  userLogin,
  userRegistration,
  loggedUser,
  userLogout,
} = require("../controllers/userController.js");

//config Files
const config = require("../configs/adapterconfig.js");

// Public Routes Email And Password
greetingsRouter.get("/register", (req, res) => {
  res.send(`<form action="/register" method="POST">
  <div class="form-group">
    <label for="fname">First Name</label>
    <input type="text" class="form-control" name="fname" required>
  </div>
  <div class="form-group">
    <label for="lname">Last Name</label>
    <input type="text" class="form-control" name="lname" required>
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" class="form-control" name="email" required>
  </div>
  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" class="form-control" name="password" required>
  </div>
  <div class="form-group">
    <label for="password_confirmation">Confirm Password</label>
    <input type="password" class="form-control" name="password_confirmation" required>
  </div>
  <button style="padding:5px" type="submit" class="btn btn-dark">Register</button>
</form>`);
});

greetingsRouter.get("/email-login", (req, res) => {
  res.send(
    `<form action="/email-login" method="POST">
<div class="form-group">
  <label for="email">Email</label>
  <input type="text" class="form-control" name="email" required>
</div>
<div class="form-group">
  <label for="password">Password</label>
  <input type="password" class="form-control" name="password" required>
</div>
<button style="padding:5px" type="submit" class="btn btn-dark">login</button>
Or
<a href = "/register">Register</a>
</form>`
  );
});

greetingsRouter.post("/register", userRegistration);
greetingsRouter.post("/email-login", userLogin);

// Getting the current user
greetingsRouter.get("/logout", userLogout);

greetingsRouter.get("/loggeduser/:id", checkUserAuth, loggedUser);

greetingsRouter.get("/login", (req, res) => {
  res.send(
    '<a href="/auth/google/url"> Authenticate With Google </a> <br> <a href="/email-login">Login With Email And Password</a> <br> <a href="/auth/github/url">Authenticate With Github</a>'
  );
});

// Calling Adaptor function for Github and Google
greetingsRouter.get("/auth/:provider/url", (req, res, next) => {
  const { provider } = req.params;
  const AdapterClass = require(`../adaptors/${provider}Adaptor`);
  const adapter = new AdapterClass(config[provider]);

  res.redirect(adapter.getLoginUrl());
});

greetingsRouter.get("/auth/google/callback", async (req, res) => {
  const googleAdapter = new googleAdaptor(config.google);
  try {
    const code = req.query.code;
    const { token, userID } = await googleAdapter.getToken(code);
    res.cookie("jwttoken", token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
    });
    res.redirect(`http://localhost:8000/loggeduser/${userID}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

greetingsRouter.get("/auth/github/callback", async (req, res) => {
  const githubAdapter = new githubAdaptor(config.github);
  try {
    const code = req.query.code;
    const { token, userID } = await githubAdapter.getGithubToken(code);
    res.cookie("jwttoken", token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
    });
    res.redirect(`http://localhost:8000/loggeduser/${userID}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = greetingsRouter;
