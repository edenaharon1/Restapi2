import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import CommentModel from "../models/comments_model";
import PostModel from "../models/post_model";

class CommentsController {
    async createComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { content } = req.body;
            const postId = req.params.postId;
            const userId = req.params.userId;

            if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: "Invalid post ID or user ID" });
                return;
            }

            const comment = await CommentModel.create({
                content,
                author: userId,
                post: postId,
            });

            await PostModel.findByIdAndUpdate(postId, {
                $push: { comments: comment._id },
            });

            res.status(201).json(comment);
        } catch (error: any) {
            next(error);
        }
    }

    async getCommentsByPost(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const postId = req.params.postId;
    
            if (!mongoose.Types.ObjectId.isValid(postId)) {
                res.status(400).json({ error: "Invalid post ID" });
                return;
            }
    
            const post = await PostModel.findById(postId);
            if (!post) {
                res.status(404).json({ error: "Post not found" });
                return;
            }
    
            const comments = await CommentModel.find({ post: postId })
                .populate("author", "username")
                .sort({ createdAt: -1 });
    
            if (comments.length === 0) {
                res.status(404).json({ error: "No comments found for this post" });
                return;
            }
    
            res.status(200).json(comments);
        } catch (error: any) {
            next(error);
        }
    }
    

    async getAllComments(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const comments = await CommentModel.find()
                .populate("author", "username")
                .sort({ createdAt: -1 });

            res.status(200).json(comments);
        } catch (error: any) {
            next(error);
        }
    }

    async updateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { content } = req.body;
            const commentId = req.params.id;
            const userId = req.params.userId;

            if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: "Invalid comment ID or user ID" });
                return;
            }

            const comment = await CommentModel.findOneAndUpdate(
                { _id: commentId, author: userId },
                { content },
                { new: true }
            );

            if (!comment) {
                res.status(404).json({ message: "Comment not found or unauthorized" });
                return;
            }

            res.status(200).json(comment);
        } catch (error: any) {
            next(error);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const commentId = req.params.id;
            const userId = req.params.userId;

            if (!mongoose.Types.ObjectId.isValid(commentId) || !mongoose.Types.ObjectId.isValid(userId)) {
                res.status(400).json({ message: "Invalid comment ID or user ID" });
                return;
            }

            const comment = await CommentModel.findOneAndDelete({
                _id: commentId,
                author: userId,
            });

            if (!comment) {
                res.status(404).json({ message: "Comment not found or unauthorized" });
                return;
            }

            await PostModel.findByIdAndUpdate(comment.post, {
                $pull: { comments: comment._id },
            });

            res.status(200).json({ message: "Comment deleted successfully" });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new CommentsController();
