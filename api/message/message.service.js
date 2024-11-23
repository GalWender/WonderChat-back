import * as dbService from '../../services/db.service.js';
import logger from '../../services/logger.service.js';
import * as utilService from '../../services/util.service.js';
import { ObjectId } from 'mongodb';

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy);
        const collection = await dbService.getCollection('message');
        var messages = await collection.find(criteria).toArray();
        return messages.map((message) => {
            return { ...message, createdAt: new Date(message.createdAt) };
        });
    } catch (err) {
        logger.error('cannot find messages', err);
        throw err;
    }
}

async function getById(messageId) {
    try {
        const collection = await dbService.getCollection('message');
        const message = await collection.findOne({ _id: new ObjectId(messageId) });
        return message;
    } catch (err) {
        logger.error(`while finding message ${messageId}`, err);
        throw err;
    }
}

async function remove(messageId) {
    try {
        const collection = await dbService.getCollection('message');
        await collection.deleteOne({ _id: new ObjectId(messageId) });
    } catch (err) {
        logger.error(`cannot remove message ${messageId}`, err);
        throw err;
    }
}

async function add(message) {
    try {
        const messageToAdd = {
            ...message,
            createdAt: Date.now()
        };
        const collection = await dbService.getCollection('message');
        await collection.insertOne(messageToAdd);
        return messageToAdd;
    } catch (err) {
        logger.error('cannot insert message', err);
        throw err;
    }
}

async function update(message) {
    try {
        const messageToSave = {
            ...message,
            _id: new ObjectId(message._id)
        };
        const collection = await dbService.getCollection('message');
        await collection.updateOne({ _id: messageToSave._id }, { $set: messageToSave });
        return messageToSave;
    } catch (err) {
        logger.error(`cannot update message ${message._id}`, err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    const criteria = {};
    if (!filterBy) return criteria;
    if (filterBy.chatId) criteria.chatId = filterBy.chatId;
    return criteria;
}

export {
    remove,
    query,
    getById,
    add,
    update
};