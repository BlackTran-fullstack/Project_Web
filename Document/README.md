# Project Web Documentation

## Introduction
This document provides an overview of the project, including setup instructions, usage, and other relevant information.

## Setup Instructions
1. Clone the repository: git clone https://github.com/BlackTran-fullstack/Project_Web.git
2. Install the necessary dependencies: npm install (in project folder)
3. Run the project: npm start and npm run watch (run in 2 terminals)

## Usage
Provide detailed instructions on how to use the project.

## License
Include the license information for the project.
## Code Documentation

### Overview
The `src` folder contains all the source code for the project. Below is a detailed description of each file and its functionality.

### File Descriptions

#### `src/index.js`
This is the main entry point of the application. It initializes the app and sets up the necessary configurations.

#### `src/config/`
This file includes configuration settings for the project, such as database connections and API keys.

#### `src/controllers/`
This folder contains the controller files, which handle the business logic for different parts of the application.


/**
 * **CartController.js**
 * 
 * The `CartController.js` file is responsible for managing all functionalities related to the shopping cart. This includes:
 * - Adding items to the cart: Users can add products to their shopping cart.
 * - Removing items from the cart: Users can remove products from their cart if they no longer wish to purchase them.
 * - Updating item quantities: Users can change the quantity of each product in their cart.
 * - Viewing cart contents: Users can view the list of products they have added to their cart, along with details such as product name, price, and quantity.
 * 
 * This controller ensures that the shopping cart operations are handled efficiently and provides a seamless user experience.
 */

/**
 * **ShopController.js**
 * 
 * The `ShopController.js` file handles all operations related to the shop and its products. This includes:
 * - Displaying products: The controller fetches and displays a list of available products to the users.
 * - Filtering products by categories: Users can filter products based on different categories to find what they are looking for more easily.
 * - Managing product details: The controller provides detailed information about each product, including descriptions, prices, and images.
 * 
 * This controller is essential for managing the product catalog and ensuring that users can easily browse and find products in the shop.
 */

/**
 * **SiteController.js**
 * 
 * The `SiteController.js` file is responsible for general site operations and navigation. This includes:
 * - Rendering the homepage: The controller manages the content and layout of the homepage, ensuring it is engaging and informative.
 * - Handling user navigation: It manages the navigation between different pages of the site, providing a smooth and intuitive user experience.
 * - Managing static pages: The controller handles static pages such as About Us and Contact Us, ensuring that these pages are properly rendered and contain relevant information.
 * 
 * This controller plays a crucial role in maintaining the overall structure and usability of the website, ensuring that users can easily navigate and access the information they need.
 */
- **CartController.js**: Manages the shopping cart functionalities, including adding items to the cart, removing items, updating quantities, and viewing the cart contents.
- **ShopController.js**: Handles the operations related to the shop, such as displaying products, filtering products by categories, and managing product details.
- **SiteController.js**: Responsible for general site operations, including rendering the homepage, handling user navigation, and managing static pages like About Us and Contact Us.

#### `src/models/`
This folder includes the data models used in the application, defining the structure of the data and interactions with the database.

#### `src/routes/`
This folder contains the route definitions, mapping URLs to the corresponding controller functions.

#### `src/middleware/`
This folder includes middleware functions that process requests before they reach the controllers.

#### `src/utils/`
This folder contains utility functions and helpers used throughout the project.

### Running the Code
To run the code, navigate to the `src` folder and execute the following command:
```bash
npm start
```

### Testing
To run tests, use the following command:
```bash
npm test
```

### Additional Information
For more detailed information on each file and function, refer to the inline comments and documentation within the code.
