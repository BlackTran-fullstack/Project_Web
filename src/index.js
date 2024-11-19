const path = require("path");
const express = require("express");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const app = express();
const port = 3000;

const route = require("./routes");
const db = require("./config/db");

// Connect to Database
db.connect();

app.use(express.static(path.join(__dirname, "public")));

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

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
app.get('/api/products', async (req, res) => {
    const { sort, category, limit } = req.query;
    let sortCriteria = {};
    let query = {};

    if (category) {
        query.categoriesId = category;
    }

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

    try {
        const products = await Products.find(query).sort(sortCriteria).limit(parseInt(limit) || 0).exec();
        res.json(products);
    } catch (err) {
        res.status(500).send(err);
    }
});


// Routes init
route(app);

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
