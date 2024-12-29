
import {Request,Response} from "express";
import {Model} from "mongoose";
 

class BaseController<T>  {
    model: Model<T>;
    constructor(model:Model<T>){
        this.model=model;
    }

 async getAll(req:Request, res:Response) {
    const ownerFilter=req.query.owner;
    try{
        if(ownerFilter){
            const posts = await this.model.find({owner:ownerFilter});
            res.status(200).send(posts);
        }else{
            const posts = await this.model.find();
            res.status(200).send(posts);
        }
    }
    catch(error:any){
     res.status(400).send({error: error.message});
    }
}

async create (req:Request, res:Response) {
   const post=req.body;
   try {
    const newPost = await this.model.create(post);
    res.status(201).send(newPost);
  } catch (error:any) {
    res.status(400).send({ error: error.message });

  }
};

async getById(req:Request, res:Response)  {
    const postId=req.params.id;
    try{
       const post= await this.model.findById(postId);
       
       res.status(200).send(post);
    }catch(error:any){
        res.status(400).send({ error: error.message });
    }
}

Delete (req:Request, res:Response){
    console.log("delete a post");
    res.send("delete a post");
 };
}

 export default BaseController ;
    