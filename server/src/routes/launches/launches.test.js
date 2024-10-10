const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");
const { loadPlanetsData } = require("../../models/planets.model")
describe("Launches API", () => {
  beforeAll(async() => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async()=> {
    await mongoDisconnect();
  })
  describe("Test GET /launches", () => {
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
    });
  });

  describe("Test POST /launches", () => {
    const launchCompleteDate = {
      mission: "Enterprise",
      rocket: "NCC",
      target: "Kepler-1410 b",
      launchDate: "January 4,2029"
    };
    const launchWithoutDate = {
      mission: "Enterprise",
      rocket: "NCC",
      target: "Kepler-1410 b"
    };

    const launchDataWithInvalidDate = {
      mission: "Enterprise",
      rocket: "NCC",
      target: "Kepler-1410 b",
      launchDate: "Aaaa"
    };
    test("It should response with 200 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchCompleteDate)
        .expect("Content-Type", /json/)
        .expect(201);
      const requestDate = new Date(launchCompleteDate.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);
      expect(response.body).toMatchObject(launchWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property"
      });
    });
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date"
      });
    });
  });
});
