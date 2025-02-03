const path = require('path');

const express = require('express');
const session = require('express-session');

const { error } = require('console');
const { nextTick } = require('process');

const db = require('./data/database')
const blogRouter = require('./routes/blog')

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret
}))
app.use(blogRouter);

app.use((error, req, res, next)=> {
    res.status(500).render('500');
})

db.connectToDatabase().then(()=> {
    app.listen('3000');
})
