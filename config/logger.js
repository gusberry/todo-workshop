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
  },
  loggly: {
    token: process.env.LOGGLY_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ["awesome_api"],
    json: true
  }
};
