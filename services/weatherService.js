const axios = require("axios");

/**
 * Get weather data for a city
 * @param {string} cityName - Name of the city
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Weather data object
 */
exports.getWeatherForCity = async (cityName, lat, lon) => {
  try {
    // Environment variable for API key
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      throw new Error("Weather API key is not configured");
    }

    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);

    // Format the response data
    const weatherData = {
      lastUpdated: new Date(),
      temperature: response.data.main.temp,
      condition: response.data.weather[0].main,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      icon: response.data.weather[0].icon,
    };

    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    throw error;
  }
};
