const path = require("path");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;
const mongoose = require('mongoose');

const route = require("./routes");
const db = require("./config/db");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");

const handlebars = require('handlebars');

// Connect to Database
db.connect();

// Định nghĩa helper 'reduce'
handlebars.registerHelper('reduce', function(array, options) {
    return array.reduce((acc, current) => {
        acc.push(options.fn(current)); // Lặp qua từng phần tử và áp dụng block
        return acc;
    }, []);
});

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(flash());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());

app.use(passport.session());

app.use(cookieParser());

app.use(methodOverride("_method"));

// HTTP logger
app.use(morgan("combined"));

// Template engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
    })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));


const Products = require("./app/models/Products");
// Endpoint to fetch products with filters and pagination
app.get('/api/products', async (req, res) => {
    const { sort, category, brand, limit, minPrice, maxPrice, page } = req.query;
    let sortCriteria = {};
    let query = {};

    if (category && category !== "all") {
        const categoryArray = category.split(',').filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
        query.categoriesId = { $in: categoryArray };
    }

    if (brand && brand !== "all") {
        const brandArray = brand.split(',').filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
        query.brandsId = { $in: brandArray };
    }

    if (minPrice) {
        query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
        query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }

    const itemsPerPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * itemsPerPage;

    switch (sort) {
        case 'stock_0':
            sortCriteria = { stock: -1 };
            break;
        case 'stock_1':
            sortCriteria = { stock: 1 };
            break;
        case 'rating_0':
            sortCriteria = { rate: -1 };
            break;
        case 'rating_1':
            sortCriteria = { rate: 1 };
            break;
        case 'price_0':
            sortCriteria = { price: -1 };
            break;
        case 'price_1':
            sortCriteria = { price: 1 };
            break;
        default:
            sortCriteria = {};
    }

    console.log(query);

    try {
        const totalProducts = await Products.countDocuments(query);
        const products = await Products.find(query).sort(sortCriteria).skip(skip).limit(itemsPerPage).exec();
        res.json({
            products,
            totalProducts,
            previousPage: currentPage > 1 ? currentPage - 1 : null,
            currentPage,
            nextPage: currentPage < Math.ceil(totalProducts / itemsPerPage) ? currentPage + 1 : null,
            totalPages: Math.ceil(totalProducts / itemsPerPage)
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

// Routes init
route(app);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
