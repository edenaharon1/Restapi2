import express, { Request,Response,NextFunction } from "express";
const router = express.Router();
import postController from "../controllers/post_controller";
import {authMiddleware} from "../controllers/auth_controller";

router.get("/",postController.getAll.bind(postController));

router.get("/:id",postController.getById.bind(postController));

router.post("/",authMiddleware ,(req: Request, res: Response) => {
    postController.create(req, res);} );

router.delete("/:id",authMiddleware, postController.Delete.bind(postController));

export default router;