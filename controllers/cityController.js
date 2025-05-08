const City = require("../models/City");
const weatherService = require("../services/weatherService");
const cityDataService = require("../services/cityDataService");

/**
 * Get all cities with optional filtering
 */
exports.getCities = async (req, res) => {
  try {
    const { continent, population, hasAttractions, search } = req.query;

    // Build filter object
    const filter = {};

    if (continent) {
      filter.continent = continent;
    }

    if (population) {
      // Convert to number ranges
      const [min, max] = population.split("-").map(Number);
      filter.population = { $gte: min || 0 };

      if (max) {
        filter.population.$lte = max;
      }
    }

    if (hasAttractions === "true") {
      filter.hasAttractions = true;
    }

    // Text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Get sorting options
    const { sortBy, order } = req.query;
    let sort = {};

    if (sortBy) {
      sort[sortBy] = order === "desc" ? -1 : 1;
    } else {
      // Default sort by name
      sort = { name: 1 };
    }

    let cities = await City.find(filter).sort(sort);
    let apiCityAdded = false;

    // If there is a search term and no results, try to fetch from API
    if (search && cities.length === 0) {
      try {
        console.log(
          `No cities found for "${search}", checking external API...`
        );

        // Get city data from API
        const cityData = await cityDataService.searchCity(search);

        if (cityData) {
          console.log(`Found city data from API:`, cityData);

          // Ensure required fields have values
          if (!cityData.continent || cityData.continent === "Unknown") {
            console.log("Unknown continent, defaulting to 'Africa'");
            cityData.continent = "Africa"; // Default to a continent in your enum
          }

          if (!cityData.population) {
            console.log("No population data, defaulting to 100,000");
            cityData.population = 100000; // Default population
          }

          // Create new city from API data
          const newCity = new City({
            name: cityData.name,
            country: cityData.country,
            continent: cityData.continent,
            population: cityData.population,
            description: cityData.description,
            coordinates: cityData.coordinates,
            hasAttractions: cityData.hasAttractions,
            images: cityData.images,
          });

          // Add weather data if available
          try {
            const weatherData = await weatherService.getWeatherForCity(
              cityData.name,
              cityData.coordinates.latitude,
              cityData.coordinates.longitude
            );

            if (weatherData) {
              newCity.weather = weatherData;
            }
          } catch (weatherErr) {
            console.error(`Error fetching weather for new city:`, weatherErr);
          }

          // Save the new city to database
          await newCity.save();
          console.log(`Saved new city to database: ${newCity.name}`);

          // Add to results
          cities = [newCity];
          apiCityAdded = true;
        }
      } catch (apiErr) {
        console.error("Error fetching from external API:", apiErr);
        // Continue with empty results
      }
    }

    // Convert Mongoose documents to plain objects 
    const plainCities = cities.map((city) => city.toObject());

    // Get unique continents for filter options
    const continents = await City.distinct("continent");

    res.render("cities/index", {
      title: "Explore Cities",
      cities: plainCities,
      continents,
      filters: {
        continent,
        population,
        hasAttractions,
        search,
        sortBy,
        order,
      },
    });
  } catch (err) {
    console.error("Error getting cities:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error retrieving cities. Please try again.",
      },
    });
  }
};

/**
 * Get a single city by ID
 */
exports.getCityById = async (req, res) => {
  try {
    console.log("City ID:", req.params.id); //debug
    const city = await City.findById(req.params.id);

    if (!city) {
      console.log("City not found"); //debug
      return res.status(404).render("error", {
        title: "City Not Found",
        error: {
          status: 404,
          message: "The city you are looking for does not exist.",
        },
      });
    }

    // Log the city data to see what we're getting
    console.log("City from database:", city);

    // Convert Mongoose document to plain object
    const plainCity = JSON.parse(JSON.stringify(city));
    console.log("Plain city object:", plainCity);

    // Check if weather data needs to be updated (older than 3 hours)
    const weatherLastUpdated = city.weather?.lastUpdated || 0;
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    if (!city.weather || weatherLastUpdated < threeHoursAgo) {
      try {
        // Fetch fresh weather data
        const weatherData = await weatherService.getWeatherForCity(
          city.name,
          city.coordinates.latitude,
          city.coordinates.longitude
        );

        // Update city with new weather data
        city.weather = weatherData;
        await city.save();
      } catch (weatherErr) {
        console.error("Error updating weather data:", weatherErr);
        // Continue with existing weather data or empty weather object
      }
    }

    res.render("cities/details", {
      title: `${city.name}, ${city.country}`,
      city: plainCity,
    });
  } catch (err) {
    console.error("Error getting city details:", err);
    res.status(500).render("error", {
      title: "Error",
      error: {
        status: 500,
        message: "Error retrieving city details. Please try again.",
      },
    });
  }
};

/**
 * Render city search page
 */
exports.getSearchPage = (req, res) => {
  res.render("cities/search", {
    title: "Search Cities",
  });
};
