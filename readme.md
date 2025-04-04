# ProxyAPI.status

A minimalist, secure, and high-performance API proxy for interacting with the UptimeRobot API. This project allows you to retrieve monitor data and obtain detailed incident information with a standardized API response format – all without a build step.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Minimalist**: A clean, efficient architecture with no build process.
- **Secure**: Implements CORS, rate limiting, and secure HTTP headers.
- **High-Performance**: Caching is used to reduce API calls and improve response times.
- **Resilient**: Built-in retry mechanism for robust API calls.
- **Observable**: Integrated logging and metrics for monitoring performance.
- **Standardized Responses**: All endpoints return consistent JSON structures.

---

## Project Structure

```
proxyapi.status/
├── .env.example            # Example environment variables file
├── .gitignore              # Files ignored by Git
├── index.js                # Main application entry point
├── cache.js                # Cache system implementation
├── logger.js               # Logging utility
├── fetch-with-retry.js     # Utility for resilient API calls
├── metrics.js              # Metrics collection and exposure
├── package.json            # Dependencies and scripts
├── vercel.json             # Vercel deployment configuration
└── README.md               # Project documentation
```

---

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- An UptimeRobot account with your API key

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PR0ISY/ProxyAPI.status.git
   cd ProxyAPI.status
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create a `.env` file:**

   ```bash
   cp .env.example .env
   ```

4. **Update the `.env` file** with your configuration values.

---

## Configuration

In your `.env` file, set the following environment variables:

```plaintext
PORT=3000
UPTIME_ROBOT_API_KEY=your-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
API_URL=https://your-api-url.vercel.app
NODE_ENV=development
```

| Variable             | Description                                    | Required                  |
| -------------------- | ---------------------------------------------- | ------------------------- |
| PORT                 | Port on which the API will run                 | No (default: 3000)        |
| UPTIME_ROBOT_API_KEY | Your UptimeRobot API key                       | Yes                       |
| ALLOWED_ORIGINS      | Comma-separated list of allowed origins (CORS) | No (default: \*)          |
| API_URL              | Base URL of your API                           | No                        |
| NODE_ENV             | Environment (development, production)          | No (default: development) |

---

## Usage

### Development

```bash
npm run dev
# or
yarn dev
```

### Production

```bash
npm start
# or
yarn start
```

---

## API Endpoints

### Retrieve All Monitors

```http
GET /api/monitors
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    /* Monitor data from UptimeRobot */
  }
}
```

---

### Retrieve Specific Monitor Details

```http
GET /api/monitor/:pageId/:monitorId
```

- **Parameters:**
  - `pageId`: Status page ID
  - `monitorId`: Monitor ID

**Response Example:**

```json
{
  "success": true,
  "data": {
    /* Monitor details including incidents */
  }
}
```

---

### Clear Cache

```http
POST /api/clear-cache
```

**Response Example:**

```json
{
  "success": true,
  "data": { "message": "Cache cleared successfully" }
}
```

---

### Health Check

```http
GET /health
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 12345,
    "timestamp": 1612345678901,
    "version": "1.0.0"
  }
}
```

---

### Display Metrics

```http
GET /metrics
```

**Response Example:**

```json
{
  "success": true,
  "data": {
    /* API performance metrics */
  }
}
```

---

## Deployment

### Deploy on Vercel

1. Sign up or log in to [Vercel](https://vercel.com).
2. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

3. Log in to your Vercel account:

   ```bash
   vercel login
   ```

4. Deploy your project:

   ```bash
   vercel
   ```

5. Configure your environment variables in the Vercel dashboard.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m 'Add your feature'
   ```

4. Push the branch:

   ```bash
   git push origin feature/your-feature
   ```

5. Open a Pull Request.

---

## License

This project is licensed under the MIT License.
