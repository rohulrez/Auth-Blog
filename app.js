const path = require('path');

const express = require('express');
const session = require('express-session');
// const csrf = require('csurf')

const db = require('./data/database')
const blogRoutes = require('./routes/blog');
const authRoutes = require('./routes/auth');
const sessionConfig = require('./config/session');
const authMiddleware = require('./middlewares/auth-middleware')


const { constrainedMemory } = require('process');

const mongodbSessionStore = sessionConfig.createSessionStore(session);

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(sessionConfig.createSessionConfig(mongodbSessionStore)));
// app.use(csrf());

// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken();
//     next();
//   });

app.use(authMiddleware);

app.use(blogRoutes);
app.use(authRoutes);

app.use((error, req, res, next)=> {
    res.status(500).render('500');
})

db.connectToDatabase().then(()=> {
    app.listen('3000');
})
;