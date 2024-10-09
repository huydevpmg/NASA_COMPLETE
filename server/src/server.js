const http = require("http");
const app = require("./app");
require('dotenv').config();
const { mongoConnect } = require("./services/mongo");
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

async function createServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}
createServer();
