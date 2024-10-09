// const express = require("express");
// const planetRouter = express.Router();
// const { httpGetAllPlanets } = require("./planet.controller");

// planetRouter.get("/", httpGetAllPlanets);

// module.exports = planetRouter;


const express = require('express');

const {
  httpGetAllPlanets,
} = require('./planet.controller');

const planetsRouter = express.Router();

planetsRouter.get('/', httpGetAllPlanets);

module.exports = planetsRouter;