import request from "supertest";
import { app } from "../app";
import mongoose from "mongoose";
import userModel from "../models/user_model";

let userInfo: any;

beforeAll(async () => {
    await mongoose.connect(process.env.DB_URL_ENV || 'mongodb://localhost:27017/mydatabase');
    await userModel.deleteMany();

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

describe("Auth Middleware tests", () => {
    test("Access protected route with valid token", async () => {
        const response = await request(app).get("/users").set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
    });

    test("Access protected route with invalid token", async () => {
        const response = await request(app).get("/users").set("Authorization", `Bearer invalidtoken`);
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized");
    });

    test("Access protected route without token", async () => {
        const response = await request(app).get("/users");
        expect(response.statusCode).toBe(401);
        expect(response.body).toHaveProperty("message", "Unauthorized");
    });
});