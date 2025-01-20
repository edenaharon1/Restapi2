import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import UserModel from "../models/user_model";

beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL_ENV || 'mongodb://localhost:27017/mydatabase');
    await UserModel.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Auth tests", () => {
    test("Register a new user", async () => {
        const response = await request(app).post("/auth/register").send({
            username: "testuser",
            email: "testuser@example.com",
            password: "password123"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.user).toHaveProperty("username", "testuser");
    });

    test("Register with existing email", async () => {
        const response = await request(app).post("/auth/register").send({
            username: "testuser2",
            email: "testuser@example.com",
            password: "password123"
        });
        expect(response.statusCode).toBe(409);
        expect(response.body).toHaveProperty("message", "Email already exists");
    });

    test("Login with valid credentials", async () => {
        const response = await request(app).post("/auth/login").send({
            email: "testuser@example.com",
            password: "password123"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    });

    test("Login with invalid credentials", async () => {
        const response = await request(app).post("/auth/login").send({
            email: "testuser@example.com",
            password: "wrongpassword"
        });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid credentials");
    });

    test("Logout", async () => {
        const response = await request(app).post("/auth/logout");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Logged out successfully");
    });
});