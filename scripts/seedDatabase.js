const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, './.env') });

// Import models
const City = require("../models/City");
const User = require("../models/User");

// Sample city data
const cities = [
  {
    name: "Paris",
    country: "France",
    continent: "Europe",
    population: 2161000,
    description:
      "Paris, the City of Light, is the capital of France and one of the most visited cities in the world. Known for its stunning architecture, art museums, historical landmarks, and romantic ambiance, Paris is a global center for culture, fashion, gastronomy, and art.",
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    landmarks: [
      {
        name: "Eiffel Tower",
        description:
          "Iconic iron tower on the Champ de Mars, named after its engineer Gustave Eiffel. Completed in 1889, it has become a global icon of France and one of the most recognizable structures in the world.",
        imageUrl:
          "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        name: "Louvre Museum",
        description:
          "The world's largest art museum and a historic monument. A central landmark of Paris, it houses approximately 38,000 objects from prehistory to the 21st century, including the Mona Lisa.",
        imageUrl:
          "https://images.unsplash.com/photo-1574153894202-192d72cf4ffd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        name: "Notre-Dame Cathedral",
        description:
          "A medieval Catholic cathedral on the Île de la Cité. Widely considered to be one of the finest examples of French Gothic architecture, it is among the largest and most well-known churches in the world.",
        imageUrl:
          "https://images.unsplash.com/photo-1576016770956-dce8d64853ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    ],
    hasAttractions: true,
  },
  {
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    population: 13960000,
    description:
      "Tokyo, Japan's busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The city is known for its vibrant food scene and its trendy fashion scene, particularly in the Harajuku district.",
    coordinates: {
      latitude: 35.6762,
      longitude: 139.6503,
    },
    landmarks: [
      {
        name: "Tokyo Skytree",
        description:
          "A broadcasting and observation tower in Sumida, Tokyo. It became the tallest structure in Japan in 2010 and was completed in 2012. At a height of 634 meters, it is the tallest tower in the world.",
        imageUrl:
          "https://images.unsplash.com/photo-1576822214436-bb14c400d167?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        name: "Meiji Shrine",
        description:
          "A Shinto shrine dedicated to the deified spirits of Emperor Meiji and his wife, Empress Shōken. The shrine is located in a forest that covers an area of 70 hectares.",
        imageUrl:
          "https://images.unsplash.com/photo-1583400359434-5c51e9a5150a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1532236204992-f5e85c024202?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    ],
    hasAttractions: true,
  },
  {
    name: "New York",
    country: "United States",
    continent: "North America",
    population: 8419000,
    description:
      "New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that's among the world's major commercial, financial and cultural centers.",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.006,
    },
    landmarks: [
      {
        name: "Statue of Liberty",
        description:
          "A colossal neoclassical sculpture on Liberty Island in New York Harbor, designed by French sculptor Frédéric Auguste Bartholdi and built by Gustave Eiffel. A gift from the people of France, it has become an icon of freedom and of the United States.",
        imageUrl:
          "https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        name: "Empire State Building",
        description:
          "A 102-story Art Deco skyscraper in Midtown Manhattan. It stood as the world's tallest building for nearly 40 years, from its completion in 1931 until the construction of the World Trade Center's North Tower in 1970.",
        imageUrl:
          "https://images.unsplash.com/photo-1579041755942-27e392554ee2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
      {
        name: "Central Park",
        description:
          "An urban park in Manhattan, spanning 843 acres. It is the most visited urban park in the United States, with an estimated 38 million visitors annually, and the most filmed location in the world.",
        imageUrl:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      },
    ],
    images: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
      "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    ],
    hasAttractions: true,
  },
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/city-explorer', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await City.deleteMany({});
    await User.deleteMany({});

    console.log("Existing data cleared");

    // Create admin user
    const adminUser = new User({
      name: process.env.ADMIN_NAME || "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@cityexplorer.com",
      password: process.env.ADMIN_PASSWORD || "adminpassword123",
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created");

    // Create regular test user
    const testUser = new User({
      name: "Test User",
      email: "user@cityexplorer.com",
      password: "userpassword123",
      role: "user",
    });

    await testUser.save();
    console.log("Test user created");

    // Create cities
    const createdCities = await City.insertMany(cities);
    console.log(`${createdCities.length} cities created`);

    // Add some favorite cities to the test user
    testUser.favoriteCities = [createdCities[0]._id, createdCities[1]._id];
    await testUser.save();
    console.log("Added favorite cities to test user");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});
