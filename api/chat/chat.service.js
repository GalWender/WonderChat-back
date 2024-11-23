import { ObjectId } from 'mongodb'
import * as dbService from '../../services/db.service.js'
import * as channelService from '../channel/channel.service.js'
import logger from '../../services/logger.service.js'
import * as utilService from '../../services/util.service.js'

async function query(filterBy) {
  try {
    logger.debug('Chat service - query with filter:', JSON.stringify(filterBy))
    const criteria = _buildCriteria(filterBy)

    // Get all channels where user is a participant
    const channels = await channelService.query({ userId: filterBy.userId })
    const channelIds = channels.map((channel) => channel._id.toString())

    // Add channel filter to criteria
    criteria.channelId = { $in: channelIds }

    logger.debug('Final criteria:', JSON.stringify(criteria))

    const collection = await dbService.getCollection('chat')
    const chats = await collection.find(criteria).toArray()

    logger.debug('Found chats:', chats.length)
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
  } catch (err) {
    logger.error(`cannot remove chat ${chatId}`, err)
    throw err
  }
}

async function add(chat) {
  try {
    const collection = await dbService.getCollection('chat')

    // Ensure chat has required fields
    chat.createdAt = Date.now()
    chat.updatedAt = Date.now()

    const { insertedId } = await collection.insertOne(chat)
    chat._id = insertedId

    return chat
  } catch (err) {
    logger.error('cannot insert chat', err)
    throw err
  }
}

async function update(chat) {
  try {
    const chatToSave = { ...chat }
    delete chatToSave._id

    chatToSave.updatedAt = Date.now()

    const collection = await dbService.getCollection('chat')
    await collection.updateOne({ _id: ObjectId(chat._id) }, { $set: chatToSave })
    return chat
  } catch (err) {
    logger.error(`cannot update chat ${chat._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}

  if (filterBy?.txt) {
    criteria.txt = { $regex: filterBy.txt, $options: 'i' }
  }

  if (filterBy?.channelId) {
    criteria.channelId = filterBy.channelId
  }

  return criteria
}

export { remove, query, getById, add, update }
