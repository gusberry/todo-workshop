const express = require("express");
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

const userController = require("../controllers/user");

passport.serializeUser((user, cb) => cb(null, user.email));
passport.deserializeUser((userEmail, cb) =>
  userController
    .getUserByEmail({ email: userEmail })
    .then(user => cb(null, user))
);

passport.use(
  new LocalStrategy((username, password, done) => {
    userController
      .getUserByEmail({ email: username })
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        userController
          .isProvidedPasswordEqualsUsers(user, password)
          .then(isValid => {
            if (!isValid) {
              return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
          });
      })
      .catch(err => done(err));
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

router.post("/register", function(req, res) {
  userController.createUser(req.body).then(user => res.redirect("/login"));
});

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

module.exports = router;
