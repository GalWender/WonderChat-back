const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const chatService = require('../chat/chat.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('channel')
        var channels = await collection.find(criteria).toArray()
        return channels
    } catch (err) {
        logger.error('cannot find channels', err)
        throw err
    }
}

async function getById(channelId) {
    try {
        const collection = await dbService.getCollection('channel')
        const channel = await collection.findOne({ _id: ObjectId(channelId) })
        return channel
    } catch (err) {
        logger.error(`while finding channel ${channelId}`, err)
        throw err
    }
}

async function remove(channelId) {
    try {
        const collection = await dbService.getCollection('channel')
        await collection.deleteOne({ _id: ObjectId(channelId) })
        return channelId
    } catch (err) {
        logger.error(`cannot remove channel ${channelId}`, err)
        throw err
    }
}

async function add(channel) {
    try {
        const ID = new ObjectId()
        const channelToAdd = { _id: ID, ...channel }
        const collection = await dbService.getCollection('channel')
        await collection.insertOne(channelToAdd)
        if (channelToAdd.isDirectMessages === false) {
            chatService.add({ channelId: ID.toString(), name: "general", isDirectMessages: false })
        }
        return channelToAdd
    } catch (err) {
        logger.error('cannot insert channel', err)
        throw err
    }
}

async function update(channel) {
    try {
        const channelId = ObjectId(channel._id)
        delete channel._id
        const collection = await dbService.getCollection('channel')
        await collection.updateOne({ _id: channelId }, { $set: { ...channel } })
        return { _id: channelId, ...channel }
    } catch (err) {
        logger.error(`cannot update channel ${channel._id}`, err)
        throw err
    }
}

// async function addMsg(msg) {
//     try {
//         var channelId = ObjectId(msg.channelId)
//         delete msg.channelId
//         const collection = await dbService.getCollection('channel')
//         await collection.updateOne({ _id: channelId }, { $push: { msgs: msg } })
//     } catch (err) {
//         logger.error(`cannot add message ${msg}`, err)
//         throw err
//     }
// }

function _buildCriteria(filterBy) {
    // console.log(filterBy);
    const criteria = {}
    if (!filterBy) return criteria
    // if (filterBy.maxPrice && filterBy.maxPrice !== 0) criteria.price = { $lte: +filterBy.maxPrice }
    if (filterBy.userId) criteria.participantsIds = { $in: [filterBy.userId] }
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