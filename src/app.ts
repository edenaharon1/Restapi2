import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user_routes";
import postRoutes from "./routes/posts_routes";
import authRoutes from "./routes/auth_routes";
import commentRoutes from "./routes/comments_routes";
import bodyParser from "body-parser";
import setupSwagger from "./swagger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/comments", commentRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Hello world!");
});

setupSwagger(app);

if (!process.env.DB_URL_ENV) {
  console.error('DB_URL_ENV environment variable is not defined');
  process.exit(1);
}

mongoose.connect(process.env.DB_URL_ENV)
  .then(() => {
    console.log('Connected to MongoDB');
    if (require.main === module) {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

export { app };