import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import UserModel from "../models/user_model";

let userInfo: any;

beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL_ENV || 'mongodb://localhost:27017/mydatabase');
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

describe("Users tests", () => {
    test("Get user by ID", async () => {
        const response = await request(app).get(`/users/${userInfo._id}`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty("username", "testuser");
    });

    test("Get user by ID not found", async () => {
        const response = await request(app).get(`/users/invalidId`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(500);
    });

    test("Get all users", async () => {
        const response = await request(app).get("/users").set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveLength(1);
    });

    test("Update user", async () => {
        const response = await request(app).put(`/users/${userInfo._id}`).set("Authorization", `Bearer ${userInfo.token}`).send({
            username: "updateduser",
            email: "updateduser@example.com"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toHaveProperty("username", "updateduser");
    });

    test("Update user with existing email", async () => {
        await request(app).post("/auth/register").send({
            username: "testuser2",
            email: "testuser2@example.com",
            password: "password123"
        });

        const response = await request(app).put(`/users/${userInfo._id}`).set("Authorization", `Bearer ${userInfo.token}`).send({
            email: "testuser2@example.com"
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "Username or email already in use");
    });

    test("Delete user", async () => {
        const response = await request(app).delete(`/users/${userInfo._id}`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "User deleted successfully");
    });

    test("Delete user not found", async () => {
        const response = await request(app).delete(`/users/invalidId`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(500);
    });
});