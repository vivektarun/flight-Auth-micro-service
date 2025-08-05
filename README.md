# Flight Booking Auth Microservice

This microservice provides authentication and user management for a flight booking system. It is built using Node.js, Express, Sequelize ORM, and MySQL. The service supports user registration, login, role management, JWT-based authentication, and proxying requests to other microservices.

---

## Table of Contents

- [Flight Booking Auth Microservice](#flight-booking-auth-microservice)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Database Structure](#database-structure)
    - [1. Users](#1-users)
    - [2. Roles](#2-roles)
    - [3. User\_Roles (Join Table)](#3-user_roles-join-table)
  - [Database Associations](#database-associations)
  - [Normalization](#normalization)
  - [Project Setup](#project-setup)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [Auth \& User](#auth--user)
    - [Info](#info)
  - [Project Structure](#project-structure)
  - [Logging](#logging)
  - [Rate Limiting](#rate-limiting)
  - [Proxy Middleware](#proxy-middleware)
  - [Error Handling](#error-handling)
  - [Extending the Project](#extending-the-project)
  - [License](#license)
  - [Author](#author)
  - [References](#references)

---

## Features

- User registration and login with hashed passwords
- JWT-based authentication and authorization
- Role management (admin, customer, flight_company)
- Assigning roles to users
- Middleware for request validation and authentication
- Rate limiting to prevent abuse
- Proxying requests to flight and booking microservices
- Centralized error and success response formatting
- Sequelize ORM for database management

---

## Database Structure

The database consists of three main tables:

### 1. Users

| Field     | Type      | Constraints           |
|-----------|-----------|----------------------|
| id        | INTEGER   | PK, Auto Increment   |
| email     | STRING    | Unique, Not Null     |
| password  | STRING    | Not Null             |
| createdAt | DATE      | Not Null             |
| updatedAt | DATE      | Not Null             |

### 2. Roles

| Field     | Type      | Constraints           |
|-----------|-----------|----------------------|
| id        | INTEGER   | PK, Auto Increment   |
| name      | ENUM      | Not Null, Unique     |
| createdAt | DATE      | Not Null             |
| updatedAt | DATE      | Not Null             |

Role names are restricted to: `admin`, `customer`, `flight_company`.

### 3. User_Roles (Join Table)

| Field     | Type      | Constraints           |
|-----------|-----------|----------------------|
| id        | INTEGER   | PK, Auto Increment   |
| userId    | INTEGER   | FK -> Users(id)      |
| roleId    | INTEGER   | FK -> Roles(id)      |
| createdAt | DATE      | Not Null             |
| updatedAt | DATE      | Not Null             |

---

## Database Associations

- **User ↔ Role**: Many-to-Many relationship via `User_Roles`.
  - A user can have multiple roles.
  - A role can be assigned to multiple users.

Defined in:
- [`User`](src/models/user.js) associates with [`Role`](src/models/role.js) via `User_Roles`.
- [`Role`](src/models/role.js) associates with [`User`](src/models/user.js) via `User_Roles`.

---

## Normalization

- **1NF**: All tables have atomic columns (no repeating groups).
- **2NF**: All non-key attributes are fully functionally dependent on the primary key.
- **3NF**: No transitive dependencies; join table (`User_Roles`) resolves many-to-many relationships.

---

## Project Setup

### Prerequisites

- Node.js (v16+ recommended)
- MySQL server

### Steps

1. **Clone the repository**

   ```sh
   git clone <repo-url>
   cd AuthMicroService
   ```

2. **Install dependencies**

   ```sh
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```
   PORT=4000
   SALT_ROUNDS=8
   JWT_SECRET="your_jwt_secret"
   JWT_EXPIRY='1h'
   FLIGHT_SERVICE='http://localhost:4000'
   BOOKING_SERVICE='http://localhost:3000'
   ```

4. **Configure database**

   Edit [`src/config/config.json`](src/config/config.json) with your MySQL credentials.

5. **Initialize Sequelize**

   ```sh
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```

   This will create tables and seed initial roles.

6. **Run the server**

   ```sh
   npm run dev
   ```

   The service will be available at `http://localhost:4000`.

---

## Environment Variables

- `PORT`: Port for the Express server
- `SALT_ROUNDS`: Bcrypt salt rounds for password hashing
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRY`: JWT token expiry (e.g., '1h')
- `FLIGHT_SERVICE`: URL for flight microservice
- `BOOKING_SERVICE`: URL for booking microservice

---

## API Endpoints

### Auth & User

- `POST /api/v1/user/signup`  
  Register a new user.  
  Body: `{ email, password }`

- `POST /api/v1/user/signin`  
  Login and receive JWT.  
  Body: `{ email, password }`

- `POST /api/v1/user/role`  
  Assign a role to a user (admin only).  
  Body: `{ role, id }`  
  Requires JWT in `x-access-token` header.

### Info

- `GET /api/v1/info`  
  Returns service status.  
  Requires JWT in `x-access-token` header.

---

## Project Structure

- `src/config/`  
  Configuration files for server, logger, and database.

- `src/controllers/`  
  API controllers for user and info endpoints.

- `src/middlewares/`  
  Request validation and authentication middlewares.

- `src/models/`  
  Sequelize models for User, Role, and User_Role.

- `src/repositories/`  
  Data access layer for CRUD operations.

- `src/routes/`  
  Express route definitions.

- `src/services/`  
  Business logic for user management and authentication.

- `src/utils/`  
  Helpers, error classes, enums, and response formatters.

---

## Logging

Logging is handled by [Winston](src/config/logger-config.js). Logs are written to the console and to `logs/combined.log`.

---

## Rate Limiting

Implemented using `express-rate-limit` in [`src/index.js`](src/index.js):

- Max 30 requests per 2 minutes per IP.

---

## Proxy Middleware

Requests to `/flightService` and `/bookingService` are proxied to their respective microservices using [`http-proxy-middleware`](src/index.js).

---

## Error Handling

Centralized error and success response formatting in:

- [`ErrorResponse`](src/utils/common/error-response.js)
- [`SuccessResponse`](src/utils/common/success-response.js)
- Custom error class [`AppError`](src/utils/errors/app-error.js)

---

## Extending the Project

- Add new models to [`src/models/`](src/models/)
- Add new migrations and seeders using Sequelize CLI
- Add new routes and controllers in [`src/routes/`](src/routes/) and [`src/controllers/`](src/controllers/)
- Implement new business logic in [`src/services/`](src/services/)

---

## License

ISC

---

## Author

Your Name

---

## References

- [Express](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [Winston](https://github.com/winstonjs/winston)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
-