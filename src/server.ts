import dotenv from "dotenv";
dotenv.config();

import express,{Express}from "express";
const app = express();
app.use(express.json());

const port = process.env.port;
import mongoose from "mongoose";
import postsRoutes from"./routes/posts_routes";
import commentRoutes from"./routes/comments_routes";
import bodyParser from "body-parser";
import authRouts from "./routes/auth_routes";

const initApp = ()=>{
  return new Promise < Express> ((resolve,reject)=>{
    const db = mongoose.connection;
    db.on("error", (error) => {
    console.error(error)
    });
    db.once("open", () => 
    console.log("Connected to database"
    ));
    
    if(process.env.DB_CONNECT===undefined){
      console.error("DB_CONNECT is not set");
      reject();
    }else{ 
    mongoose.connect(process.env.DB_CONNECT).then(()=>{
      console.log("initApp finished");
  
     
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use("/posts", postsRoutes);
    app.use("/comments", commentRoutes);
    app.use("/auth", authRouts);
    app.get("/", (req,res)=>{
        res.send("hello world!!!!");
    });
    resolve(app);
    });
  }
  });
};
export default initApp;