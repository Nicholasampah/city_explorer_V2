/**
 * Custom helpers for Handlebars templates
 */
module.exports = {
  // Check if two values are equal
  eq: function (a, b) {
    return a === b;
  },

  // Check if the first value is greater than the second
  gt: function (a, b) {
    return a > b;
  },

  // Format a number with comma separators
  formatNumber: function (number) {
    return new Intl.NumberFormat().format(number);
  },

  // Format a date to a readable string
  formatDate: function (date) {
    if (!date) return "";

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return new Date(date).toLocaleDateString("en-US", options);
  },

  // Format a short date (without time)
  formatShortDate: function (date) {
    if (!date) return "";

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Date(date).toLocaleDateString("en-US", options);
  },

  // Simple addition helper
  add: function (a, b) {
    return a + b;
  },

  // Simple subtraction helper
  subtract: function (a, b) {
    return a - b;
  },

  // Get current year for copyright notices
  currentYear: function () {
    return new Date().getFullYear();
  },

  // Limit text to a specific length
  limitText: function (text, length) {
    if (!text) return "";

    if (text.length <= length) return text;

    return text.substring(0, length) + "...";
  },

  // Convert a value to lowercase
  lowercase: function (text) {
    return text ? text.toLowerCase() : "";
  },

  // Convert a value to uppercase
  uppercase: function (text) {
    return text ? text.toUpperCase() : "";
  },

  // Create an array of numbers for iteration (useful for pagination)
  range: function (start, end) {
    const result = [];

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  },

  // Conditional for checking if a value is in an array
  inArray: function (item, array, options) {
    if (!array) return options.inverse(this);

    return array.includes(item) ? options.fn(this) : options.inverse(this);
  },

  // Escape JSON for safe inclusion in script tags
  jsonStringify: function (obj) {
    return JSON.stringify(obj);
  },
};
