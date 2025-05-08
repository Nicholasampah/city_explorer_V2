const axios = require('axios');
const City = require('../models/City');

/**
 * Service to fetch city data from external API
 */
const cityDataService = {
  /**
   * Search for a city using external API
   * @param {string} cityName - Name of the city to search
   * @returns {Promise<Object>} City data or null if not found
   */
  async searchCity(cityName) {
    try {
      const apiKey = process.env.OPENCAGE_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenCage API key is not configured');
      }
      
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: cityName,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1,
          no_annotations: 1
        }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const components = result.components;
        
        // Determine continent based on country code
        const continent = this.getContinent(components.continent || components.country_code);

         // Estimate population based on city
         let estimatedPopulation = 100000; // Default small city population
        
        // Build city object
        const cityData = {
          name: components.city || components.town || components.village || cityName,
          country: components.country || 'Unknown',
          continent: continent,
          coordinates: {
            latitude: result.geometry.lat,
            longitude: result.geometry.lng
          },
          population: estimatedPopulation || null, 
          description: `${components.city || components.town || components.village || cityName} is a city located in ${components.country}.`,
          hasAttractions: false, // Default value
          images: [] // Default empty array
        };
        
        return cityData;
      }
      
      return null;
    } catch (error) {
      console.error(`Error searching for city ${cityName}:`, error);
      throw error;
    }
  },
  
  /**
   * Get continent based on country code
   * @param {string} countryCode - ISO country code
   * @returns {string} Continent name
   */
  getContinent(input) {
    if (!input) return 'Unknown';
    
    // If it's already a continent name, map it to an enum
    const continentMap = {
      'Africa': 'Africa',
      'Antarctica': 'Antarctica', 
      'Asia': 'Asia',
      'Europe': 'Europe',
      'North America': 'North America',
      'Oceania': 'Oceania',
      'South America': 'South America'
    };
    
    if (continentMap[input]) {
      return continentMap[input];
    }
    
    // Map country codes to continents
    const countryToContinent = {
      // Africa
      'DZ': 'Africa', 'AO': 'Africa', 'BJ': 'Africa', 'BW': 'Africa', 'BF': 'Africa',
      'BI': 'Africa', 'CV': 'Africa', 'CM': 'Africa', 'CF': 'Africa', 'TD': 'Africa',
      'KM': 'Africa', 'CG': 'Africa', 'CD': 'Africa', 'DJ': 'Africa', 'EG': 'Africa',
      'GQ': 'Africa', 'ER': 'Africa', 'ET': 'Africa', 'GA': 'Africa', 'GM': 'Africa',
      'GH': 'Africa', 'GN': 'Africa', 'GW': 'Africa', 'CI': 'Africa', 'KE': 'Africa',
      'LS': 'Africa', 'LR': 'Africa', 'LY': 'Africa', 'MG': 'Africa', 'MW': 'Africa',
      'ML': 'Africa', 'MR': 'Africa', 'MU': 'Africa', 'MA': 'Africa', 'MZ': 'Africa',
      'NA': 'Africa', 'NE': 'Africa', 'NG': 'Africa', 'RW': 'Africa', 'ST': 'Africa',
      'SN': 'Africa', 'SC': 'Africa', 'SL': 'Africa', 'SO': 'Africa', 'ZA': 'Africa',
      'SS': 'Africa', 'SD': 'Africa', 'SZ': 'Africa', 'TZ': 'Africa', 'TG': 'Africa',
      'TN': 'Africa', 'UG': 'Africa', 'ZM': 'Africa', 'ZW': 'Africa',
      
      // Asia
      'AF': 'Asia', 'AM': 'Asia', 'AZ': 'Asia', 'BH': 'Asia', 'BD': 'Asia',
      'BT': 'Asia', 'BN': 'Asia', 'KH': 'Asia', 'CN': 'Asia', 'CY': 'Asia',
      'GE': 'Asia', 'IN': 'Asia', 'ID': 'Asia', 'IR': 'Asia', 'IQ': 'Asia',
      'IL': 'Asia', 'JP': 'Asia', 'JO': 'Asia', 'KZ': 'Asia', 'KW': 'Asia',
      'KG': 'Asia', 'LA': 'Asia', 'LB': 'Asia', 'MY': 'Asia', 'MV': 'Asia',
      'MN': 'Asia', 'MM': 'Asia', 'NP': 'Asia', 'KP': 'Asia', 'OM': 'Asia',
      'PK': 'Asia', 'PS': 'Asia', 'PH': 'Asia', 'QA': 'Asia', 'SA': 'Asia',
      'SG': 'Asia', 'KR': 'Asia', 'LK': 'Asia', 'SY': 'Asia', 'TW': 'Asia',
      'TJ': 'Asia', 'TH': 'Asia', 'TR': 'Asia', 'TM': 'Asia', 'AE': 'Asia',
      'UZ': 'Asia', 'VN': 'Asia', 'YE': 'Asia',
      
      // Europe
      'AL': 'Europe', 'AD': 'Europe', 'AT': 'Europe', 'BY': 'Europe', 'BE': 'Europe',
      'BA': 'Europe', 'BG': 'Europe', 'HR': 'Europe', 'CZ': 'Europe', 'DK': 'Europe',
      'EE': 'Europe', 'FI': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'GR': 'Europe',
      'HU': 'Europe', 'IS': 'Europe', 'IE': 'Europe', 'IT': 'Europe', 'LV': 'Europe',
      'LI': 'Europe', 'LT': 'Europe', 'LU': 'Europe', 'MT': 'Europe', 'MD': 'Europe',
      'MC': 'Europe', 'ME': 'Europe', 'NL': 'Europe', 'MK': 'Europe', 'NO': 'Europe',
      'PL': 'Europe', 'PT': 'Europe', 'RO': 'Europe', 'RU': 'Europe', 'SM': 'Europe',
      'RS': 'Europe', 'SK': 'Europe', 'SI': 'Europe', 'ES': 'Europe', 'SE': 'Europe',
      'CH': 'Europe', 'UA': 'Europe', 'GB': 'Europe', 'UK': 'Europe', 'VA': 'Europe',
      
      // North America
      'AG': 'North America', 'BS': 'North America', 'BB': 'North America', 'BZ': 'North America',
      'CA': 'North America', 'CR': 'North America', 'CU': 'North America', 'DM': 'North America',
      'DO': 'North America', 'SV': 'North America', 'GD': 'North America', 'GT': 'North America',
      'HT': 'North America', 'HN': 'North America', 'JM': 'North America', 'MX': 'North America',
      'NI': 'North America', 'PA': 'North America', 'KN': 'North America', 'LC': 'North America',
      'VC': 'North America', 'TT': 'North America', 'US': 'North America',
      
      // South America
      'AR': 'South America', 'BO': 'South America', 'BR': 'South America', 'CL': 'South America',
      'CO': 'South America', 'EC': 'South America', 'GY': 'South America', 'PY': 'South America',
      'PE': 'South America', 'SR': 'South America', 'UY': 'South America', 'VE': 'South America',
      
      // Oceania
      'AU': 'Oceania', 'FJ': 'Oceania', 'KI': 'Oceania', 'MH': 'Oceania', 'FM': 'Oceania',
      'NR': 'Oceania', 'NZ': 'Oceania', 'PW': 'Oceania', 'PG': 'Oceania', 'WS': 'Oceania',
      'SB': 'Oceania', 'TO': 'Oceania', 'TV': 'Oceania', 'VU': 'Oceania',
      
      // Antarctica
      'AQ': 'Antarctica'
    };
    
    return countryToContinent[input.toUpperCase()] || 'Unknown';
  }
};

module.exports = cityDataService;