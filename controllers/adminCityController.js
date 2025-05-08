const City = require("../models/City");
const weatherService = require("../services/weatherService");
const cityDataService = require("../services/cityDataService");

/**
 * Admin: Create a new city
 */
exports.createCity = async (req, res) => {
  try {
    const {
      name,
      country,
      continent,
      population,
      description,
      latitude,
      longitude,
      hasAttractions,
    } = req.body;

    // Create new city
    const city = new City({
      name,
      country,
      continent,
      population: parseInt(population, 10),
      description,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      hasAttractions: hasAttractions === "on",
    });

    // Add landmarks if provided
    if (req.body.landmarkName && Array.isArray(req.body.landmarkName)) {
      for (let i = 0; i < req.body.landmarkName.length; i++) {
        if (req.body.landmarkName[i] && req.body.landmarkDescription[i]) {
          city.landmarks.push({
            name: req.body.landmarkName[i],
            description: req.body.landmarkDescription[i],
            imageUrl: req.body.landmarkImage[i] || "",
          });
        }
      }
    } else if (req.body.landmarkName) {
      // Handle single landmark
      city.landmarks.push({
        name: req.body.landmarkName,
        description: req.body.landmarkDescription,
        imageUrl: req.body.landmarkImage || "",
      });
    }

    // Add images if provided
    if (req.body.images) {
      const images = Array.isArray(req.body.images)
        ? req.body.images.filter((img) => img)
        : [req.body.images];

      city.images = images;
    }

    // Fetch initial weather data
    try {
      const weatherData = await weatherService.getWeatherForCity(
        name,
        parseFloat(latitude),
        parseFloat(longitude)
      );

      city.weather = weatherData;
    } catch (weatherErr) {
      console.error("Error fetching initial weather data:", weatherErr);
      // Continue without weather data
    }

    await city.save();

    res.redirect(`/cities/${city._id}`);
  } catch (err) {
    console.error("Error creating city:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error creating city. Please try again.",
      },
    });
  }
};

/**
 * Admin: Render edit city form
 */
exports.getEditCityForm = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).render("error", {
        title: "City Not Found",
        error: {
          status: 404,
          message: "The city you are looking for does not exist.",
        },
      });
    }

    // Convert Mongoose document to plain object
    const plainCity = JSON.parse(JSON.stringify(city));

    res.render("admin/editCity", {
      title: `Edit ${city.name}`,
      city: plainCity,
    });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error retrieving city for editing. Please try again.",
      },
    });
  }
};

/**
 * Admin: Update a city
 */
exports.updateCity = async (req, res) => {
  try {
    const {
      name,
      country,
      continent,
      population,
      description,
      latitude,
      longitude,
      hasAttractions,
    } = req.body;

    // Find city to update
    const city = await City.findById(req.params.id);

    if (!city) {
      return res.status(404).render("error", {
        title: "City Not Found",
        error: {
          status: 404,
          message: "The city you are trying to update does not exist.",
        },
      });
    }

    // Update basic info
    city.name = name;
    city.country = country;
    city.continent = continent;
    city.population = parseInt(population, 10);
    city.description = description;
    city.coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    city.hasAttractions = hasAttractions === "on";

    // Clear and update landmarks
    city.landmarks = [];

    if (req.body.landmarkName && Array.isArray(req.body.landmarkName)) {
      for (let i = 0; i < req.body.landmarkName.length; i++) {
        if (req.body.landmarkName[i] && req.body.landmarkDescription[i]) {
          city.landmarks.push({
            name: req.body.landmarkName[i],
            description: req.body.landmarkDescription[i],
            imageUrl: req.body.landmarkImage[i] || "",
          });
        }
      }
    } else if (req.body.landmarkName) {
      // Handle single landmark
      city.landmarks.push({
        name: req.body.landmarkName,
        description: req.body.landmarkDescription,
        imageUrl: req.body.landmarkImage || "",
      });
    }

    // Update images
    if (req.body.images) {
      const images = Array.isArray(req.body.images)
        ? req.body.images.filter((img) => img)
        : [req.body.images];

      city.images = images;
    }

    // Check if coordinates changed, if so update weather
    const coordsChanged =
      city.coordinates.latitude !== parseFloat(latitude) ||
      city.coordinates.longitude !== parseFloat(longitude);

    if (coordsChanged) {
      try {
        const weatherData = await weatherService.getWeatherForCity(
          name,
          parseFloat(latitude),
          parseFloat(longitude)
        );

        city.weather = weatherData;
      } catch (weatherErr) {
        console.error(
          "Error updating weather after location change:",
          weatherErr
        );
        // Continue with existing weather data
      }
    }

    await city.save();

    res.redirect(`/cities/${city._id}`);
  } catch (err) {
    console.error("Error updating city:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error updating city. Please try again.",
      },
    });
  }
};

/**
 * Admin: Render form to add a new city
 */
exports.getAddCityForm = (req, res) => {
  res.render("admin/addCity", {
    title: "Add New City",
  });
};

/**
 * Admin: Delete a city
 */
exports.deleteCity = async (req, res) => {
  try {
    const result = await City.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).render("error", {
        title: "City Not Found",
        error: {
          status: 404,
          message: "The city you are trying to delete does not exist.",
        },
      });
    }

    res.redirect("/cities");
  } catch (err) {
    console.error("Error deleting city:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error deleting city. Please try again.",
      },
    });
  }
};
