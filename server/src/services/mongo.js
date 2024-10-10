const mongoose = require("mongoose");
const MONGO_URL = "mongodb+srv://nasa-api:9f8DRKU3YY4gEqVJ@cluster0.tagh3.mongodb.net/nasa?retryWrites=true&w=majority&appName=Cluster0" //process.env.MONGO_URL
mongoose.connection.once("open", () => {
  console.log("Connected!!");
});

mongoose.connection.on("error", err => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { mongoConnect, mongoDisconnect };
