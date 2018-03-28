# NODE - from 0 to TODO app

## In this step we will learn

- how to authenticate user
- how to perform basic authorization in express application

## Authentication

Before we start figuring out how to deal with authentication we need to take a look how request is proceeded within the app.

**Express** is using middlewares principle to handle request. What does it means? It means that when request is entering to application it passes several functions before he will reach the route handler function. If you'll open `app.js` you'll see that there are several `app.use(...)` method calls. In that we are setting some top level middlewares. For example `app.use(express.json())` parses request with JSON payload when **Content-Type** (by default) is set to `application/json` and populates request object `body` key with data. After that the next middleware is called with updated request. After application level (*app.use*) middlewares were called a route specific ones will be triggered. When middlewares chain will end a route handler will be called with updated request. It's important to mansion that the order in which middlewares are called is the same as you specify them in your code. Be careful with this because it can cause some strange bugs as some middlewares may require another before them.

Ok back to authentication. First of all we need to add password field to **User** model and make email field a primary key as we want email to be uniq over application.

```js
// models/user.js
...
      email: { type: DataTypes.STRING, primaryKey: true },
      password: DataTypes.STRING
...
```

Great not we need to create **user interface** in order to hide our sequelize API inside it.

```js
// interfaces/user.js
const db = require("../models");

module.exports = {
  get: ({ email }) => db.User.findOne({ where: { email } }),

  create: ({ email, password }) => db.User.create({ email, password }),

  delete: user => user.destroy()
};
```

Perfect one more thing is need for **User model** we need a controller for it.

```js
//controllers/user.js
const userInterface = require("../interfaces/user");

const validate = () => {}; // TODO make it valuable

module.exports = {
  getUserByEmail: ({ email }) => {
    validate({ email });
    return userInterface.get({ email });
  },

  createUser: ({ email, password }) => {
    validate({ email, password });
    return userInterface.create({ email, password });
  },

  deleteUser: user => {
    validate(user);
    return userInterface.delete(user);
  },

  isProvidedPasswordEqualsUsers: (user, password) =>
    Promise.resolve(user.password === password)
};
```

You have probably noticed that `isProvidedPasswordEqualsUsers` uses dumb Promise inside it. That is done to make controller API more persistent. But you can easily do this in synchronous manner that won't be a mistake.

Ok it's time to think about how our user will authenticate there selves in our app. It's obvious that they need some kind of entry point to there auth path for example `/login`. Ok they will receive a login page within it. Now if they are not yet in the system they had to have ability to add there selves, let's say `/register` endpoint. If user is already in the system they will use **login** endpoint. And one more thing. They need to be able to shut down there access - `/logout` will handle this.

```js
//routes/auth.js
const express = require("express");

const router = express.Router();

router.get("/login", function(req, res) {}); // < sends login page

router.post("/login", function(req, res) {}); // < handles login credentials

router.post("/register", function(req, res) {}); // < registers new users

router.get("/logout", function(req, res) {}); // < shuting down users session

module.exports = router;
```

Before we start filling our routes with some logic. We need to create a mechanism for user authentication. The easiest way is to use some existing ones. Probably the best option for major cases is [passport.js].

## Passport.js

> Passport is authentication middleware for Node.js. Extremely flexible and modular, Passport can be unobtrusively dropped in to any Express-based web application. A comprehensive set of strategies support authentication using a username and password, Facebook, Twitter, and more.

That what is said on official page. And in most cases this is true. As we are going to store users and their passwords locally we would need to implement **local strategy** for authentication and use it on `POST /login`. Let's wright our strategy code.

```sh
npm i passport passport-local
```

```js
//routes/auth.js
...
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");

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

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);
...
```

Let's go through this code step by step:

1. We are importing our libraries
2. We are telling *passport* to use a new local strategy
3. *LocalStrategy* constructor receives 3 arguments. *username* and *password* are taking from the req.body object and *done* is callback on finishing our auth logic.
4. We are using our *userController* to receive user from DB and compare provided password.

**done** callback can receive 3 arguments:

- error
- user entity
- flash message

If there is an error an error handler will be triggered and request will be shuted down.

If user is not provided and there is no error a message will send to the client.

If user is provided and there is no error he will be stored in session and can be retrieved from `req.user`. To do that you had to define to methods `serializeUser` and `deserializeUser`. First one is used to store user in session with an identifier and the second one - to retrieve user based on identifier. First one is called after authentication. Second one is during every request.

```js
//routes/auth.js
...
const userController = require("../controllers/user");

passport.serializeUser((user, cb) => cb(null, user.email));
passport.deserializeUser((userEmail, cb) =>
  userController
    .getUserByEmail({ email: userEmail })
    .then(user => cb(null, user))
);
...
```

Ok let's finalize our **auth** router.

```js
...
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
```

Almost done. We had to tell our application to use passport as a top level middleware and we need to add a general session middleware.

```sh
npm i express-session
```

```js
//app.js
...
const session = require("express-session");
const passport = require("passport");
...
const authRouter = require("./routes/auth");

...
app.use(
  session({
    secret: "any secret",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
...
app.use("/", indexRouter);
app.use("/", authRouter);
...
```

Remember a note that the order of middlewares is important? If `session` middleware will be placed after `passport.session()` the **user** won't be set in **req** and authorization won't be possible.

## Authorization

Passport sets `req.user` during deserialization but that is not the only thing that passport does. It also adds 'isAuthenticated' method to request object. Knowing that we can implement a middleware to check this method and based on result perform some actions.

```js
function checkAuth(req, res, next) {
  if (req.isAuthenticated &&  req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}
```

and then reuse it in any route

```js
route.use('/lists', checkAuth);
```

and that is it! If user is not authorized he will be redirected to login page. To simplify things we can replace our implementation of auth check with `connect-ensure-login` that covers some edgecases.

```sh
npm i connect-ensure-login
```

```js
const { ensureLoggedIn } = require("connect-ensure-login");
...
router.use('/lists', );
// or to protect all routes within the router
router.use(ensureLoggedIn("/login"));
```

Congratulations! You've finished the basic authentication for express App.

As usual. If you're ready just switch to another branch.

```sh
git clean -fd
git checkout step-6
```

[passport.js]: http://www.passportjs.org