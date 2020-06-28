const express = require("express");
const app = express();
const cors = require("cors");

const points = require("../points/points.json");
const states = require("../states/states.json");
app.use(cors());

app.get("/points", (req, res, next) => {
  res.json(points);
});

app.get("/states", (req, res, next) => {
  res.json(states);
});

app.listen(5501, () => console.log("Server started at port 5501"));
