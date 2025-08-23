# Reddit Clone

A full-stack Reddit clone built with Spring Boot and React, featuring communities, posts, comments, and user interactions.

## Features

- **User Authentication**
  - JWT-based authentication
  - User registration and login
  - Secure password storage

- **Communities**
  - Create and join communities
  - View posts by community
  - Community management tools

- **Posts**
  - Create and share posts (text, links, images)
  - Upvote/downvote posts
  - Sort by hot, new, top, etc.
  - Search functionality

- **Comments**
  - Nested comment threads
  - Upvote/downvote comments
  - Edit and delete comments

- **User Experience**
  - Responsive design
  - Real-time updates
  - Intuitive navigation

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.3.1
- **Language**: Java 23
- **Database**: MySQL
- **Security**: Spring Security with JWT
- **Build Tool**: Gradle
- **Testing**: JUnit 5

### Frontend
- **Framework**: React
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite

## Prerequisites

- Java 23 or later
- Node.js 18+
- MySQL 8.0+
- Gradle 8.0+

## Getting Started

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Reddit
   ```

2. **Configure Database**
   - Create a MySQL database
   - Update `application.properties` with your database credentials

3. **Run the application**
   ```bash
   ./gradlew bootRun
   ```
   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd reddit-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Testing

### Backend Tests
```bash
./gradlew test
```

### Frontend Tests
```bash
cd reddit-frontend
npm test
```

## Environment Variables

### Backend
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRATION_MS`: JWT token expiration time in milliseconds

### Frontend
- `VITE_API_BASE_URL`: Base URL for API requests (default: http://localhost:8080/api/v1)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ using Spring Boot and React
- Inspired by Reddit
