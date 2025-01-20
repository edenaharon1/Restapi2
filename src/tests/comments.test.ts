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

describe("Comments tests", () => {
    let commentId: string;

    test("Add a new comment", async () => {
        const response = await request(app).post(`/comments/post/${postInfo._id}`).set("Authorization", `Bearer ${userInfo.token}`).send({
            content: "This is a test comment",
            author: userInfo._id,
            post: postInfo._id
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("content", "This is a test comment");
        commentId = response.body._id;
    });

    test("Add a comment to a non-existent post", async () => {
        const response = await request(app).post(`/comments/post/invalidPostId`).set("Authorization", `Bearer ${userInfo.token}`).send({
            content: "This is a test comment",
            author: userInfo._id,
            post: "invalidPostId"
        });
        expect(response.statusCode).toBe(400);
    });

    test("Get comments by post ID", async () => {
        const response = await request(app).get(`/comments/post/${postInfo._id}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Get comments by non-existent post ID", async () => {
        const response = await request(app).get(`/comments/post/invalidPostId`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid post ID");
    });
    
    test("Get comments by valid post ID with no comments", async () => {
        const newPostResponse = await request(app).post("/posts").set("Authorization", `Bearer ${userInfo.token}`).send({
            title: "Empty Post",
            content: "No comments here",
            senderId: userInfo._id,
        });
    
        const newPostId = newPostResponse.body._id;
    
        const response = await request(app).get(`/comments/post/${newPostId}`);
        expect(response.statusCode).toBe(404); // Expecting 404 for no comments
        expect(response.body).toHaveProperty("error", "No comments found for this post");
    });
    

    test("Update comment", async () => {
        const response = await request(app).put(`/comments/${commentId}`).set("Authorization", `Bearer ${userInfo.token}`).send({
            content: "Updated test comment"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("content", "Updated test comment");
    });

    test("Update comment unauthorized", async () => {
        const response = await request(app).put(`/comments/${commentId}`).send({
            content: "Unauthorized update"
        });
        expect(response.statusCode).toBe(401);
    });

    test("Update non-existent comment", async () => {
        const response = await request(app).put(`/comments/invalidCommentId`).set("Authorization", `Bearer ${userInfo.token}`).send({
            content: "Updated test comment"
        });
        expect(response.statusCode).toBe(400);
    });

    test("Delete comment", async () => {
        const response = await request(app).delete(`/comments/${commentId}`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Comment deleted successfully");
    });

    test("Delete comment unauthorized", async () => {
        const response = await request(app).delete(`/comments/${commentId}`);
        expect(response.statusCode).toBe(401);
    });

    test("Delete non-existent comment", async () => {
        const response = await request(app).delete(`/comments/invalidCommentId`).set("Authorization", `Bearer ${userInfo.token}`);
        expect(response.statusCode).toBe(400);
    });
});