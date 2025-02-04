const path = require('path');

const express = require('express');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')

const { error } = require('console');
const { nextTick } = require('process');

const db = require('./data/database')
const blogRoutes = require('./routes/blog');
const { MongoOIDCError } = require('mongodb');

const MongoDBStore = mongodbStore(session);

const app = express();

const sessionStore = new MongoDBStore({
    uri: 'mongodb://localhost:27017',
    databaseName: "auth-blog",
    collection: 'sessions'
});

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'super-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore, 
    cookie: {
        maxAge: 2* 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) =>{
    const user = req.session.user;
    const isAuth = req.session.isAuthinticated;

    if(!user || !isAuth) {
        return next();
    }
    res.locals.isAuth = isAuth;

    next();
})

app.use(blogRoutes);

app.use((error, req, res, next)=> {
    res.status(500).render('500');
})

db.connectToDatabase().then(()=> {
    app.listen('3000');
})
