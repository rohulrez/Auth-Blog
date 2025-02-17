const path = require('path');

const express = require('express');
const session = require('express-session');
const csrf = require('csurf');

const db = require('./data/database')
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const sessionConfig = require('./config/session');
const authMiddleware = require('./middlewares/auth-middleware');
const addCSRFTokenMiddleware = require('./middlewares/csrf-token-middleware');


const { constrainedMemory } = require('process');

const mongodbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));
app.use(csrf());

app.use(addCSRFTokenMiddleware);
app.use(authMiddleware);

app.use(blogRoutes);
app.use(authRoutes);

app.use((error, req, res, next)=> {
    res.status(500).render('500',{ csrfToken: req.csrfToken() });
})

db.connectToDatabase().then(()=> {
    app.listen('3000');
})
;