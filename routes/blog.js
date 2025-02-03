const express = require('express');
const bcrypt = require('bcryptjs')
const mongodb = require('mongodb')

const db = require('../data/database');

const router = express.Router();

router.get('/',(req, res)=>{
    res.render('welcome');
});

router.get('/signup', (req, res)=>{
    res.render('signup');
})

router.get('/login',  (req, res) => {
    res.render('login');
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
        return  res.redirect('/signup');
    };

    const existingUser = db
    .getDb()
    .collection('users')
    .findOne({email: enteredEmail});

    if(existingUser) {
        return res.redirect('/signup');
    }



    const hashedPassword = await bcrypt.hash(enteredPassword, 9);

    const user = {
        email: enteredEmail,
        confirmEmail: enteredConfirmEmail,
        password: hashedPassword
    };

    await db.getDb().collection('users').insertOne(user);

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
        res.redirect('/login');
    };

    const passwordsAreEqual = await bcrypt.compare(
        enteredPassword,
        existingUser.password
    );

    if(! passwordsAreEqual) {
        return res.redirect('login');
    }
    res.redirect('/admin');
})

router.get('/admin', (req, res)=> {
    res.render('admin');
});

router.post('/logout', (req, res)=>{
    res.redirect('/');
})

module.exports = router;