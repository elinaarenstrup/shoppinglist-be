import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/shoppinglist-be";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.promise = Promise;

const Item = mongoose.model("Item", {
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
    required: true,
  },
});

Item.deleteMany().then(() => {
  new Item({
    name: "Apple",
    category: "Fruit",
    quantity: 5,
  }).save();
  new Item({
    name: "Sandwich",
    category: "Food",
    quantity: 2,
  }).save();
  new Item({
    name: "Lollipop",
    category: "Candy",
    quantity: 5,
  }).save();
});

// Defines the port the app will run on. Defaults to 8080.
const port = process.env.PORT || 8080;
const app = express();

/* //npm express-list-endpoints
const listEndpoints = require("express-list-endpoints"); */

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Endpoints here
app.get("/", (req, res) => {
  Item.find().then((items) => {
    res.json(items);
  });
  /* res.send(listEndpoints(app)); */
});

app.get("/:name", (req, res) => {
  Item.findOne({ name: req.params.name }).then((item) => {
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
