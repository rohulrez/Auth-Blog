const express = require('express');
const bcrypt = require('bcryptjs')


const db = require('../data/database');

const router = express.Router();

router.get('/',(req, res)=>{
    res.render('welcome');
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

    res.render('signup', {inputData: sessionInputData});

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

    res.render('login', {inputData: sessionInputData});
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
    
    const posts = await db.getDb().collection('posts').find().toArray();
    let sessionInputData = req.session.inputData;

  if (!sessionInputData) {
    sessionInputData = {
      title: '',
      content: '',
    };
  }
  req.session.inputData = null;

   return res.render('admin', { 
    posts: posts,
    inputData: sessionInputData
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

    const newPost = {
        title: enteredTitle,
        content: enteredContent,
    };

    await db.getDb().collection('posts').insertOne(newPost);

    return res.redirect('/admin')
})

module.exports = router;