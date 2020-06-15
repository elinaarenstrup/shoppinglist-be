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
  needsMore: {
    type: Boolean,
    default: false,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
});

// Defines the port the app will run on. Defaults to 8080.
const port = process.env.PORT || 8080;
const app = express();

//npm express-list-endpoints
const listEndpoints = require("express-list-endpoints");

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(bodyParser.json());

// Routes here
app.get("/", (req, res) => {
  res.send(listEndpoints(app));
});

// GET 20 items, desc start dates
app.get("/items", async (req, res) => {
  const items = await Item.find().sort({ startDate: "desc" }).limit(20).exec();
  res.json(items);
});



// POST
app.post("/items", async (req, res) => {
  //Retrive info sent by client to API endpoint
  const { name, category, quantity, complete } = req.body;

  //Use mongoose model to create db entry
  const item = new Item({ name, category, quantity, complete });

  //Save entry
  try {
    //Sucess return json object
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    //else bad req message
    res.status(400).json({
      message: "Could not save item to the Database",
      error: err.errors,
    });
  }
});

// Specific item by id
app.get("/:item", async (req, res) => {
  try {
    const singleItem = await Item.findById(req.params.item);
    res.json(singleItem)
  } catch (err) {
    res.status(400).json({
      message: "Could not find item id in the Database",
      error: err.errors,
    });
  }
});

//Delete specific item
app.delete("/:item", async (req, res) => {
  try {
    const removedItem = await Item.remove({ _id: req.params.item }) //_id needs to match req.params.item
    res.json(removedItem)
  } catch (err) {
    res.status(400).json({
      message: "Could not find item id in the Database",
      error: err.errors,
    });
  }
});

//Edit specific item

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
