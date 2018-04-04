const express = require("express");
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");

const indexRouter = require("./routes/index");
const todosRouter = require("./routes/todos");
const listsRouter = require("./routes/lists");
const authRouter = require("./routes/auth");

const { errorHandlerMiddleware } = require("./controllers/error");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "any secret",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/lists", listsRouter);
app.use("/todos", todosRouter);

app.use(errorHandlerMiddleware);

module.exports = app;
