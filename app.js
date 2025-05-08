const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

// Load environment variables
dotenv.config();

// Import routes
const cityRoutes = require('./routes/cityRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hbsHelpers = require('./config/handlebars');

// Import middleware
const { isAuthenticated } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import database configuration
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

// Set up Handlebars as view engine
app.engine('hbs', hbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: hbsHelpers,
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'city-explorer-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI,
    collection: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Static files middleware
app.use(express.static(path.join(__dirname, 'public')));

// Set global variables for views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = req.session.isAuthenticated || false;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

// Routes
app.get('/', (req, res) => {
  res.render('home', { 
    title: 'City Explorer - Discover Cities Around the World',
    user: req.session.user
  });
});

app.use('/cities', cityRoutes);
app.use('/auth', authRoutes);
app.use('/admin', isAuthenticated, adminRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 page
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    error: { status: 404, message: 'The page you are looking for does not exist.' }
  });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;