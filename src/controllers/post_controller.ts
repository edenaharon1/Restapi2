import PostModel,{iPost} from "../models/post_model";
import {Request,Response} from "express";
import BaseController from "./base_controller";


class PostsController extends BaseController<iPost> {
    constructor() {
        super(PostModel);
    }

    async create(req: Request, res: Response) {
        const userId = req.params.userId;
        const post = {
            ...req.body,
            owner: userId
        }
        req.body = post;
        super.create(req, res);
    };
}

 export default new PostsController;
    