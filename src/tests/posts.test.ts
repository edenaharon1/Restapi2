import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import PostModel from "../models/post_model";
import UserModel from "../models/user_model";

let userInfo: any;

beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL_ENV || 'mongodb://localhost:27017/mydatabase');
    await PostModel.deleteMany();
    await UserModel.deleteMany();

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
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Posts tests", () => {
    let postId: string;

    test("Add a new post", async () => {
        const response = await request(app).post("/posts").set("Authorization", `Bearer ${userInfo.token}`).send({
            title: "Test Post",
            content: "This is a test post",
            senderId: userInfo._id
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("title", "Test Post");
        postId = response.body._id;
    });

    test("Add a post with missing fields", async () => {
        const response = await request(app).post("/posts").set("Authorization", `Bearer ${userInfo.token}`).send({
            title: "Test Post"
        });
        expect(response.statusCode).toBe(500);
    });

    test("Get all posts", async () => {
        const response = await request(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Get post by ID", async () => {
        const response = await request(app).get(`/posts/${postId}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("title", "Test Post");
    });

    test("Get post by non-existent ID", async () => {
        const response = await request(app).get(`/posts/invalidPostId`);
        expect(response.statusCode).toBe(404);
    });

    test("Update post", async () => {
        const response = await request(app).put(`/posts/${postId}`).set("Authorization", `Bearer ${userInfo.token}`).send({
            title: "Updated Test Post"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("title", "Updated Test Post");
    });

    test("Update post unauthorized", async () => {
        const response = await request(app).put(`/posts/${postId}`).send({
            title: "Unauthorized update"
        });
        expect(response.statusCode).toBe(401);
    });

    test("Update non-existent post", async () => {
        const response = await request(app).put(`/posts/invalidPostId`).set("Authorization", `Bearer ${userInfo.token}`).send({
            title: "Updated Test Post"
        });
        expect(response.statusCode).toBe(404);
    });

    test("Delete post", async () => {
        const response = await request(app).delete(`/posts/${postId}`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Post deleted successfully");
    });

    test("Delete post unauthorized", async () => {
        const response = await request(app).delete(`/posts/${postId}`);
        expect(response.statusCode).toBe(401);
    });

    test("Delete non-existent post", async () => {
        const response = await request(app).delete(`/posts/invalidPostId`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(404);
    });
});