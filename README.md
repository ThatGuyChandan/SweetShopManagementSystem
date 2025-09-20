# Sweet Shop Management System

This is a full-stack web application for managing a sweet shop. It includes features for user authentication, browsing sweets, purchasing items, and admin-only functionalities for managing the inventory.

## Features

- User registration and login with JWT authentication.
- Browse and search for sweets by name, category, and price.
- Purchase sweets (quantity decreases).
- Admin panel to add, update, and delete sweets.
- Admins can restock sweets.

## Technologies Used

- **Frontend:** React, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)

## Setup and Installation

### Prerequisites

- Node.js and npm
- MongoDB

### Backend Setup

1.  Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `backend` directory with the following content:
    ```
    MONGO_URL=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
4.  Start the backend server:
    ```sh
    npm start
    ```

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2.  Install the dependencies:
    ```sh
    npm install
    ```
3.  Start the frontend development server:
    ```sh
    npm start
    ```

The application will be available at `http://localhost:3000`.

## My AI Usage

I have used an AI assistant to help with the following tasks:

- **UI/UX Improvement:** I asked the AI to improve the UI/UX of the application to make it more professional. The AI analyzed the existing CSS and then provided a new, more modern design, which I implemented.
- **Code Generation:** I used the AI to generate some boilerplate code for the components and to help with the implementation of the new UI.
- **Debugging:** I used the AI to help debug some issues I encountered during development.

Overall, the AI assistant was a valuable tool that helped me to complete the project more efficiently. It was particularly helpful for the UI/UX design, as it provided a fresh perspective and helped me to create a more professional-looking application.