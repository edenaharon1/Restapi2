import mongoose from "mongoose";

export interface iComment {
    title: string;
    postID: string;
    owner: string;
  }

const commentsSchema = new mongoose.Schema<iComment>({
    title: {
      type: String,
      required: true,
    },
    postID: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
  });
  
  const commentsModel = mongoose.model<iComment>("comments", commentsSchema);
  
  export default commentsModel;
 