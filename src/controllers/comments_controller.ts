import commentsModel, {iComment} from "../models/comments_model";
import {Request,Response} from "express";
import BaseController from './base_controller';

const commentsController = new BaseController<iComment>(commentsModel);

 export default commentsController;

    