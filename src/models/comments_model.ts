import { Schema, model, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: Schema.Types.ObjectId;
  post: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  content: { type: String, required: true, trim: true, minlength: 1 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true }
}, {
  timestamps: true
});

commentSchema.index({ post: 1, createdAt: -1 });

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;