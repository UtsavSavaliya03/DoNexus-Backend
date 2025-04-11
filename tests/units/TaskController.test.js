const request = require("supertest");
const app = require("../../app.js");
const Task = require("../../Models/Task/Task.js");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');

jest.mock("jsonwebtoken");
jest.mock("../../Models/Task/Task");

describe("Task Controller", () => {
  const token = "mockedToken";
  const mockUserId = "user123";
  let taskId;

  beforeEach(() => {
    jwt.verify.mockReturnValue({
      user: { _id: mockUserId }
    });
    taskId = new mongoose.Types.ObjectId();
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

  describe('PATCH /api/v1/task/completion/:taskId', () => {
    it('should update task completion status successfully and return 200', async () => {
      // Mocking the Task.findOneAndUpdate response
      Task.findOneAndUpdate.mockResolvedValue({
        _id: taskId,
        userId: '12345',
        isCompleted: true
      });

      const res = await request(app)
        .patch(`/api/v1/task/completion/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isCompleted: true });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toBe('Task status updated successfully.');
      expect(res.body.data.isCompleted).toBe(true);
    });

    it('should return 404 if task not found or user does not have permission', async () => {
      Task.findOneAndUpdate.mockResolvedValue(null);  // Simulate that no task is found or user is not authorized

      const res = await request(app)
        .patch(`/api/v1/task/completion/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ isCompleted: true });

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe(false);
      expect(res.body.message).toBe("Task not found or you don't have permission to update it.");
    });
  });

  describe('DELETE /api/v1/task/:taskId', () => {
    it('should delete task successfully and return 200', async () => {
      // Mocking the Task.findOneAndDelete response
      Task.findOneAndDelete.mockResolvedValue({
        _id: taskId,
        userId: '12345',
        title: 'Sample Task',
      });

      const res = await request(app)
        .delete(`/api/v1/task/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toBe('Task deleted successfully.');
    });

    it('should return 404 if task not found or user does not have permission', async () => {
      Task.findOneAndDelete.mockResolvedValue(null);  // Simulate task not found or permission denied

      const res = await request(app)
        .delete(`/api/v1/task/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe(false);
      expect(res.body.message).toBe("Task not found or you don't have permission to delete it.");
    });
  });

  describe('PUT /api/v1/task/update/:taskId', () => {
    it('should update task successfully and return 200', async () => {
      // Mocking the Task.findOneAndUpdate response
      Task.findOneAndUpdate.mockResolvedValue({
        _id: taskId,
        userId: '12345',
        title: 'Updated Task',
        description: 'Updated Description',
      });

      const res = await request(app)
        .put(`/api/v1/task/update/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe(true);
      expect(res.body.message).toBe('Task updated successfully.');
      expect(res.body.data.title).toBe('Updated Task');
    });

    it('should return 400 if no fields are provided for update', async () => {
      const res = await request(app)
        .put(`/api/v1/task/update/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe(false);
      expect(res.body.message).toBe('At least one field (title, description, dueDate, or isCompleted) must be provided for update');
    });

    it('should return 404 if task not found or user does not have permission', async () => {
      Task.findOneAndUpdate.mockResolvedValue(null);  // Simulate task not found or permission denied

      const res = await request(app)
        .put(`/api/v1/task/update/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.status).toBe(false);
      expect(res.body.message).toBe("Task not found or you don't have permission to update it.");
    });
  });
});