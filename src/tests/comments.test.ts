import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentsModel from'../models/comments_model';


let app: any;
beforeAll(async()=>{
    app= await initApp();
    console.log('beforeAll'); 
   await commentsModel.deleteMany();
});

afterAll(async()=>{
    console.log('afterAll'); 
    await mongoose.connection.close();
}); 

var commentId = "";
const testComment={
    comment: "first title",
    postId: "this is the first post",
    owner: "eden",
}

describe("comment test suite", () => {
    test ("comment test get all",async () => {
       const response= await request(app).get("/comments");
       expect(response.statusCode).toBe(200);
       expect(response.body).toHaveLength(0);
    });
});

test("Test adding new comment", async () =>{
    const response = await request(app).post("/comments").send(testComment);
    expect(response.statusCode).toBe(201);
    expect(response.body.comment).toBe(testComment.comment);
    expect(response.body.postId).toBe(testComment.postId);
    expect(response.body.owner).toBe(testComment.owner);
    commentId = response.body._id;
});

test("test get comment by owner", async () => {
    const response = await request(app).get("/comments?owner="+ testComment.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testComment.owner);
});

test("test get comment by id", async () => {
    const response = await request(app).get("/posts/"+commentId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
});

test("test get comment by id fail", async () => {
    const response = await request(app).get("/comments/hdncj545kdgf875");
    expect(response.statusCode).toBe(400);
});