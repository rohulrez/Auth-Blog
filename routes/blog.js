const express = require('express');
const bcrypt = require('bcryptjs')


const db = require('../data/database');
const { ObjectId, ReturnDocument } = require('mongodb');
const session = require('express-session');

const router = express.Router();

router.get('/',(req, res)=>{
    res.render('welcome', {csrfToken: req.csrfToken()});
});

router.get('/signup', (req, res)=> {
    let sessionInputData = req.session.inputData;
   
    if (!sessionInputData) {
       sessionInputData= {
        hasError: false,
        email: '',
        confirmEmail: '',
        password: '',
    }};

    req.session.inputData = null;

    res.render('signup', {
        inputData: sessionInputData,
        csrfToken: req.csrfToken()
    });

});

router.get('/login',  (req, res) => {
    let sessionInputData = req.session.inputData;
   
    if (!sessionInputData) {
       sessionInputData= {
        hasError: false,
        email: '',
        password: '',
    }};

    req.session.inputData = null;

    res.render('login', {
        inputData: sessionInputData,
        csrfToken: req.csrfToken()

    });
})

router.post('/signup', async (req, res) => {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredConfirmEmail = userData['confirm-email'];
    const enteredPassword = userData.password;

    if (!enteredEmail || 
        !enteredConfirmEmail || 
        !enteredPassword || 
        enteredPassword.trim().length < 6 || 
        enteredEmail !== enteredConfirmEmail || 
        !enteredEmail.includes('@')
    ) {

        req.session.inputData = {
            hasError: true,
            message: 'Invalid input - please check your data.',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        }

        req.session.save(() =>{
            res.redirect('/signup');
        });
        return;
    }

    const existingUser = await db
    .getDb()
    .collection('users')
    .findOne({email: enteredEmail});

    if(existingUser) {
        req.session.inputData = {
            hasError: true,
            message: 'User already axists!',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        };

        req.session.save(() => { 
             res.redirect('/signup');
        })
        return;
    };

    const hashedPassword = await bcrypt.hash(enteredPassword, 9);

    const user = {
        email: enteredEmail,
        confirmEmail: enteredConfirmEmail,
        password: hashedPassword
    };

    await db
    .getDb()
    .collection('users')
    .insertOne(user);


    res.redirect('/login');
})

router.post('/login', async (req, res) => {
    const userData = req.body;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;

    const existingUser = await db
    .getDb()
    .collection('users')
    .findOne({
        email: enteredEmail
    });

    if(!existingUser) {
        req.session.inputData = {
            hasError: true,
            message: 'Could not log in - please check you credentials!',
            email: enteredEmail,
            password: enteredPassword
        };
        req.session.save(() => {
            res.redirect('/login');
        })
        return;
    };

    const passwordsAreEqual = await bcrypt.compare(
        enteredPassword,
        existingUser.password
    );

    if(!passwordsAreEqual) {
        req.session.inputData = {
            hasError: true,
            message: 'Could not log in - please check you credentials!',
            email: enteredEmail,
            password: enteredPassword
        };

        req.session.save(() => {
            res.redirect('/login');
        });
        return;
    }

    req.session.user = {
        id: existingUser._id,
        email: existingUser.email
    };
    req.session.isAuthenticated = true;

    req.session.save(() => {
        res.redirect('/admin');
    });

})

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

router.post('/logout', (req, res)=>{
    req.session.user = null;
    req.session.isAuthenticated = false;
    res.redirect('/');
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