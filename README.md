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

#### `src/app/controllers/`
This folder contains the controller files, which handle the business logic for different parts of the application.



 * **CartController.js**
 * 
 * The `CartController.js` file is responsible for managing all functionalities related to the shopping cart. This includes:
 * - Adding items to the cart: Users can add products to their shopping cart.
 * - Removing items from the cart: Users can remove products from their cart if they no longer wish to purchase them.
 * - Updating item quantities: Users can change the quantity of each product in their cart.
 * - Viewing cart contents: Users can view the list of products they have added to their cart, along with details such as product name, price, and quantity.
 * 
 * This controller ensures that the shopping cart operations are handled efficiently and provides a seamless user experience.
 


 * **ShopController.js**
 * 
 * The `ShopController.js` file handles all operations related to the shop and its products. This includes:
 * - Displaying products: The controller fetches and displays a list of available products to the users.
 * - Filtering products by categories: Users can filter products based on different categories to find what they are looking for more easily.
 * - Managing product details: The controller provides detailed information about each product, including descriptions, prices, and images.
 * 
 * This controller is essential for managing the product catalog and ensuring that users can easily browse and find products in the shop.
 

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


#### `src/app/models/`
This folder includes the data models used in the application, defining the structure of the data and interactions with the database.
**`Brand.js`**
This file defines the data model for the `Brand` entity. It includes attributes such as `name`, `description`, and any relationships with other entities like `Product`.

**`Cart.js`**
This file defines the data model for the `Cart` entity. It includes attributes such as `userId`, `items`, `totalPrice`, and methods to add, remove, or update items in the cart.

**`Categories.js`**
This file defines the data model for the `Categories` entity. It includes attributes such as `name`, `description`, and any hierarchical relationships with other categories or products.

**`Product.js`**
This file defines the data model for the `Product` entity. It includes attributes such as `name`, `description`, `price`, `brandId`, `categoryId`, and any relationships with other entities like `Brand` and `Categories`.

**`User.js`**
This file defines the data model for the `User` entity. It includes attributes such as `username`, `password`, `email`, `role`, and any relationships with other entities like `Cart`.


#### `src/routes/`
This folder contains the route definitions, mapping URLs to the corresponding controller functions.

- **index.js**: This file serves as the main entry point for the route definitions. It typically imports and uses the other route files, consolidating them into a single router that can be used by the application.

- **cart.js**: This file handles all the routes related to the shopping cart functionality. It includes routes for adding items to the cart, removing items, updating item quantities, and viewing the cart.

- **shop.js**: This file manages the routes related to the shopping experience. It includes routes for viewing products, searching for products, and filtering products by categories or other criteria.

- **site.js**: This file contains the routes for the general site pages. It includes routes for the homepage, about page, contact page, and any other static or informational pages on the website.

#### `src/middleware/`
This folder includes middleware functions that process requests before they reach the controllers.

- **paginated.js**: This middleware function handles pagination for API responses. It processes query parameters to determine the page number and page size, and modifies the response to include paginated data.

- **passport.js**: This middleware function handles authentication using Passport.js. It configures strategies for user login, registration, and session management, ensuring secure and efficient authentication processes.

#### `src/public/`
This folder contains publicly accessible assets used by the application.

- **img/**: This folder stores static images that are displayed on the website. These images can include product photos, banners, logos, and other visual elements that enhance the user experience.

- **script/**: This folder contains JavaScript files that are used on the client side. These scripts can include custom JavaScript code for enhancing interactivity, handling user events, and manipulating the DOM.
    * - **cart.js**: Manages the shopping cart functionality, including adding, removing, and updating items in the cart.
    * - **common.js**: Contains common utility functions and shared code that can be used across different parts of the application.
    * - **header.js**: Handles the behavior and interactivity of the website's header, such as navigation menus and search functionality.
    * - **register.js**: Manages the user registration process, including form validation and submission.
    * - **shop.js**: Implements the main shopping page functionality, including product listing, filtering, and sorting.
    * - **singleProduct.js**: Manages the display and interaction of individual product pages, including product details, reviews, and related products.

- **reset.css**: This file is used to reset the default styling of HTML elements, ensuring a consistent appearance across different browsers. It removes default margins, paddings, and other styles, providing a clean slate for custom styling.

#### `src/resources/`
This folder contains various resources used by the application, including stylesheets and other assets.

##### `scss/`
This folder contains SCSS (Sass) files used for styling the application. Each file corresponds to a specific part of the website, providing modular and maintainable styles.

- **_cart.scss**: Contains styles for the shopping cart page, including the layout and design of the cart items, totals, and checkout button.
- **_checkout.scss**: Defines styles for the checkout process, including forms, buttons, and summary sections.
- **_footer.scss**: Includes styles for the website's footer, ensuring a consistent look and feel across all pages.
- **_header.scss**: Contains styles for the website's header, including navigation menus, logo, and search bar.
- **_home.scss**: Defines styles for the homepage, including banners, featured products, and promotional sections.
- **_login.scss**: Contains styles for the login page, including form fields, buttons, and error messages.
- **_register.scss**: Defines styles for the registration page, ensuring a consistent and user-friendly design for new user sign-ups.
- **_search.scss**: Includes styles for the search results page, including the layout of search results and filters.
- **_shop.scss**: Contains styles for the main shopping page, including product listings, categories, and sorting options.
- **_singleProduct.scss**: Defines styles for individual product pages, including product details, images, reviews, and related products.
- **app.scss**: The main SCSS file that imports and compiles all the individual SCSS files into a single stylesheet for the application.

These SCSS files help maintain a clean and organized codebase, making it easier to manage and update the styles of the application.

##### `views/`
This folder contains the Handlebars templates used for rendering the HTML views of the application.

- **layouts/**: This folder includes the main layout templates.
    - **main.hbs**: The main layout file that defines the overall structure of the HTML pages, including the header, footer, and content sections.

- **partials/**: This folder contains partial templates that can be reused across different views.
    - **footer.hbs**: The partial template for the footer section of the website.
    - **header.hbs**: The partial template for the header section of the website, including navigation menus and the logo.

- **cart.hbs**: The template for the shopping cart page, displaying the items in the cart, totals, and checkout button.
- **checkout.hbs**: The template for the checkout page, including forms for shipping information, payment details, and order summary.
- **home.hbs**: The template for the homepage, featuring banners, featured products, and promotional sections.
- **login.hbs**: The template for the login page, including form fields for username and password, and error messages.
- **register.hbs**: The template for the registration page, including form fields for user sign-up and validation messages.
- **search.hbs**: The template for the search results page, displaying the search results and filters.
- **shop.hbs**: The template for the main shopping page, including product listings, categories, and sorting options.
- **singleProduct.hbs**: The template for individual product pages, displaying product details, images, reviews, and related products.

#### `src/util/`
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
