# Food Delivery Order Management System

**Live Link:** https://food-delivery-order-management-system.onrender.com

## Project Description

This is a backend REST API for a local food delivery startup. Customers can browse the menu, place orders and track their order status. Restaurant staff can update the status of an order as it moves from placed to delivered.

The project only has the backend. It can be connected to a React frontend later.

## Features

- Menu item CRUD (create, view, update, delete)
- Create and view customers
- Place an order with item quantities
- Total price is calculated on the server
- Price of each item is saved in the order
- Order status update for restaurant staff
- Filter orders by status using a query parameter
- Basic validation and error messages

## Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv, cors
- nodemon (development only)
- Postman / Thunder Client for testing

## Folder Structure

```text
food-delivery-backend/
├── models/
│   ├── MenuItem.js
│   ├── Customer.js
│   └── Order.js
├── routes/
│   ├── menuRoutes.js
│   ├── customerRoutes.js
│   └── orderRoutes.js
├── controllers/
│   ├── menuController.js
│   ├── customerController.js
│   └── orderController.js
├── .env
├── .gitignore
├── package.json
├── server.js
├── README.md
└── food-delivery.postman_collection.json
```

## Installation Steps

1. Install Node.js (version 18 or above).
2. Open the project folder in a terminal.
3. Run:

```bash
npm install
```

## Environment Variable Setup

The project needs two environment variables. They are already listed in the `.env` file in the main project folder. Open it and replace the placeholder with your own MongoDB Atlas connection string:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
```

- `PORT` is the port number where the server runs.
- `MONGO_URI` is the connection string from MongoDB Atlas.

The `.env` file is listed in `.gitignore`, so it will not be uploaded to GitHub. Never share your real connection string. If you clone the project on another computer, create the `.env` file again with the two lines above.

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas and create a free account.
2. Create a free cluster (M0).
3. Go to **Database Access** and create a database user with a username and password.
4. Go to **Network Access** and add your IP address (for learning, you can allow `0.0.0.0/0`).
5. Click **Connect** on your cluster, choose **Drivers**, and copy the connection string.
6. Replace `<password>` with your user's password and add the database name after `.net/`:

```text
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/food-delivery?retryWrites=true&w=majority
```

7. Paste this string as `MONGO_URI` in the `.env` file.

## How to Run the Project

Development mode (restarts on changes):

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

If everything is correct, the terminal shows:

```text
MongoDB connected successfully
Server is running on port 5001
```

Open http://localhost:5001 in the browser to see "Food Delivery API is running".

## API Endpoints

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /menu | Get all menu items |
| GET | /menu/:id | Get one menu item |
| POST | /menu | Create a menu item |
| PATCH | /menu/:id | Update a menu item |
| DELETE | /menu/:id | Delete a menu item |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /customers | Create a customer |
| GET | /customers | Get all customers |
| GET | /customers/:id | Get one customer |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Place a new order |
| GET | /orders | Get all orders |
| GET | /orders?status=placed | Get orders with a given status |
| GET | /orders?customer=CUSTOMER_ID | Get the orders of one customer |
| GET | /orders/:id | Get one order |
| PATCH | /orders/:id/status | Update the order status |

The `status` and `customer` filters can be used together, for example `/orders?customer=CUSTOMER_ID&status=preparing`.

## Example Request Bodies

Create menu item (`POST /menu`):

```json
{
  "name": "Pizza",
  "price": 200,
  "category": "Main Course",
  "availability": true
}
```

Update menu item (`PATCH /menu/:id`):

```json
{
  "price": 220,
  "availability": false
}
```

Create customer (`POST /customers`):

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "address": "12 MG Road, Mumbai"
}
```

Place order (`POST /orders`):

```json
{
  "customer": "CUSTOMER_OBJECT_ID",
  "items": [
    { "menuItem": "MENU_ITEM_OBJECT_ID", "quantity": 2 },
    { "menuItem": "ANOTHER_MENU_ITEM_OBJECT_ID", "quantity": 1 }
  ]
}
```

Update order status (`PATCH /orders/:id/status`):

```json
{
  "status": "preparing"
}
```

## Example Order Workflow

1. `POST /menu` - create a menu item (for example Pizza, price 200).
2. `POST /customers` - create a customer.
3. `POST /orders` - place an order using the customer ID and menu item ID.
4. `GET /orders/:id` - view the order. Its status is `placed`.
5. `PATCH /orders/:id/status` with `preparing`.
6. `PATCH /orders/:id/status` with `out for delivery`.
7. `PATCH /orders/:id/status` with `delivered`.
8. `GET /orders?status=delivered` - the order now appears in the delivered list.

## Postman / Thunder Client Testing Steps

1. Start the server with `npm run dev`.
2. Open Postman and click **Import**. Select `food-delivery.postman_collection.json`.
3. The collection has the variables `baseUrl`, `menuItemId`, `customerId` and `orderId`. `baseUrl` is already set to `http://localhost:5001`.
4. Run the requests in this order: Create menu item, Create customer, Create order. These three requests save the new IDs in the variables automatically, so the other requests can use them.
5. Run Get order by ID, then Update order status. Change the `status` in the body each time (`preparing`, `out for delivery`, `delivered`).
6. Run Get orders filtered by status. Change the `status` value in the URL to test other statuses.

Thunder Client can also import this file (Collections -> menu -> Import). If you want to create requests by hand, use the endpoints and request bodies given above.

## Order Status Flow

The order status can only be one of these four values:

```text
placed -> preparing -> out for delivery -> delivered
```

- A new order always starts as `placed`.
- The status must move one step at a time. For example, an order cannot go from `placed` directly to `delivered`.
- A delivered order cannot be changed again.
- Any other status value gives a 400 error.

## How the Total Price is Calculated

The client only sends the menu item IDs and quantities. The server:

1. Finds each menu item in the database.
2. Takes the current price from the database.
3. Multiplies price by quantity for each item.
4. Adds all the results.

Example: 2 pizzas at 200 and 1 burger at 120 gives (2 x 200) + (1 x 120) = 520.

The price is also saved inside the order, so changing the menu price later does not change old orders.

## Basic Validation Details

Menu item:
- name, price and category are required
- price must be a number greater than 0
- availability must be true or false

Customer:
- name, email, phone and address are required

Order:
- customer ID is required and must be valid and existing
- at least one item is required
- every menu item ID must be valid and existing
- every menu item must be available
- quantity is required and must be a positive whole number

Other:
- invalid IDs return 400
- records that do not exist return 404
- invalid status values return 400
- unexpected server errors return 500

Status codes used: 200 (success), 201 (created), 400 (invalid input), 404 (not found), 500 (server error).
