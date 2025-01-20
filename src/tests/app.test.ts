import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import CommentModel from "../models/comments_model";
import UserModel from "../models/user_model";
import PostModel from "../models/post_model";

let userInfo: any;
let postInfo: any;

beforeAll(async () => {
  await mongoose.connect(process.env.DB_URL_ENV || 'mongodb://localhost:27017/mydatabase');
  await CommentModel.deleteMany();
  await UserModel.deleteMany();
  await PostModel.deleteMany();

  const userResponse = await request(app).post("/auth/register").send({
    username: "testuser",
    email: "testuser@example.com",
    password: "password123"
  });
  userInfo = userResponse.body.user;

  const loginResponse = await request(app).post("/auth/login").send({
    email: userInfo.email,
    password: "password123"
  });
  userInfo.token = loginResponse.body.token;

  const postResponse = await request(app).post("/posts").set("Authorization", `Bearer ${userInfo.token}`).send({
    title: "Test Post",
    content: "This is a test post",
    senderId: userInfo._id
  });
  postInfo = postResponse.body;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("App tests", () => {
  test("GET / should return Hello world!", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Hello world!");
  });

  test("GET /comments should return 200", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
  });

  test("GET /posts should return 200", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
  });

  test("GET /users should return 401", async () => {
    const response = await request(app).get("/users");
    expect(response.statusCode).toBe(401);
  });

  test("POST /auth/login should return 200", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "testuser@example.com",
      password: "password123"
    });
    expect(response.statusCode).toBe(200);
  });

  test("GET /nonexistent should return 404", async () => {
    const response = await request(app).get("/nonexistent");
    expect(response.statusCode).toBe(404);
  });

});