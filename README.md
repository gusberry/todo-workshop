# NODE - from 0 to TODO app

## In this step we will learn

* how to save logs in your application

### Logs

Ok our app is up and running. But we don't want to track it by looking at terminal output. So we need to store required for tracking data somewhere and somehow.

To do that we will add logging mechanism to our app. For ease of this tutorial we will track all our request and any errors that will appear.

### Log mechanism implementation

There is a bunch of logging libraries to use. In this tutorial we will use `winston` as a general logging controller. It's very powerful as it allows to add several sources to store logs. For example - generally we want to store logs in a file but in addition a terminal output would be great while in development mode.

So first of all let's create our controller for logging and add `winston` as a main logger.

```js
// controllers/logger.js

const winston = require("winston");

const logger = new winston.Logger();

module.exports = logger;
```

Next step is to set up sources to log into. `winston` uses **transport** to specify logging sources. Let's add terminal and file outputs.

```js
// controllers/logger.js
const logger = new winston.Logger({
  transports: [
    new winston.transports.File(config.file),
    new winston.transports.Console(config.console)
  ]
});

// config/logger.js
module.exports = {
  file: {
    level: "info",
    filename: `${process.env.PWD}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true
  }
};
```

There is a **level** of logging in a config file. Logging levels indicate message priority and are denoted by an integer. Winston uses npm logging levels that are prioritized from 0 to 5 (highest to lowest):

```sh
0: error
1: warn
2: info
3: verbose
4: debug
5: silly
```

When specifying a logging level for a particular transport, anything at that level or higher will be logged. For example, by specifying a level of info, anything at level error, warn, or info will be logged. Log levels are specified when calling the logger, meaning we can do the following to record an error: logger.error('test error message').

So now we can enable logging in our app. Remember our previous lesson with error handling? We have a single place to handle our errors. Go ahead and add `logger.error` there.

```js
// controllers/error
const logger = require("./log");

module.exports = require("../interfaces/error");

module.exports.errorHandlerMiddleware = (err, req, res, next) => {
  let customError = err;

  if (!module.exports.isCustomError(err)) {
    customError = module.exports.getServerError(err);
  }

  res.status(customError.output.statusCode);
  logger.error(customError); // <-- this line
  return res.json(customError.output.payload);
};
```

Easy as that. There are a couple more places to add error logging in `bin/www` that you can handle buy yourself.

There is one more thing we want to track - all our request as we would probably need to track our payload. To do that we would use `morgan` as a middleware to track request and combine it with `winston` as a logging mechanism.

```js
// controllers/logger.

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  }
};

module.exports.requestLogger = morgan("combined", { stream: logger.stream });
```

`requestLogger` is a middleware that can be used in our application now.

```js
// app.js

const { requestLogger } = require("controllers/logger.js");

app.use(requestLogger).
```

Now we have our logging mechanism in place. As soon as you will start your application and new requests will come to your app a new file will be created in you app directory with logs inside it.

Remember that we mentioned that `winston` is an agile mechanism for logging? Imaging we want to use external service for storing and tracking of logs. Let's take for example **Loggly**. It's a paid service for storing and querying through your logs with a possibility to create a _free account_ for your development needs.

After you will register you should create a token for your app Go to `Source setup > Customer Tokens > Add New`. Ok, so now we can add a new transport to our `winston` logger. We will use official package for this `winston-loggly-bulk`.

```js
// controllers/logger.js

require("winston-loggly-bulk");

const logger = new winston.Logger({
  transports: [
    new winston.transports.File(config.file),
    new winston.transports.Console(config.console),
    new winston.transports.Loggly(config.loggly)
  ]
});
```

That is it! Now we can use Loggly search engine for analyzing our app.

As usual. If you're ready just switch to another branch.

```sh
git clean -fd
git checkout step-8
```

[passport.js]: http://www.passportjs.org
