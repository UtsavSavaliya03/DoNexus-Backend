const request = require("supertest");
const app = require("../../app.js");
const Task = require("../../Models/Task/Task.js");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");
jest.mock("../../Models/Task/Task");

describe("Task Controller", () => {
  const token = "mockedToken";
  const mockUserId = "user123";

  beforeEach(() => {
    jwt.verify.mockReturnValue({
      user: { _id: mockUserId }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/task/add", () => {
    it("should add a task and return 201", async () => {
      const taskPayload = {
        title: "Test Task",
        description: "Test Description",
        dueDate: "2025-12-31"
      };

      Task.prototype.save = jest.fn().mockResolvedValue({
        _id: "task123",
        userId: mockUserId,
        ...taskPayload
      });

      const res = await request(app)
        .post("/api/v1/task/add")
        .set("Authorization", `Bearer ${token}`)
        .send(taskPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe(true);
      expect(res.body.data.title).toBe(taskPayload.title);
    });

    it("should return 422 for invalid data", async () => {
      const res = await request(app)
        .post("/api/v1/task/add")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "" });

      expect(res.statusCode).toBe(422);
      expect(res.body.status).toBe(false);
    });
  });

  describe("GET /api/v1/task/list", () => {
    it("should return tasks for authenticated user", async () => {
      const mockTasks = [
        { _id: "1", title: "Task 1", userId: mockUserId },
        { _id: "2", title: "Task 2", userId: mockUserId }
      ];

      Task.find.mockResolvedValue(mockTasks);

      const res = await request(app)
        .get("/api/v1/task/list")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });
});
