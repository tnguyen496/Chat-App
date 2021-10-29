const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
    const newPost = new Post(req.body);
    try {
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } catch (err) {
      res.status(500).json(err);
    }
});

//update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({$set: req.body});
            res.status(200).json("the post has been updated");
        } else {
            res.status(403).json("you can update only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//like or remove like from a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.likes.includes(req.body.userId)) {
            await post.updateOne({$pull : {likes : req.body.userId}});
            res.status(200).json("the like has been removed from the post");
        } else {
            await post.updateOne({$push : {likes : req.body.userId}});
            res.status(200).json("the like has been added from the post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get timeline posts from a user
router.get("/timeline/all", async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        const posts = await Post.find({userId: user._id});
        const friendPosts = await Promise.all(
            user.followings.map(friendId => {
                return Post.find({userId : friendId});
            })
        )
        res.status(200).json(posts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});
module.exports = router
