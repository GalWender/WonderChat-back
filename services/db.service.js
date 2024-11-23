import { MongoClient } from 'mongodb';
import logger from './logger.service.js';

// Database Name
const dbName = 'wonderchat_db';

var dbConn = null;

async function getCollection(collectionName) {
    try {
        const db = await connect();
        const collection = await db.collection(collectionName);
        return collection;
    } catch (err) {
        logger.error('Failed to get Mongo collection', err);
        throw err;
    }
}

async function connect() {
    if (dbConn) return dbConn;
    try {
        const client = await MongoClient.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = client.db(dbName);
        dbConn = db;
        logger.info(`Connected to DB: ${dbName}`);
        return db;
    } catch (err) {
        logger.error('Cannot Connect to DB', err);
        throw err;
    }
}

export {
    getCollection
};
