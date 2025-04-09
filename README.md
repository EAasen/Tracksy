# Tracksy - an Open-Source Fitness Data Platform
Simplifying fitness tracking and data integration.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Core Functionality](#core-functionality)
- [Deployment Options](#deployment-options)
  - [Self-Hosting](#self-hosting)
  - [Hosted Solution](#hosted-solution)
- [Developer Marketplace](#developer-marketplace)
  - [In-App Solutions](#in-app-solutions)
  - [Third-Party Integrations](#third-party-integrations)
- [Privacy and Security](#privacy-and-security)
- [Extensibility](#extensibility)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Self-Hosting Guide](#self-hosting-guide)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)
- [Community](#community)

## Overview
This project is an open-source alternative to fitness tracking platforms like Strava, focused on providing users full control over their data. The platform supports data integration from a wide range of sources, including Garmin Connect, Apple Health, Android Health, Huawei Health, Coros, Fitbit, Samsung Health, Wahoo, Suunto, Polar, and more.

The platform offers two deployment models:

### Self-Hosted Solution
Users can self-host their instance to manage their data independently and set up custom integrations.

### Hosted Solution
Subscribe to a managed service with options for integration and a developer marketplace for third-party applications.

Data privacy and user control are at the core of the platform. Users can decide who accesses their data, ensuring complete transparency and security.

## Features

### Core Functionality
- **Data Integration**: Sync data from various health and fitness ecosystems.
  - *Example*: Connect your Garmin device to sync your running and cycling activities.
- **Activity Tracking**: Log and visualize activities like running, cycling, swimming, and more.
  - *Example*: Track your weekly running mileage and visualize it on a graph.
- **Health Metrics**: Collect and display metrics such as heart rate, sleep, and recovery.
  - *Example*: Monitor your sleep patterns and heart rate variability over time.
- **Custom Analytics**: Generate detailed reports and insights based on your activities.
  - *Example*: Create a custom report to analyze your performance trends over the past year.

### Unique Features
- **Multi-Source Data Integration**: Unlike many competitors, Tracksy supports a wide range of data sources, giving users more flexibility.
- **User-Controlled Data Privacy**: Users have full control over who can access their data, ensuring privacy and security.
- **Extensible Platform**: With open APIs and support for custom plugins, Tracksy can be tailored to meet specific user needs.

## Deployment Options

### Self-Hosting
Tools and guides for users to host the platform locally or on their own server.

### Hosted Solution
Managed service for ease of use with all the features available out of the box.

## Developer Marketplace

### In-App Solutions
Developers can create and sell features or extensions for the platform.

### Third-Party Integrations
Use platform APIs to integrate user data with external applications.

## Privacy and Security

### User Control
Users decide who can access their data.

### Anonymized Data Usage
Enable optional sharing of anonymized data for training algorithms and improving functionality.

### Data Encryption
All data is encrypted in transit and at rest.

## Extensibility

### API Access
Open APIs for developers to build custom applications or analytics.

### Custom Plugins
Support for user-created plugins for self-hosted instances.

## Getting Started

### Prerequisites
- Docker (recommended for easy deployment)
- Node.js and npm (for development)
- Database (PostgreSQL or MongoDB)

### Installation
Clone this repository:
```bash
git clone https://github.com/username/repo-name.git
cd repo-name
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
We welcome contributions from the community! Check out our Contributing Guide to learn how to get started.

## Roadmap
- **Phase 1**: Core functionality and basic integrations.
- **Phase 2**: Marketplace for plugins and third-party apps.
- **Phase 3**: Advanced analytics and AI-driven insights.
- **Phase 4**: Enhanced privacy features, including federated data sharing.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Community
Join the discussion in our Community Forum or connect with us on Discord.

## Phase 1: Core Functionality and Basic Integrations

### Backend
- Finalize user authentication (sign-up, login, password recovery).
- Complete API integrations for Garmin Connect, Apple Health, and Fitbit.
- Finalize database models and schema for users, activity logs, and health metrics.
- Implement and test periodic data sync mechanisms.
- Ensure logging and error handling is comprehensive and consistent.

### Frontend
- Integrate authentication pages with the backend.
- Finalize the dashboard UI to display activity data and health metrics.
- Refine the settings page for managing integrations and account preferences.
- Ensure mobile responsiveness and cross-browser compatibility.
- Validate UI improvements made in the separate UI enhancement issue.

### Deployment & Testing
- Finalize Docker configurations and ensure both backend and frontend services run reliably.
- Set up CI/CD pipelines for automated builds, tests, and deployments.
- Write and execute unit tests for backend and frontend components.
- Conduct integration and end-to-end tests to validate key workflows.
- Update documentation for API endpoints and integration guides.

### Acceptance Criteria
- All user authentication, data integrations, and scheduled syncing functions are fully operational and tested.
- The web app displays activity data clearly and allows users to manage their integrations effectively.
- Deployment configurations (Docker, CI/CD) are finalized and functional.
- Comprehensive test coverage confirms the stability of the platform.
- Documentation is updated to reflect all changes made during Phase 1.

### API Integrations
To integrate APIs for syncing data from services like Garmin Connect, Apple Health, and Fitbit, follow these steps:

* **Research and obtain API credentials**: Register your application with each service to obtain API keys, client IDs, and client secrets.
* **Set up environment variables**: Store the API credentials securely in environment variables. Update the `.env` file with the necessary credentials.
* **Create API client modules**: Develop modules to handle API requests and responses for each service. These modules should include functions for authentication, data retrieval, and error handling.
* **Implement authentication flows**: Integrate OAuth or other authentication mechanisms required by each service. Ensure that users can authorize your application to access their data.
* **Develop data sync functions**: Write functions to periodically fetch data from the APIs and store it in your database. Use scheduled tasks or cron jobs to automate data syncing.
* **Update database models**: Ensure your database schema supports the data structures returned by the APIs. Update models and schemas as needed.
* **Integrate with backend**: Connect the API client modules and data sync functions with your backend application. Ensure that the data is processed and stored correctly.
* **Test the integrations**: Thoroughly test the API integrations to ensure they work as expected. Write unit tests, integration tests, and end-to-end tests to validate the functionality.
* **Handle errors and logging**: Implement comprehensive error handling and logging for API requests and responses. Use a logging library like `winston` as configured in `backend/config/logger.js`.
* **Update documentation**: Document the API integration process, including setup instructions and usage examples. Update the `README.md` and any relevant documentation files.

### OAuth 2.0 Authentication
OAuth 2.0 is an authorization framework that allows applications to obtain limited access to user accounts on an HTTP service. Here are the key steps to implement OAuth 2.0 authentication:

* **Register your application**: Register your application with the service provider (e.g., Garmin Connect, Apple Health, Fitbit) to obtain client credentials (client ID and client secret).
* **Set up environment variables**: Store the client credentials securely in environment variables. Update the `.env` file with the necessary credentials.
* **Create authorization endpoint**: Implement an endpoint in your backend to initiate the OAuth 2.0 authorization flow. This endpoint should redirect users to the service provider's authorization URL.
* **Handle authorization callback**: Implement an endpoint to handle the callback from the service provider after the user authorizes your application. This endpoint should exchange the authorization code for an access token.
* **Store access token**: Securely store the access token in your database or session for future API requests.
* **Make authenticated API requests**: Use the access token to make authenticated requests to the service provider's API to access user data.
* **Refresh access token**: Implement a mechanism to refresh the access token when it expires, using the refresh token provided by the service provider.
* **Error handling and logging**: Implement comprehensive error handling and logging for the OAuth 2.0 flow. Use a logging library like `winston` as configured in `backend/config/logger.js`.
* **Update documentation**: Document the OAuth 2.0 authentication process, including setup instructions and usage examples. Update the `README.md` and any relevant documentation files.

### User Registration and GDPR Compliance
To handle user registration and GDPR issues in the Tracksy application, follow these steps:

* **User registration**: Implement user registration functionality in the backend. This includes creating endpoints for sign-up, login, and password recovery in `backend/app.js`. Ensure that user data is securely stored in the database configured in `backend/config/database.js`.
* **Data protection**: Ensure that user data is encrypted both in transit and at rest. Use HTTPS for secure communication and encrypt sensitive data such as passwords using bcrypt.
* **User consent**: Obtain explicit consent from users for data collection and processing. Include a consent checkbox during the registration process and provide clear information about how their data will be used.
* **Data access and portability**: Allow users to access their data and provide options for data portability. Implement endpoints to export user data in a machine-readable format.
* **Data deletion**: Provide users with the ability to delete their accounts and all associated data. Implement an endpoint to handle account deletion requests and ensure that all user data is permanently removed from the database.
* **Privacy policy**: Create a comprehensive privacy policy that outlines how user data is collected, processed, and protected. Include this policy in the `README.md` and provide a link to it during the registration process.
* **Logging and monitoring**: Use the `winston` logging library configured in `backend/config/logger.js` to log user registration activities and monitor for any suspicious behavior.
* **Documentation**: Update the documentation to include information on user registration and GDPR compliance. Ensure that the `README.md` and any relevant documentation files are updated with the necessary details.

### Token Refresh Process
To handle expired OAuth tokens in the Tracksy application, follow these steps:

* **Detect token expiration**: Implement logic to detect when an OAuth token has expired. This can be done by checking the expiration time stored with the token or by handling specific error responses from the service provider's API.
* **Refresh token endpoint**: Create an endpoint in your backend to refresh the OAuth token using the refresh token provided by the service provider. For example, you can add a `/auth/refresh` endpoint in `backend/app.js`.
* **Store refresh token**: Ensure that the refresh token is securely stored in your database. You can use the `googleTokens` field in the `User` schema defined in `backend/config/database.js`.
* **Update credentials**: When the token is refreshed, update the stored credentials with the new access token and expiration time.
* **Retry failed requests**: Implement a mechanism to retry failed API requests after refreshing the token. This can be done by catching the error, refreshing the token, and then retrying the request.
* **Error handling and logging**: Use the `winston` logging library configured in `backend/config/logger.js` to log any errors related to token expiration and refresh attempts.
* **Update documentation**: Document the token refresh process, including setup instructions and usage examples. Update the `README.md` and any relevant documentation files.

### End-to-End Testing Process
To implement end-to-end tests for the OAuth flow, follow these steps:

* **Set up test environment**: Ensure that the test environment is configured correctly. Use tools like Mocha, Chai, and Sinon for testing. Refer to the `devDependencies` in `backend/package.json` for the necessary packages.
* **Mock OAuth provider**: Create a mock OAuth provider to simulate the OAuth 2.0 flow. This will help in testing without relying on actual external services.
* **Test user authentication**: Write tests to verify the user authentication flow, including sign-up, login, and password recovery. Ensure that the endpoints in `backend/app.js` are covered.
* **Test OAuth authorization**: Write tests to verify the OAuth authorization endpoint (`/auth/google`). Ensure that the endpoint redirects users to the OAuth provider's authorization URL.
* **Test OAuth callback**: Write tests to verify the OAuth callback endpoint (`/auth/google/callback`). Ensure that the endpoint handles the callback correctly, exchanges the authorization code for an access token, and stores the tokens securely.
* **Test token storage**: Verify that the access token and refresh token are stored securely in the database. Check the `googleTokens` field in the `User` schema defined in `backend/config/database.js`.
* **Test authenticated API requests**: Write tests to verify that authenticated API requests are made using the access token. Ensure that the access token is included in the request headers.
* **Test token refresh**: Write tests to verify the token refresh mechanism. Ensure that the refresh token is used to obtain a new access token when the current one expires.
* **Error handling and logging**: Verify that comprehensive error handling and logging are implemented for the OAuth flow. Check the `winston` logging library configuration in `backend/config/logger.js`.
* **Update documentation**: Document the end-to-end testing process, including setup instructions and usage examples. Update the `README.md` and any relevant documentation files.

### Data Retention Policy
To implement data retention policies in the Tracksy application, follow these steps:

* **Define retention periods**: Determine the retention periods for different types of data, such as user data, activity logs, and health metrics. Document these periods in a `data_retention_policy.md` file in the repository.
* **Database schema updates**: Ensure that the database schema includes fields to track the creation and last update times for each record. This can be done by adding `createdAt` and `updatedAt` fields to the schemas in `backend/config/database.js`.
* **Automated data deletion**: Implement a scheduled task to automatically delete data that has exceeded the retention period. This can be done using a cron job or a task scheduler like `node-cron`. The task should query the database for records older than the retention period and delete them.
* **User notifications**: Notify users before their data is deleted. Implement a mechanism to send email notifications or in-app alerts to users, informing them of the upcoming data deletion and providing options to export their data.
* **Data export**: Provide users with the ability to export their data before it is deleted. Implement an endpoint to handle data export requests and generate a machine-readable file (e.g., JSON) containing the user's data.
* **Logging and monitoring**: Use the `winston` logging library configured in `backend/config/logger.js` to log data deletion activities and monitor for any issues. Ensure that logs include details about the records deleted and any errors encountered.
* **Update documentation**: Document the data retention policy and the steps users can take to export their data. Update the `README.md` and any relevant documentation files to include information about the data retention policy and user options.

### Linking Health Tracker Accounts
To implement a user-friendly interface for linking health tracker accounts, consider the following best practices:

* **Clear instructions**: Provide a page or popup in the webapp that shows clear and concise instructions for connecting a watch account (e.g., Garmin, Fitbit, Apple Health). This can be implemented in the `frontend/src/App.jsx` file.
* **OAuth 2.0 flow**: Implement the OAuth 2.0 authorization flow to allow users to securely link their health tracker accounts. Refer to the `/auth/google` and `/auth/google/callback` endpoints in `backend/app.js` for examples.
* **User feedback**: Provide real-time feedback to users during the linking process. Display loading indicators, success messages, and error messages to keep users informed.
* **Responsive design**: Ensure that the linking interface is responsive and works well on different devices and screen sizes. Use a responsive front-end framework like Bootstrap or Material-UI.
* **Security**: Securely store access tokens and refresh tokens in the database. Use the `googleTokens` field in the `User` schema defined in `backend/config/database.js`.
* **Error handling**: Implement comprehensive error handling and logging for the OAuth 2.0 flow. Use the `winston` logging library configured in `backend/config/logger.js`.
* **Documentation**: Update the documentation to include instructions for linking health tracker accounts. Ensure that the `README.md` and any relevant documentation files are updated with the necessary details.
