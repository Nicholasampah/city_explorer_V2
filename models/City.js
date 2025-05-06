const mongoose = require('mongoose');

const LandmarkSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  }
});

const WeatherSchema = new mongoose.Schema({
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  temperature: {
    type: Number
  },
  condition: {
    type: String
  },
  humidity: {
    type: Number
  },
  windSpeed: {
    type: Number
  },
  icon: {
    type: String
  }
});

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  country: {
    type: String,
    required: true
  },
  continent: {
    type: String,
    required: true,
    enum: ['Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America','Unknown']
  },
  population: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  landmarks: [LandmarkSchema],
  weather: WeatherSchema,
  images: [{
    type: String
  }],
  hasAttractions: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
CitySchema.index({ name: 'text', country: 'text', description: 'text' });

// Update the updatedAt field on save
CitySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('City', CitySchema);