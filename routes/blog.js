const express = require('express');


const db = require('../data/database');
const mongodb = require('mongodb');
const session = require('express-session');
const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/',(req, res)=>{
    res.render('welcome', {csrfToken: req.csrfToken()});
});


router.get('/admin', async (req, res)=> {
    if(!req.session.isAuthenticated) {
        return res.status(401).render('401');
    };   
    
    const posts = await db
    .getDb()
    .collection('posts')
    .find()
    .toArray();

    let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      hasError: false,
      title: '',
      content: '',
    };
  }
  req.session.inputData = null;

   return res.render('admin', { 
    posts: posts,
    inputData: sessionInputData,
    csrfToken: req.csrfToken()
   });
});


router.post('/posts', async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;


    if(!enteredTitle ||
        !enteredContent||
        enteredTitle.trim() === ''||
        enteredContent.trim() === ''
    ) {
        req.session.inputData = {
            hasError: true,
            message: 'invalid input - please check your data.',
            title: enteredTitle,
            content: enteredContent
        }
        res.redirect('/admin');
        return;
    };


    const newPost = {
        title: enteredTitle,
        content: enteredContent,
    };

    await db.getDb().collection('posts').insertOne(newPost);

     res.redirect('/admin')
})

router.get('/posts/:id/edit',async (req, res) =>{

    const postId = new ObjectId(req.params.id);
    const post = await db.getDb().collection('posts').findOne({_id: postId});

    if(!post) {
        res.render('404');
    }

    let sessionInputData = req.session.inputData;

    if(!sessionInputData) {
        sessionInputData = {
            hasError: false,
            title: post.title,
            content: post.content
        }
    }

    req.session.inputData = null;

    res.render('single-post', {
        post: post,
        inputData: sessionInputData,
        csrfToken: req.csrfToken()
    });
});

router.post('/posts/:id/edit', async (req, res) => {
    const enteredTitle = req.body.title;
    const enteredContent = req.body.content;
    const postId = new ObjectId(req.params.id);

    if(!enteredTitle ||
        !enteredContent ||
        enteredTitle.trim() === '' ||
        enteredContent.trim() === ''
    ) {
        req.session.inputData = {
            hasError: true,
            message: 'Invalid input - please check you data.',
            title: enteredTitle,
            content: enteredContent
        }
        res.redirect(`/posts/${req.params.id}/edit`);
        return;
    };


    await db
    .getDb()
    .collection('posts')
    .updateOne(
        {_id: postId},
        {$set: {title: enteredTitle, content: enteredContent}}
    );


    res.redirect('/admin');
    return;
});

router.post('/posts/:id/delete', async (req, res) =>{
 const postId = new ObjectId(req.params.id);

 await db.getDb().collection('posts').deleteOne(
    {_id: postId},

res.redirect('/admin')
)});


module.exports = router;