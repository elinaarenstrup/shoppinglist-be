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
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    default: 0,
    required: false,
  },
});

// Hardcoded array of items just to have something to work with
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

//npm express-list-endpoints
const listEndpoints = require("express-list-endpoints");

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Endpoints here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

// Get all items
app.get("/items", (req, res) => {
  Item.find().then((items) => {
    res.json(items);
  });
});

// Post/add new thought
app.post("/items", async (req, res) => {
  const { postedItem } = req.body;
  // Then use our mongoose model to create the database entry
  const item = new Item({ postedItem });

  try {
    // Success-case, send good status code to the client
    const savedItem = await item.save();
    res.status(200).json(savedItem);
  } catch (err) {
    // Bad-req, send bad status code to the client
    res.status(404).json({
      message: "Sorry, could not save this item to database.",
      errors: err.errors,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
