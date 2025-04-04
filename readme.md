# UptimeRobot API Proxy

A minimalist, secure, and high-performance backend API for interacting with the UptimeRobot API. This project allows you to retrieve monitor data via the UptimeRobot API and obtain detailed information about incidents specific to a monitor.

## 📋 Table of Contents

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

## ✨ Features

- **Minimalist**: Simple and efficient architecture
- **Secure**: Implementation of CORS, rate limiting, and secure headers
- **High-Performance**: Response caching to reduce API calls
- **Resilient**: Retry mechanism for API calls
- **Observable**: Logging and metrics to monitor performance

## 📁 Project Structure

```
uptimerobot-api/
├── .env.example        # Example environment variables file
├── .gitignore          # Files to be ignored by Git
├── index.js            # Main application entry point
├── cache.js            # Cache system implementation
├── logger.js           # Logging utility
├── fetch-with-retry.js # Utility for resilient API calls
├── metrics.js          # Metrics collection and exposure
├── package.json        # Dependencies and scripts
├── vercel.json         # Configuration for Vercel deployment
└── README.md           # Project documentation
```

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- UptimeRobot account with an API key

## 🚀 Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/uptimerobot-api.git
   cd uptimerobot-api
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

4. Modify the `.env` file with your own values.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file at the root of the project with the following variables:

```plaintext
PORT=3000
UPTIME_ROBOT_API_KEY=your-api-key-here
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
API_URL=https://your-api-url.vercel.app
NODE_ENV=development
```

| Variable             | Description                           | Required                  |
| -------------------- | ------------------------------------- | ------------------------- |
| PORT                 | Port on which the API will run        | No (default: 3000)        |
| UPTIME_ROBOT_API_KEY | Your UptimeRobot API key              | Yes                       |
| ALLOWED_ORIGINS      | List of allowed origins (CORS)        | No (default: \*)          |
| API_URL              | Base URL of your API                  | No                        |
| NODE_ENV             | Environment (development, production) | No (default: development) |

## 🏃‍♂️ Usage

### Start in development mode

```bash
npm run dev
# or
yarn dev
```

### Start in production mode

```bash
npm start
# or
yarn start
```

## 🔌 API Endpoints

### Retrieve all monitors

```plaintext
GET /api/monitors
```

Retrieves all monitors from UptimeRobot.

**Example response:**

```json
{
  "stat": "ok",
  "pagination": {
    "offset": 0,
    "limit": 50,
    "total": 2
  },
  "monitors": [
    {
      "id": 123456789,
      "friendly_name": "My website",
      "url": "https://example.com",
      "type": 1,
      "status": 2,
      "all_time_uptime_ratio": 99.98,
      "create_datetime": 1612345678
    }
  ]
}
```

### Retrieve details of a specific monitor

```plaintext
GET /api/monitor/:pageId/:monitorId
```

Retrieves details of a specific monitor, including incidents.

**Parameters:**

- `pageId`: Status page ID
- `monitorId`: Monitor ID

**Example response:**

```json
{
  "monitor": {
    "id": "m789xyz",
    "friendly_name": "My website",
    "status": "up",
    "incidents": [
      {
        "id": "inc123",
        "type": "down",
        "duration": 125,
        "start_time": 1612345678,
        "end_time": 1612345803
      }
    ]
  }
}
```

### Clear cache

```plaintext
POST /api/clear-cache
```

Manually clears the API cache.

### Check API status

```plaintext
GET /health
```

Checks the status of the API.

### Display metrics

```plaintext
GET /metrics
```

Displays API performance metrics.

## 🚢 Deployment

### Deployment on Vercel

1. Create an account on [Vercel](https://vercel.com) if you don't already have one.
2. Install Vercel CLI:
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
5. Configure environment variables in the Vercel dashboard:
   1. Go to your project settings
   2. Navigate to the "Environment Variables" tab
   3. Add all necessary environment variables

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```
2. Start the server:
   ```bash
   npm start
   ```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
