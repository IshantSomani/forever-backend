# E-Commerce Website Forever-Backend API Documentation

## Introduction

This document provides details on the forever-backend API for the e-commerce website, outlining each available endpoint along with sample requests and responses.

## Base URL

```
http://localhost:5000/api
```

---

## Environment Variables

To run this project, you need to create a `.env` file in the root directory with the following environment variables:

```
MONGODB_URI=your_mongodb_url
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_SECRET_KEY="your_secret_key"
CLOUDINARY_NAME="your_clouidinary_name"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="your_jwt_expires_in"
ADMIN_EMAIL="your_admin_email"
ADMIN_PASSWORD="your_password"
STRIPE_SECRET_KEY=your_stripe_secret_key
```

---

## Authentication & User Management

### 1. Register a User

**Endpoint:** `POST /users/register`

**Description:** Registers a new user.

**Request Example:**

```json
{
  "name": "Hayat",
  "email": "hayat@example.com",
  "password": "securepassword"
}
```

**Response Example:**

```json
{
  "message": "User registered successfully",
  "data": {
    "id": "12345",
    "name": "Hayat",
    "email": "hayat@example.com",
    "role": "user",
    "active": true
  }
}
```

### 2. Login a User

**Endpoint:** `POST /users/login`

**Description:** Logs in an existing user.

**Request Example:**

```json
{
  "email": "hayat@example.com",
  "password": "securepassword"
}
```

**Response Example:**

```json
{
  "message": "Login successful!",
  "token": "your_jwt_token",
  "data": {
    "id": "12345",
    "name": "Hayat",
    "email": "hayat@example.com",
    "role": "user"
  }
}
```

---

## Product Management

### 3. Add a Product (Admin Only)

**Endpoint:** `POST /products/add`

**Description:** Adds a new product to the catalog (Admin only, requires authentication).

**Request Example:** (Multipart Form Data)

```json
{
  "name": "Chemistry",
  "description": "Crepe Skorts Mini Skirt",
  "price": 699,
  "images": ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"],
  "category": "womens",
  "subCategory": "topwear",
  "sizes": ["S", "M", "L", "XL", "XXL"],
  "bestSeller": true,
  "status": true
}
```

### 4. Get All Products

**Endpoint:** `GET /products/allProduct`

**Description:** Retrieves all available products.

**Response Example:**

```json
[
  {
    "name": "Chemistry",
    "description": "Crepe Skorts Mini Skirt",
    "price": 699,
    "images": ["image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg"],
    "category": "womens",
    "subCategory": "topwear",
    "sizes": ["S", "M", "L", "XL", "XXL"],
    "bestSeller": true,
    "status": true
  }
]
```

### 5. Get Single Product

**Endpoint:** `GET /products/single/:id`

**Description:** Retrieves a single product by ID.

---

## Cart Management

### 6. Add Item to Cart

**Endpoint:** `POST /cart/addItem`

**Description:** Adds an item to the user's cart.

**Request Example:**

```json
{
  "productId": "1",
  "quantity": 2
}
```

### 7. Remove Item from Cart

**Endpoint:** `DELETE /cart/removeItem`

**Description:** Removes an item from the user's cart.

**Request Example:**

```json
{
  "productId": "1"
}
```

### 8. Get User's Cart

**Endpoint:** `GET /cart/getCart`

**Description:** Retrieves the current user's cart.

---

## Order Management

### 9. Place an Order

**Endpoint:** `POST /order/place`

**Description:** Places an order using the current cart.

**Request Example:**

```json
{
  "paymentMethod": "COD"
}
```

### 10. List All Orders (Admin Only)

**Endpoint:** `GET /order/list`

**Description:** Retrieves all orders (Admin only).

### 11. Get User Orders

**Endpoint:** `GET /order/userOrders`

**Description:** Retrieves the authenticated user's orders.

---

## Payment Processing

### 12. Stripe Payment

**Endpoint:** `POST /order/stripe`

**Description:** Processes a payment via Stripe.

**Request Example:**

```json
{
  "amount": 699,
  "currency": "INR",
  "source": "tok_visa"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Payment successful"
}
```
---

## Installation & Setup

### 1. Clone the Repository
```sh
git clone https://github.com/IshantSomani/forever-backend.git
cd forever-backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in  `forever-backend/` directories with the following:
```sh
MONGODB_URI=your_mongodb_url
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_SECRET_KEY="your_secret_key"
CLOUDINARY_NAME="your_clouidinary_name"
JWT_SECRET="your_jwt_secret"
JWT_EXPIRES_IN="your_jwt_expires_in"
ADMIN_EMAIL="your_admin_email"
ADMIN_PASSWORD="your_password"
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Start the Applications
```sh
npm start
```
---

## API Endpoints Overview

### Authentication
- **`POST /users/register`** - Register a new user.
- **`POST /users/login`** - Login a user.

### Products
- **`GET /products/allProduct`** - Get all products.
- **`GET /products/single/:id`** - Get a single product by ID.

### Cart
- **`POST /cart/addItem`** - Add an item to the cart.
- **`DELETE /cart/removeItem`** - Remove an item from the cart.
- **`GET /cart/getCart`** - Retrieve the user's cart.

### Orders
- **`POST /order/place`** - Place an order.
- **`GET /order/userOrders`** - Retrieve user orders.
- **`PUT /order/status`** - Update order status (Admin).

---

## Conclusion

This documentation outlines the core API endpoints for the e-commerce website backend. Ensure that proper authentication is used for admin routes and secure user data handling is implemented.

