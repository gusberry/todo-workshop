const express = require("express");
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

const userController = require("../controllers/user");
const errorController = require("../controllers/error");

passport.serializeUser((user, cb) => cb(null, user.email));
passport.deserializeUser((userEmail, cb) =>
  userController
    .getUserByEmail({ email: userEmail })
    .then(user => cb(null, user))
    .catch(cb)
);

passport.use(
  new LocalStrategy((username, password, done) => {
    userController
      .loginUser({ email: username, password })
      .then(user => done(null, user))
      .catch(done);
  })
);

const router = express.Router();

router.get("/login", function(req, res) {
  res.json(req.user);
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.post("/register", function(req, res, next) {
  userController
    .createUser(req.body)
    .then(user => res.json(user))
    .catch(next);
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
