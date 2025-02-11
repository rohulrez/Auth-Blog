const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let database;

connectToDatabase = async () => {
    const client = await MongoClient.connect(
        'mongodb://localhost:27017'
        );
        database = client.db('auth-blog');
    };

getDb = () => {
    if (!database) {
        throw{ message: 'You must connect first!'}
    };
    return database;
};

module.exports = {
    connectToDatabase: connectToDatabase,
    getDb: getDb
};