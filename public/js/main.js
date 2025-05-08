document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navList = document.querySelector(".nav-list");

  if (menuToggle && navList) {
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      navList.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });
  }

  // Initialize Google Map 
  const mapContainer = document.getElementById("cityMap");

  if (mapContainer) {
    const lat = parseFloat(mapContainer.getAttribute("data-lat"));
    const lng = parseFloat(mapContainer.getAttribute("data-lng"));
    const cityName = mapContainer.getAttribute("data-name");

    if (lat && lng) {
      // Leaflet.js
      const map = L.map("cityMap").setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(cityName).openPopup();
    }
  }

  // Handle image gallery interactions
  const mainImage = document.getElementById("mainImage");
  const thumbnails = document.querySelectorAll(".gallery-thumbnail");

  if (mainImage && thumbnails.length > 0) {
    // Set first thumbnail as active
    thumbnails[0].classList.add("active");

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        const imageUrl = this.getAttribute("data-image");

        // Update main image
        mainImage.src = imageUrl;

        // Update active thumbnail
        thumbnails.forEach((thumb) => thumb.classList.remove("active"));
        this.classList.add("active");
      });
    });
  }

  // Handle form validation
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    const passwordField = form.querySelector('input[type="password"]');
    const confirmPasswordField = form.querySelector(
      'input[name="confirmPassword"]'
    );

    if (passwordField && confirmPasswordField) {
      form.addEventListener("submit", function (event) {
        if (passwordField.value !== confirmPasswordField.value) {
          event.preventDefault();
          alert("Passwords do not match. Please try again.");
        }
      });
    }
  });

  // Initialize tooltips
  const tooltipTriggers = document.querySelectorAll("[data-tooltip]");

  tooltipTriggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", function () {
      const tooltipText = this.getAttribute("data-tooltip");

      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.textContent = tooltipText;

      document.body.appendChild(tooltip);

      const triggerRect = this.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();

      tooltip.style.top = triggerRect.top - tooltipRect.height - 10 + "px";
      tooltip.style.left =
        triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + "px";

      tooltip.classList.add("visible");

      this.addEventListener(
        "mouseleave",
        function () {
          tooltip.remove();
        },
        { once: true }
      );
    });
  });

  // Dynamic content loading for city details page
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      const cityId = this.getAttribute("data-city-id");
      const contentContainer = document.getElementById("dynamicContent");

      if (cityId && contentContainer) {
        contentContainer.innerHTML =
          '<div class="loading">Loading additional information...</div>';

        fetch(`/api/cities/${cityId}/details`)
          .then((response) => response.json())
          .then((data) => {
            contentContainer.innerHTML = data.content;
          })
          .catch((error) => {
            console.error("Error loading additional content:", error);
            contentContainer.innerHTML =
              "<p>Error loading additional content. Please try again.</p>";
          });
      }
    });
  }

  // Add Handlebars helpers for use in client-side templates
  if (typeof Handlebars !== "undefined") {
    Handlebars.registerHelper("formatNumber", function (number) {
      return new Intl.NumberFormat().format(number);
    });

    Handlebars.registerHelper("formatDate", function (date) {
      return new Date(date).toLocaleDateString();
    });

    Handlebars.registerHelper("eq", function (a, b) {
      return a === b;
    });

    Handlebars.registerHelper("gt", function (a, b) {
      return a > b;
    });

    Handlebars.registerHelper("add", function (a, b) {
      return a + b;
    });
  }
});
