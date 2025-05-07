const User = require('../models/User');
const City = require('../models/City');

/**
 * Render login page
 */
exports.getLoginPage = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

/**
 * Handle user login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Please provide both email and password.',
        email
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials.',
        email
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        error: 'Invalid credentials.',
        email
      });
    }
    
    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.isAuthenticated = true;
    req.session.isAdmin = user.role === 'admin';
    
    // Redirect to original destination or home
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      title: 'Login',
      error: 'An error occurred during login. Please try again.',
      email: req.body.email
    });
  }
};

/**
 * Render registration page
 */
exports.getRegisterPage = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

/**
 * Handle user registration
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Please provide all required fields.',
        name,
        email
      });
    }
    
    if (password !== confirmPassword) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Passwords do not match.',
        name,
        email
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email is already registered.',
        name,
        email
      });
    }
    
    // Create new user (default role is 'user')
    const user = new User({
      name,
      email,
      password
    });
    
    await user.save();
    
    // Set session
    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.isAuthenticated = true;
    req.session.isAdmin = user.role === 'admin';
    
    res.redirect('/');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('auth/register', {
      title: 'Register',
      error: 'An error occurred during registration. Please try again.',
      name: req.body.name,
      email: req.body.email
    });
  }
};

/**
 * Handle user logout
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).render('error', { 
        title: 'Error',
        error: { 
          status: 500, 
          message: 'Error during logout. Please try again.' 
        }
      });
    }
    
    res.redirect('/');
  });
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id)
      .populate('favoriteCities');
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        error: { 
          status: 404, 
          message: 'User profile not found.' 
        }
      });
    }

    // Convert to plain object
    const plainUser = user.toObject();
    
    res.render('auth/profile', {
      title: 'My Profile',
      profile: plainUser
    });
  } catch (err) {
    console.error('Error retrieving profile:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error retrieving profile. Please try again.' 
      }
    });
  }
};

/**
 * Render edit profile page
 */
exports.getEditProfilePage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        error: { 
          status: 404, 
          message: 'User profile not found.' 
        }
      });
    }

    const plainUser = JSON.parse(JSON.stringify(user));

    
    res.render('auth/edit-profile', {
      title: 'Edit Profile',
      user: plainUser
    });
  } catch (err) {
    console.error('Error loading edit profile:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error loading profile details. Please try again.' 
      }
    });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.render('auth/edit-profile', {
        title: 'Edit Profile',
        error: 'Please provide all required fields.',
        user: { name, email }
      });
    }
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        error: { 
          status: 404, 
          message: 'User profile not found.' 
        }
      });
    }
    
    // Check if email is being changed and if it's already in use
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return res.render('auth/edit-profile', {
          title: 'Edit Profile',
          error: 'Email is already registered by another user.',
          user
        });
      }
    }
    
    // Update user information
    user.name = name;
    user.email = email;
    
    await user.save();
    
    // Update session with new user info
    req.session.user.name = user.name;
    req.session.user.email = user.email;
    
    // Redirect with success message
    req.session.success = 'Profile updated successfully!';
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error updating profile. Please try again.' 
      }
    });
  }
};

/**
 * Render change password page
 */
exports.getChangePasswordPage = (req, res) => {
  res.render('auth/change-password', { title: 'Change Password' });
};

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.render('auth/change-password', {
        title: 'Change Password',
        error: 'Please provide all required fields.'
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.render('auth/change-password', {
        title: 'Change Password',
        error: 'New passwords do not match.'
      });
    }
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.status(404).render('error', { 
        title: 'User Not Found',
        error: { 
          status: 404, 
          message: 'User not found.' 
        }
      });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.render('auth/change-password', {
        title: 'Change Password',
        error: 'Current password is incorrect.'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Redirect with success message
    req.session.success = 'Password changed successfully!';
    res.redirect('/auth/profile');
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error changing password. Please try again.' 
      }
    });
  }
};

/**
 * Add city to favorites
 */
exports.addToFavorites = async (req, res) => {
  try {
    const { cityId } = req.params;
    const userId = req.session.user.id;
    
    // Check if city exists
    const city = await City.findById(cityId);
    
    if (!city) {
      return res.status(404).render('error', { 
        title: 'City Not Found',
        error: { 
          status: 404, 
          message: 'The city you are trying to add to favorites does not exist.' 
        }
      });
    }
    
    // Add city to user's favorites (if not already added)
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteCities: cityId } }
    );
    
    // Set success message and redirect
    req.session.success = `${city.name} added to your favorites!`;
    res.redirect(`/cities/${cityId}`);
  } catch (err) {
    console.error('Error adding to favorites:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error adding city to favorites. Please try again.' 
      }
    });
  }
};

/**
 * Remove city from favorites
 */
exports.removeFromFavorites = async (req, res) => {
  try {
    const { cityId } = req.params;
    const userId = req.session.user.id;
    
    // Find city name for success message (if needed)
    const city = await City.findById(cityId);
    
    // Remove city from user's favorites
    await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteCities: cityId } }
    );
    
    // Set success message
    if (city) {
      req.session.success = `${city.name} removed from your favorites.`;
    }
    
    // Check if the request wants to redirect back to the profile
    const redirectToProfile = req.query.from === 'profile';
    
    if (redirectToProfile) {
      res.redirect('/auth/profile');
    } else {
      res.redirect(`/cities/${cityId}`);
    }
  } catch (err) {
    console.error('Error removing from favorites:', err);
    res.status(500).render('error', { 
      title: 'Error',
      error: { 
        status: 500, 
        message: 'Error removing city from favorites. Please try again.' 
      }
    });
  }
};

/**
 * Check if a city is in user's favorites
 * Used by API routes to get favorite status
 */
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const { cityId } = req.params;
    
    if (!req.session.isAuthenticated) {
      return res.json({ isFavorite: false });
    }
    
    const user = await User.findById(req.session.user.id);
    
    if (!user) {
      return res.json({ isFavorite: false });
    }
    
    const isFavorite = user.favoriteCities.includes(cityId);
    
    res.json({ isFavorite });
  } catch (err) {
    console.error('Error checking favorite status:', err);
    res.status(500).json({ 
      error: 'Error checking favorite status',
      isFavorite: false 
    });
  }
};