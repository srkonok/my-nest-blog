# NestJS Blog API - Postman Collection

This repository contains a Postman collection and environment for testing the NestJS Blog API.

## Files

- `blog-api-postman-collection.json`: The Postman collection with all API endpoints
- `blog-api-environment.json`: The Postman environment with variables

## Setup Instructions

1. Install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Import the collection:
   - Open Postman
   - Click "Import" in the top left
   - Select the `blog-api-postman-collection.json` file
   - Click "Import"

3. Import the environment:
   - Click "Import" again
   - Select the `blog-api-environment.json` file
   - Click "Import"

4. Select the environment:
   - In the top right corner, click the environment dropdown
   - Select "NestJS Blog API Environment"

## Using the Collection

### Authentication

1. First, use the "Login" request in the Auth folder:
   - The default credentials are:
     ```json
     {
       "email": "john@example.com",
       "password": "12345678"
     }
     ```
   - Send the request
   - The access token and refresh token will be automatically saved to environment variables

2. All authenticated requests will now use the token automatically

### Testing Endpoints

The collection is organized into folders:

- **Auth**: Authentication-related endpoints (login, register, etc.)
- **Posts**: Blog post management
- **Users**: User management
- **Files**: File upload and management
- **Health**: Health check endpoint

### Notes

- Some endpoints like "Get All Posts" and "Get Post by ID" are public and don't require authentication
- For protected endpoints, the Bearer token is automatically included if you've logged in
- If your token expires, use the "Refresh Token" request to get a new one

## Troubleshooting

- If you get 401 Unauthorized errors, make sure you've logged in first
- If your token has expired, use the "Refresh Token" request
- If you still have issues, check that your server is running at the correct URL (default: http://localhost:3000) 