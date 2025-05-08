const User = require("../models/User");
const City = require("../models/City");

/**
 * Get admin dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    // Get counts for dashboard statistics
    const userCount = await User.countDocuments();
    const cityCount = await City.countDocuments();
    const attractionsCount = await City.countDocuments({
      hasAttractions: true,
    });

    // Get continents with city counts
    const continentStats = await City.aggregate([
      { $group: { _id: "$continent", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get most recently added cities
    const cities = await City.find().sort({ createdAt: -1 }).limit(5);
       // Convert to plain objects
       const recentCities = cities.map(city => ({
        _id: city._id.toString(),
        name: city.name || 'Unknown',
        country: city.country || 'Unknown',
        createdAt: city.createdAt
      }));

    // Get most recently registered users
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    // Convert to plain objects
    const recentUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name || 'Unknown',
      email: user.email || 'Unknown',
      role: user.role || 'user',
      createdAt: user.createdAt
    }));

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      stats: {
        userCount,
        cityCount,
        attractionsCount,
        continentStats,
      },
      recentCities,
      recentUsers,
    });
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error loading dashboard. Please try again.",
      },
    });
  }
};

/**
 * Get user management page
 */
exports.getUsers = async (req, res) => {
  try {
    const { search, role, sort } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    // Define sort options
    let sortOption = { createdAt: -1 }; // Default sorting

    if (sort === "name") {
      sortOption = { name: 1 };
    } else if (sort === "email") {
      sortOption = { email: 1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const users = await User.find(filter).sort(sortOption);
    const plainUsers = users.map(user => JSON.parse(JSON.stringify(user)));

    res.render("admin/users", {
      title: "User Management",
      users: plainUsers,
      filters: {
        search,
        role,
        sort,
      },
    });
  } catch (err) {
    console.error("Error loading users:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error loading users. Please try again.",
      },
    });
  }
};

/**
 * Render add user form
 */
exports.getAddUserForm = (req, res) => {
  res.render("admin/addUser", { title: "Add New User" });
};

/**
 * Add a new user
 */
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.render("admin/addUser", {
        title: "Add New User",
        error: "Please provide all required fields.",
        name,
        email,
        role,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("admin/addUser", {
        title: "Add New User",
        error: "Email is already registered.",
        name,
        email,
        role,
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "user",
    });

    await user.save();

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error adding user:", err);
    res.render("admin/addUser", {
      title: "Add New User",
      error: "An error occurred while adding the user. Please try again.",
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });
  }
};

/**
 * Render edit user form
 */
exports.getEditUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        title: "User Not Found",
        error: {
          status: 404,
          message: "The user you are looking for does not exist.",
        },
      });
    }

    const plainUser = user.toObject();


    res.render("admin/editUser", {
      title: "Edit User",
      user: plainUser
    });
  } catch (err) {
    console.error("Error loading edit user form:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error loading user details. Please try again.",
      },
    });
  }
};

/**
 * Update a user
 */
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Find user to update
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        title: "User Not Found",
        error: {
          status: 404,
          message: "The user you are trying to update does not exist.",
        },
      });
    }

    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.render("admin/editUser", {
          title: "Edit User",
          user,
          error: "Email is already registered by another user.",
        });
      }
    }

    // Update user information
    user.name = name;
    user.email = email;
    user.role = role;

    // Update password if provided
    if (password && password.trim() !== "") {
      user.password = password;
    }

    await user.save();


    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error updating user. Please try again.",
      },
    });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.session.user.id) {
      return res.status(400).render("error", {
        title: "Error",
        error: {
          status: 400,
          message: "You cannot delete your own account.",
        },
      });
    }

    const result = await User.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).render("error", {
        title: "User Not Found",
        error: {
          status: 404,
          message: "The user you are trying to delete does not exist.",
        },
      });
    }

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error deleting user. Please try again.",
      },
    });
  }
};

/**
 * Get city management page
 */
exports.getCities = async (req, res) => {
  try {
    const { search, continent, sort } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { country: new RegExp(search, "i") },
      ];
    }

    if (continent && continent !== "all") {
      filter.continent = continent;
    }

    // Define sort options
    let sortOption = { name: 1 }; // Default sorting

    if (sort === "country") {
      sortOption = { country: 1, name: 1 };
    } else if (sort === "population-high") {
      sortOption = { population: -1 };
    } else if (sort === "population-low") {
      sortOption = { population: 1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const cities = await City.find(filter).sort(sortOption);
    const continents = await City.distinct("continent");
    // Convert to plain objects
    const plainCities = cities.map(city => JSON.parse(JSON.stringify(city)));

    res.render("admin/cities", {
      title: "City Management",
      cities: plainCities,
      continents,
      filters: {
        search,
        continent,
        sort,
      },
    });
  } catch (err) {
    console.error("Error loading cities:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error loading cities. Please try again.",
      },
    });
  }
};

/**
 * Render add city form
 */
exports.getAddCityForm = (req, res) => {
  res.render("admin/addCity", { title: "Add New City" });
};

/**
 * City creation is handled by cityController.createCity
 */

/**
 * City editing is handled by cityController.getEditCityForm and cityController.updateCity
 */

/**
 * City deletion is handled by cityController.deleteCity
 */
