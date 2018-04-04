# NODE - from 0 to TODO app

## In this step we will learn

* how to handle errors in your application
* how to properly shutdown your application

### Error handling

Alright so we have our basic application but we are missing one very important part - error handling. This mechanism is very important as it helps to better understand what is currently going on in server not only for developer but for the end user as well.

If you'll try now to login to our application with wrong credentials you see something that is not usable by a client.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Error</title>
    </head>
    <body>
        <pre>TypeError: req.flash is not a function
            <br> &nbsp; &nbsp;at allFailed (.../node_modules/passport/lib/middleware/authenticate.js:131:15)
            ...
```

You can understand what is wrong from the client perspective only by guessing. What we really want is to have a proper headers and messages from the server:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  ...
}
```

So it can be handled on client side.

Before we start let's talk about how errors are propagated in express apps. There are two ways:

* pass error as a first argument in callback function (this is a common pattern for callback based frameworks)
* throw error in async manner

The mechanisms of handling this flows differs. First one is handled by using middlewares. The second one is handled on a `process` level.

Let's start from implementing our `Error` interface. For beginning let's assume that we need to handle:

* missing request data (status code: 400)
* wrong credentials during login (status code: 401)
* existing email while registering new user (status code: 409)
* server errors (status code: 500)

```js
const getError = (message, code) => {
  let err = message;
  if (!message instanceof Error) {
    err = new Error(message);
  }

  err.statusCode = code;

  return err;
};

module.exports = {
  getBadRequestError: message => getError(message, 400),
  getUnauthorizedError: message => getError(message, 401),
  getConflictError: message => getError(message, 409),
  getServerError: errObject => getError(errObject, 500)
};
```

We can get rid of our getError function and stop hardcoding status codes and use `boom` library.

```js
const Boom = require("boom");

module.exports = {
  getBadRequestError: message => Boom.badRequest(message),
  getUnauthorizedError: message => Boom.unauthorized(message),
  getConflictError: message => Boom.conflict(message),
  getServerError: errObject => Boom.boomify(errObject)
};
```

Ok so now we need an error controller. As it was mentioned earlier errors can be passed as a first argument to callback function during request handling. What it means for us is that error can be handled in a middleware. By default middleware receives three arguments:

* request object
* response object
* callback

But in case of calling callback with _defined_ first argument (error) the next middleware will be called with four arguments:

* error object that was passed as a first argument in previous middleware
* request object
* response object
* callback

Knowing that can create a universal middleware

```js
module.exports.errorHandlerMiddleware = (err, req, res, next) => {
  res.status(err.output.statusCode);
  return res.json(err.output.payload);
};
```

And use it in our application

```js
// app.js

app.use(errorHandlerMiddleware);
...
```

One important thing! Middlewares are executed in an order that you've specified them in code. That means that if you place `errorHandlerMiddleware` before other middleware or route handlers your errors won't be catched.

```js
// app.js

app.use(errorHandlerMiddleware);

module.exports = app;
```

Good. But we are not done. We need to pass our errors to callback functions. As we are using Promises in our controllers we can simply pass callback to `.catch()` method of them in our routes. For example:

```js
// routes/auth.js

router.post("/register", function(req, res, next) {
  // <-- next argument - callback function
  userController
    .createUser(req.body)
    .then(user => res.json(user))
    .catch(next); // <-- this can be translated as pass error to the next middleware
});
```

The `errorHandlerMiddleware` will receive error > set status code > send error back to the user so he can handle it. Easy! Go ahead and add `.catch()` method to all the places that you thing are a good candidates for error handling.

For now we are not generating any of the custom errors. The only thing that will be catched is some kind of server errors (500 status code). Let's optimize our error handling for **Auth** process. And we can start from registration.

For now our user creation controller method serves only as a proxy of arguments to the interface

```js
createUser: ({ email, password }) => {
  validate({ email, password }); // <-- doing nothing
  return userInterface.create({ email, password });
};
```

Let's make `validate()` function more valuable that if there is no arguments provided > throw error

```js
const validate = argument1 => {
  if (!argument1) {
    throw errorController.getBadRequestError("Missing data");
  }
};
```

Alright! Next we need to handle cases when user is already exists. Sequelize has inbuilt validator for this and with throw specific error with message "Validation error". Knowing that we can implement our custom error handling withing controller.

```js
 createUser: ({ email, password }) => {
    validate({ email, password });
    return userInterface.create({ email, password }).catch(err => {
      let filteredError = err;
      if (err.message === "Validation error") {
        filteredError = errorController.getConflictError(
          "User with such email is already exist"
        );
      }

      throw filteredError;
    });
  },
```

> It's important to throw unknown errors as they wil be treated as server errors (500 status code). It helps to define bugs and uncovered use cases in your application.

In that way the route handler will `.catch` error and pass it to the next middleware in our case this is `errorHandlerMiddleware` and client will receive a response with status code 409 and a message "User with such email is already exist".

Ok we need to cover another flow - login.

```js
//controllers/user.js

  getUserByEmail: ({ email }) => {
    validate({ email });
    return userInterface.get({ email }).then(user => {
      if (!user) {
        throw errorController.getUnauthorizedError(
          "There is no user with provided email"
        );
      }

      return user;
    });
  },
  ...
  checkUserPassword: (user, password) =>
    new Promise((resolve, reject) => {
      if (user.password !== password) {
        reject(errorController.getUnauthorizedError("Incorrect password"));
      }

    resolve(user);
  }),

  loginUser: ({ email, password }) =>
    module.exports
      .getUserByEmail({ email })
      .then(user => module.exports.checkUserPassword(user, password))
```

And don't forget to add `catch` to auth router

```js
passport.use(
  new LocalStrategy((username, password, done) => {
    userController
      .loginUser({ email: username, password })
      .then(user => done(null, user))
      .catch(done);
  })
);
```

Done! Now if something is wrong with credentials client will receive response with status code 401 and understandable error message.

But stop we need to handle another type of errors - the one that is not handled within the middlewares. Sometimes it's happening that errors that have been fired asynchronously are not catched and passed to middlewares. In that case we had to use **process** object to catch them. We won't dive into process object to much. There is one thing that you should be aware right now - you can add subscribers to some events that happen within your node application. To do that **process** object has method `.on(eventName, handler)`.

To handle errors that were not caught by our middle ware we will add a listener

```js
//bin/www

process.on("unhandledRejection", err => console.log(err));
```

In this case the request and response objects are not available for us anymore and the best option for handling that type of errors is restarting the server...

### Shutting down your server

...

As usual. If you're ready just switch to another branch.

```sh
git clean -fd
git checkout step-7
```

[passport.js]: http://www.passportjs.org
