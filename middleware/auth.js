/**
 * Middleware to check if user is authenticated
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  // Store the original URL
  req.session.returnTo = req.originalUrl;

  // Redirect to login page
  res.redirect("/auth/login");
};

/**
 * Middleware to check if user is an admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
    return next();
  }

  // Return 403 Forbidden
  res.status(403).render("error", {
    title: "Access Denied",
    error: {
      status: 403,
      message: "You do not have permission to access this resource.",
    },
  });
};
