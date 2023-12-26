const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('message')
        var messages = await collection.find(criteria).toArray()
        // return messages.filter((message)=>message.participantsIds.includes())
        return messages
    } catch (err) {
        logger.error('cannot find messages', err)
        throw err
    }
}

async function getById(messageId) {
    try {
        const collection = await dbService.getCollection('message')
        const message = await collection.findOne({ _id: ObjectId(messageId) })
        return message
    } catch (err) {
        logger.error(`while finding message ${messageId}`, err)
        throw err
    }
}

async function remove(messageId) {
    try {
        const collection = await dbService.getCollection('message')
        await collection.deleteOne({ _id: ObjectId(messageId) })
        return messageId
    } catch (err) {
        logger.error(`cannot remove message ${messageId}`, err)
        throw err
    }
}

async function add(message) {
    try {
        console.log('adding message',message);
        // const messageToAdd = { ...message, isDirectMessages: message.isDirectMessages ? message.isDirectMessages : false }
        const messageToAdd = { ...message}
        const collection = await dbService.getCollection('message')
        await collection.insertOne(messageToAdd)
        return messageToAdd
    } catch (err) {
        logger.error('cannot insert message', err)
        throw err
    }
}

async function update(message) {
    try {
        const messageId = ObjectId(message._id)
        delete message._id
        const collection = await dbService.getCollection('message')
        await collection.updateOne({ _id: messageId }, { $set: { ...message } })
        return { _id: messageId, ...message }
    } catch (err) {
        logger.error(`cannot update message ${message._id}`, err)
        throw err
    }
}

// async function addMsg(msg) {
//     try {
//         var messageId = ObjectId(msg.messageId)
//         delete msg.messageId
//         const collection = await dbService.getCollection('message')
//         await collection.updateOne({ _id: messageId }, { $push: { msgs: msg } })
//     } catch (err) {
//         logger.error(`cannot add message ${msg}`, err)
//         throw err
//     }
// }

function _buildCriteria(filterBy) {
    const criteria = {}
    if (!filterBy) return criteria
    // if (filterBy.maxPrice && filterBy.maxPrice !== 0) criteria.price = { $lte: +filterBy.maxPrice }
    // if (filterBy.userId) criteria.participantsIds = { $in: [filterBy.userId] }
    if (filterBy.channelId) criteria.channelId = filterBy.channelId;
    // if (filterBy.labels && filterBy.labels.length > 0) criteria.labels = { $all: filterBy.labels }
    // if (filterBy.inStock) criteria.inStock = { $eq: filterBy.inStock }
    // if (filterBy.inStock) criteria.inStock = { $eq: (filterBy.inStock === 'true') }
    // if (filterBy.labels)
    return criteria
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    // addMsg,
}