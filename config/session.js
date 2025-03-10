const mongodbStore = require('connect-mongodb-session');


createSessionStore = (session) => {
    const MongoDBStore = mongodbStore(session);
   
    const sessionStore = new MongoDBStore({
        uri: 'mongodb://localhost:27017',
        databaseName: "auth-blog",
        collection: 'sessions'
    });

    return sessionStore;
};



createSessionConfig = (sessionStore) => {
    return {
        secret: 'super-secret',
        resave: false,
        saveUninitialized: false,
        store: sessionStore, 
        cookie: {
            maxAge: 2* 24 * 60 * 60 * 1000
        }
    }

}


module.exports = {
    createSessionStore: createSessionStore,
    createSessionConfig: createSessionConfig
};