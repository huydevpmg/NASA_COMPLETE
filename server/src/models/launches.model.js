const axios = require("axios");
const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

let DEFAULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100, //flight_number
  mission: "Kepler Exploration X", //name
  rocket: "Explorer IS1", //rocket.name
  launchDate: new Date("December 27,3000"), //date_local
  target: "Kepler-442 b", //not applicable
  customer: ["ZTM", "NASA"], //payloads.customer
  upcoming: true, //upcoming
  success: true //success
};

saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
async function populateLaunches() {
  console.log("Downloading launchd data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          path: "payloads",
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap(payload => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"], //name,
      rocket: launchDoc["rocket"]["name"], //rocket.name
      launchDate: new Date(launchDoc["date_local"]), //date_local
      target: "Kepler-442 b", //not applicable
      upcoming: launchDoc["upcoming"], //upcoming
      success: launchDoc["success"], //success,
      customers
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);

    //TODO: ...
  }
}
async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  });

  if (firstLaunch) {
    console.log("Launch data already loaded!");
    return;
  } else {
    await populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  console.log(`Latest num ${latestLaunch}`);
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}
async function saveLaunch(launch) {
  const checkPlanet = await planets.findOne({
    keplerName: launch.target
  });

  console.log(checkPlanet);
  if (!checkPlanet) {
    throw new Error("No matching planet");
  }
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber
    },
    launch,
    {
      upsert: true
    }
  );
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId
  });
}

async function getAllLaunches() {
  return await launchesDatabase.find(
    {},
    {
      _id: 0,
      __v: 0
    }
  );
}
async function scheduleNewLaunch(launch) {
  newFlightNum = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customer: ["Zero to Mastery", "Nasa"],
    flightNumber: newFlightNum
  });
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = launchesDatabase.updateOne(
    {
      flightNumber: launchId
    },
    {
      upcoming: false,
      success: false
    }
  );

  return aborted;

  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById
};
