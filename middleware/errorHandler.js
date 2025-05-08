/**
 * Error for handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong on the server.";

  res.status(statusCode).render("error", {
    title: "Error",
    error: {
      status: statusCode,
      message: message,
    },
  });
};

module.exports = errorHandler;
