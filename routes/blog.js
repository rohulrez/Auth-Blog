const express = require('express');
const bcrypt = require('bcryptjs')
const mongodb = require('mongodb')

const db = require('../data/database');
const session = require('express-session');

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
        conrfirmEmail: '',
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
        !enteredPassword || !
        enteredPassword < 6 || 
        enteredEmail != enteredConfirmEmail || 
        !enteredEmail.include('@')
    ) {

        req.session.inputData = {
            hasError: true,
            message: 'Invalid input - please check your data.',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        }

        req.session.save(() =>{
            return  res.redirect('/signup');
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
    const enteredConfirmEmail = userData['confirm-email'] ;
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
            confirmEmail: enteredConfirmEmail,
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

    if(! passwordsAreEqual) {
        req.session.inputData = {
            hasError: true,
            message: 'Could not log in - please check you credentials!',
            email: enteredEmail,
            confirmEmail: enteredConfirmEmail,
            password: enteredPassword
        };

        req.session.save(() => {
            res.redirect('/login');
        });
        return;
    }

    req.session.user = {
        id: existingUser._id.toString(),
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
    
    res.render('admin');
});

router.post('/logout', (req, res)=>{
    req.session.user = null;
    req.session.isAuthenticated = false;
    res.redirect('/');
})

module.exports = router;