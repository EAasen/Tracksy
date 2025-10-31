# Tracksy - Adventure & Fitness Platform 🏔️🚴‍♂️🥾
A comprehensive open-source platform for fitness tracking, adventure planning, and outdoor exploration. Built with privacy and community at its core.

## 🌟 Features

### Core Fitness Tracking
- **Data Integration**: Sync data from various health and fitness ecosystems (Garmin, Apple Health, Fitbit, and more)
- **Activity Tracking**: Log and visualize activities like running, cycling, swimming, hiking, and adventure sports
- **Health Metrics**: Collect and display metrics such as heart rate, sleep, recovery, and performance analytics
- **Custom Analytics**: Generate detailed reports and insights based on your activities and adventures

### Adventure Planning & Discovery
- **Trip Planning**: Create detailed itineraries with waypoints, elevation profiles, and timing
- **Route Discovery**: Browse curated trails and routes from multiple data sources
- **Multi-Activity Support**: Hiking, cycling, trail running, rock climbing, and custom adventure activities
- **Offline Maps**: Download maps for offline use during adventures
- **Community Sharing**: Share your adventures with friends and the outdoor community

### Data Sources & Integration
- **Trail Database**: Integration with comprehensive trail databases and topographic data
- **Weather Integration**: Real-time weather data for adventure planning and safety
- **Elevation Data**: Accurate elevation profiles and difficulty ratings for routes
- **Community Contributions**: User-generated content, reviews, and route recommendations

## 🏗️ Architecture & Deployment

### Self-Hosted Solution 🆓
- Complete privacy and data ownership
- Basic trail database and fitness tracking included
- Community features within your instance
- No external dependencies for core features
- Docker-based deployment for easy setup

### Hosted Solution ☁️
- Access to extended trail database and premium integrations
- Cross-instance community sharing and social features
- Managed updates, backups, and infrastructure
- Premium data sources and advanced analytics

### Platform Support
- **Web Interface**: Full-featured responsive web application
- **Mobile Apps**: Native iOS and Android applications (planned)
- **API**: RESTful API for third-party integrations and custom applications

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture & Deployment](#architecture--deployment)
- [Quick Start](#quick-start)
- [Developer Marketplace](#developer-marketplace)
- [Privacy and Security](#privacy-and-security)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Support & Community](#support--community)

## Overview
Tracksy is an open-source alternative to fitness tracking platforms like Strava, enhanced with comprehensive adventure planning capabilities. The platform provides users full control over their data while supporting both fitness tracking and outdoor adventure planning.

The platform supports data integration from a wide range of sources, including Garmin Connect, Apple Health, Android Health, Huawei Health, Coros, Fitbit, Samsung Health, Wahoo, Suunto, Polar, and more. Additionally, it integrates with trail databases, weather services, and topographic data sources for comprehensive adventure planning.

### Unique Features
- **Multi-Source Data Integration**: Unlike many competitors, Tracksy supports a wide range of data sources, giving users more flexibility
- **Adventure-First Design**: Combines fitness tracking with comprehensive outdoor adventure planning tools
- **User-Controlled Data Privacy**: Users have full control over who can access their data, ensuring privacy and security
- **Extensible Platform**: With open APIs and support for custom plugins, Tracksy can be tailored to meet specific user needs
- **Offline-First Approach**: Download maps and plan adventures for areas without cellular coverage

## 🚀 Quick Start

### Self-Hosted Deployment

#### Prerequisites
- Docker and Docker Compose
- 2GB+ RAM recommended
- 10GB+ storage for maps and fitness data

#### Installation

```bash
# Clone the repository
git clone https://github.com/EAasen/Tracksy.git
cd Tracksy

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the platform
docker-compose up -d

# Initialize database and download basic maps
docker-compose exec app ./scripts/initialize.sh
```

#### Configuration

Edit `.env` file with your settings:

```env
# Basic Configuration
DOMAIN=localhost:3000
SECRET_KEY=your-secret-key-here

# Database (MongoDB)
DATABASE_URL=mongodb://localhost:27017/tracksy
# For Docker: mongodb://mongo:27017/tracksy
# For production with auth: mongodb://username:password@host:27017/tracksy

# Map Tiles (Optional - uses OpenStreetMap by default)
MAPBOX_TOKEN=your-mapbox-token
THUNDERFOREST_API_KEY=your-key

# External Services (Optional)
WEATHER_API_KEY=your-weather-api-key
ELEVATION_SERVICE_URL=https://api.opentopodata.org

# Fitness Integrations
GARMIN_CLIENT_ID=your-garmin-client-id
GARMIN_CLIENT_SECRET=your-garmin-client-secret
FITBIT_CLIENT_ID=your-fitbit-client-id
FITBIT_CLIENT_SECRET=your-fitbit-client-secret
```

### Hosted Version

Sign up at [tracksy-platform.com](https://tracksy-platform.com) for:
- Extended trail database access and premium integrations
- Cross-platform community features and social sharing
- Managed hosting, updates, and backups
- Priority support and advanced analytics

## Developer Marketplace

### In-App Solutions
Developers can create and sell features or extensions for the platform, including:
- Custom analytics and reporting tools
- Adventure planning plugins and route optimization
- Integration modules for new fitness devices and trail databases
- Community features and social sharing enhancements

### Third-Party Integrations
Use platform APIs to integrate user data with external applications:
- Fitness coaching and training platforms
- Nutrition and meal planning applications
- Weather and safety monitoring services
- Outdoor gear and equipment recommendations

## Privacy and Security

### User Control
Users decide who can access their data, with granular permissions for:
- Fitness and health metrics sharing
- Adventure route and location data
- Community interaction and social features
- Third-party application access

### Anonymized Data Usage
Enable optional sharing of anonymized data for:
- Training algorithms and improving functionality
- Contributing to trail condition and safety databases
- Enhancing community features and recommendations

### Data Encryption
All data is encrypted in transit and at rest, including:
- Personal fitness and health information
- Location data and adventure routes
- Authentication tokens and API credentials
- User communications and social interactions

### Privacy Policy
We are committed to protecting your privacy and personal data. For details on how we collect, use, and protect your data, please see our [Privacy Policy](PRIVACY.md).

## 🗂️ Project Structure

```
Tracksy/
├── backend/                 # API server (Node.js/Express)
│   ├── app.js              # Main application server
│   ├── API.md              # 📘 API Documentation (v1)
│   ├── config/
│   │   ├── database.js     # Database models and schemas
│   │   └── logger.js       # Logging configuration
│   ├── middleware/         # Express middleware
│   │   ├── auth.js         # JWT authentication
│   │   ├── errorHandler.js # Centralized error handling
│   │   └── validator.js    # Request validation
│   ├── routes/
│   │   ├── index.js        # Route aggregator
│   │   ├── health.js       # Health check endpoints
│   │   └── v1/             # API v1 endpoints
│   │       ├── index.js    # v1 route aggregator
│   │       ├── auth.js     # Authentication endpoints
│   │       ├── activities.js   # Activity CRUD
│   │       └── health-metrics.js # Health metrics CRUD
│   └── package.json
├── frontend/               # Web application (React)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── store/          # Redux state management
│   │   └── utils/          # Helper functions and utilities
│   ├── public/
│   │   └── service-worker.js # PWA service worker
│   ├── styles/             # CSS and styling
│   ├── index.html
│   ├── package.json
│   └── webpack.config.js
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.yml
├── shared/                 # Shared configurations
│   └── env/               # Environment templates
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Contribution guidelines
├── PRIVACY.md            # Privacy policy
├── ROADMAP.md            # Development roadmap
└── README.md             # This file
```

## 🛠️ Development

### Local Development Setup

```bash
# Install dependencies
npm install

# Backend development
cd backend
npm install
npm run dev              # API server on :3001

# Frontend development
cd frontend
npm install
npm run dev              # Web app on :3000

# Run tests
npm test

# Database setup
npm run db:migrate
npm run db:seed
```

### API Documentation

**📘 Full API documentation is available in [`backend/API.md`](backend/API.md)**

The API uses versioned endpoints under `/api/v1` for:
- Authentication & user management
- Activity tracking and analytics
- Health metrics collection
- Route management

Interactive API documentation (OpenAPI 3 / Swagger UI) is available at `/api/docs` when running the backend in development mode. The raw OpenAPI spec is at `/api/openapi.yaml`.

### API Versioning

The platform uses URL-based API versioning to ensure backward compatibility:

**Current Version:** `v1` (October 2025)

- **Versioned endpoints:** `/api/v1/*` (recommended for all new integrations)
- **Legacy endpoints:** Root-level endpoints (maintained for backward compatibility, will be deprecated)
- **Health checks:** `/healthz` (system health) and `/api/v1/health` (API health)

Example endpoints:
```
POST   /api/v1/auth/signup          # User registration
POST   /api/v1/auth/login           # Authentication
GET    /api/v1/activities           # List activities
POST   /api/v1/activities           # Create activity
GET    /api/v1/health-metrics       # Health metrics
```

All API responses include:
- Standardized error format with error codes
- Request tracking ID for debugging
- Rate limit headers
- API version headers

See [`backend/API.md`](backend/API.md) for complete endpoint documentation, request/response examples, error codes, and migration guide.

### Versioning Principles
1. Backward compatibility: Existing `/api/*` routes remain functional until a full v2 plan is published.
2. Header signaling: All responses include `API-Version: 1`.
3. Soft deprecation: Future deprecations will use `Deprecation` and `Sunset` headers before removal.
4. Documentation-first: New or refactored endpoints must be defined in `backend/openapi.yaml` before implementation.

### Current Documented Endpoints (Subset)
The initial spec includes authentication (`/signup`, `/login`), activity logs (`/api/activitylog`), health metrics (`/api/healthmetrics`), and admin analytics (`/api/admin/analytics`). Additional endpoints will be added iteratively.

### Adding / Updating Endpoints
1. Update `backend/openapi.yaml` with the new path, schema references, and tags.
2. (Future) Run `npm run spec:lint` after Spectral integration is completed.
3. Implement or adjust the Express route under `/api/v1`.
4. Verify via Swagger UI at `/api/docs`.

### Planned Enhancements
- Move existing `/api/*` routes into modular routers under `backend/routes/`.
- Introduce request/response validation middleware based on the OpenAPI schema.
- Add Spectral lint command (currently placeholder in scripts).

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

### Areas for Contribution
- Trail data integration and route optimization
- Mobile app features and offline capabilities
- Map rendering improvements and performance
- Community features and social interactions
- Fitness device integrations and data synchronization

## Extensibility

### API Access
Open APIs for developers to build custom applications or analytics, including:
- Fitness data access and analysis tools
- Adventure planning and route optimization
- Community features and social integrations
- Third-party device and service integrations

### Custom Plugins
Support for user-created plugins for self-hosted instances:
- Custom dashboard widgets and visualizations
- Adventure planning tools and route calculators
- Integration modules for new devices and services
- Community features and social enhancements

## Getting Started

### Prerequisites
- Docker (recommended for easy deployment)
- Node.js and npm (for development)
- Database (MongoDB for MVP - see Technical Architecture section)

### Installation
Clone this repository:
```bash
git clone https://github.com/EAasen/Tracksy.git
cd Tracksy
```
Install dependencies:
```bash
npm install
```
Configure your .env file for database and API credentials.
Start the server:
```bash
npm start
```

### Self-Hosting Guide
Refer to the Self-Hosting Documentation for step-by-step instructions.

## Contributing
We welcome contributions from the community! Check out our [Contributing Guide](CONTRIBUTING.md) to learn how to get started.

## Roadmap
- **Phase 1**: Core fitness tracking, basic integrations, and adventure planning foundations
- **Phase 2**: Adventure platform features, offline capabilities, and marketplace for plugins
- **Phase 3**: Advanced analytics, AI-driven insights, and mobile applications
- **Phase 4**: Enhanced privacy features, federated data sharing, and community platforms

For a detailed breakdown of our development roadmap, including:
- Adventure planning and route discovery features
- Mobile app development for iOS and Android
- Offline mapping and navigation capabilities
- Community features and social sharing
- Advanced analytics and AI-driven insights
- Implementation guides for integrations and features
- Technical specifications and best practices
- Future enhancement plans and priorities

Please see our comprehensive [ROADMAP.md](ROADMAP.md) document.

## Enhancement Plans
For a comprehensive list of planned enhancements including:
- Adventure planning tools and trail database integration
- Offline mapping and GPS navigation features
- Backend optimizations and performance improvements
- Data integration improvements for fitness devices
- DevOps infrastructure and deployment automation
- Security compliance and privacy enhancements
- Frontend optimizations and mobile responsiveness

Please refer to our [ROADMAP.md](ROADMAP.md) document.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Support & Community

### Self-Hosted Support
- [Documentation](https://docs.tracksy-platform.com)
- [Community Forum](https://community.tracksy-platform.com)
- [GitHub Issues](https://github.com/EAasen/Tracksy/issues)

### Hosted Version Support
- Email: support@tracksy-platform.com
- [Help Center](https://help.tracksy-platform.com)
- Priority support for paid plans

### Community
Join the discussion in our:
- [Community Forum](https://community.tracksy-platform.com) for general discussions
- [Discord Server](https://discord.gg/tracksy) for real-time chat and support
- [GitHub Discussions](https://github.com/EAasen/Tracksy/discussions) for development topics

## 🙏 Acknowledgments

- Trail data providers and the outdoor adventure community
- Fitness device manufacturers and health data ecosystems
- OpenStreetMap contributors and mapping community
- Open source libraries and development tools
- Beta testers, early adopters, and community contributors

---

For details on our current development phase and future plans, please refer to our [ROADMAP.md](ROADMAP.md) document.

For detailed implementation guides on API integrations, OAuth authentication, user registration, data retention policies, adventure planning features, and more, please refer to our comprehensive [ROADMAP.md](ROADMAP.md) document.
