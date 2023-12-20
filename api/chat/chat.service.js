const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('chat')
        var chats = await collection.find(criteria).toArray()
        // return chats.filter((chat)=>chat.participantsIds.includes())
        return chats
    } catch (err) {
        logger.error('cannot find chats', err)
        throw err
    }
}

async function getById(chatId) {
    try {
        const collection = await dbService.getCollection('chat')
        const chat = await collection.findOne({ _id: ObjectId(chatId) })
        return chat
    } catch (err) {
        logger.error(`while finding chat ${chatId}`, err)
        throw err
    }
}

async function remove(chatId) {
    try {
        const collection = await dbService.getCollection('chat')
        await collection.deleteOne({ _id: ObjectId(chatId) })
        return chatId
    } catch (err) {
        logger.error(`cannot remove chat ${chatId}`, err)
        throw err
    }
}

async function add(chat) {
    try {
        // const chatToAdd = { ...chat, isDirectMessages: chat.isDirectMessages ? chat.isDirectMessages : false }
        const chatToAdd = { ...chat}
        const collection = await dbService.getCollection('chat')
        await collection.insertOne(chatToAdd)
        return chatToAdd
    } catch (err) {
        logger.error('cannot insert chat', err)
        throw err
    }
}

async function update(chat) {
    try {
        const chatId = ObjectId(chat._id)
        delete chat._id
        const collection = await dbService.getCollection('chat')
        await collection.updateOne({ _id: chatId }, { $set: { ...chat } })
        return { _id: chatId, ...chat }
    } catch (err) {
        logger.error(`cannot update chat ${chat._id}`, err)
        throw err
    }
}

// async function addMsg(msg) {
//     try {
//         var chatId = ObjectId(msg.chatId)
//         delete msg.chatId
//         const collection = await dbService.getCollection('chat')
//         await collection.updateOne({ _id: chatId }, { $push: { msgs: msg } })
//     } catch (err) {
//         logger.error(`cannot add message ${msg}`, err)
//         throw err
//     }
// }

function _buildCriteria(filterBy) {
    // console.log('filter in build',filterBy.userId);
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