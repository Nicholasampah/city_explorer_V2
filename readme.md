# City Explorer V2

A full-stack web application to discover cities around the world. City Explorer allows users to browse and search for cities, view details and images, save favourites, and provides admin functionalities for managing city data.

## Features

* User authentication (signup, login, logout)
* Browse city listings with pagination and search
* View detailed city pages with descriptions and images
* Save favourite cities (requires login)
* Admin interface for creating, editing, and deleting city entries
* Session management with MongoDB-backed sessions
* Seed database with sample data via script

## Prerequisites

* Node.js (v14 or higher)
* npm
* MongoDB (local or remote)
* MongoDB Compass (optional, for GUI)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url> city-explorer-v2
   cd city-explorer-v2
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install additional required packages (included in package.json but listed for clarity):

   ```bash
   npm install mongoose express-handlebars handlebars-helpers method-override dotenv connect-mongo axios bcryptjs
   ```

4. Create a **.env** file in the project root with the following content:

   ```dotenv
   MONGO_URI=mongodb://localhost:27017/city-explorer
   SESSION_SECRET=your_session_secret
   ```

## Database Setup

1. Ensure MongoDB is running locally (or update `MONGO_URI` to your remote database).
2. (Optional) Use MongoDB Compass to explore the database.

## Seeding the Database

Seed the database with sample city data by running:

```bash
npm run seed
# or
node scripts/seedDatabase.js
```

## Running the Application

* Start the server:

  ```bash
  npm start
  ```

* For development with automatic reloads:

  ```bash
  npm run dev
  ```

* The application will be available at `http://localhost:3002/` by default.

## Project Structure

```
city-explorer-v2/
├── app.js                 # Application entry point
├── config/                # Configuration (DB, Handlebars helpers)
├── controllers/           # Route logic controllers
├── middleware/            # Authentication, error handling
├── models/                # Mongoose schemas
├── routes/                # Express routes
├── scripts/               # Utility scripts (e.g., database seeding)
├── views/                 # Handlebars templates
├── public/                # Static assets (CSS, JS, images)
├── package.json
├── .env                   # Environment variables
└── README.md              # This file
```

## Environment Variables

* `MONGO_URI`: MongoDB connection string
* `SESSION_SECRET`: Secret key for session encryption
* `PORT`: (optional) Port to run the server (default: `3002`)

## Usage

1. Register a new user via the **Sign Up** page.
2. Log in to access favourites features.
3. Browse cities, view details, and save favourites.
4. Admin users can manage city records under the **Admin** section.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for enhancements or bug fixes.

## License

This project is licensed under the MIT License. Feel free to use and modify.
