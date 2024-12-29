import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from'../models/post_model';


let app: any;
beforeAll(async()=>{
    app= await initApp();
    console.log('beforeAll'); 
    await postModel.deleteMany();
});

afterAll(async()=>{
    console.log('afterAll'); 
    await postModel.deleteMany();
    await mongoose.connection.close();
}); 

var postId = "";
const testPost={
    title: "first title",
    content: "this is the first post",
    owner: "eden",
}

describe("posts test suite", () => {
    test ("post test get all posts",async () => {
       const response= await request(app).get("/posts");
       expect(response.statusCode).toBe(200);
       expect(response.body).toHaveLength(0);
    });
});

test("Test adding new post", async () =>{
    const response = await request(app).post("/posts").send(testPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testPost.title);
    expect(response.body.content).toBe(testPost.content);
    expect(response.body.owner).toBe(testPost.owner);
    postId = response.body._id;
});

test("test get post by owner", async () => {
    const response = await request(app).get("/posts?owner=eden");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe("eden");
});

test("test get post by id", async () => {
    const response = await request(app).get("/posts/"+postId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postId);
});

test("test get post by id fail", async () => {
    const response = await request(app).get("/posts/"+postId+5);
    expect(response.statusCode).toBe(400);
});