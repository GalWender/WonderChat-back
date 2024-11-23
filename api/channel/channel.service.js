import { ObjectId } from 'mongodb'
import * as dbService from '../../services/db.service.js'
import logger from '../../services/logger.service.js'
import * as utilService from '../../services/util.service.js'
import * as chatService from '../chat/chat.service.js'

async function query(filterBy = {}) {
  try {
    logger.debug('Channel query with filter:', JSON.stringify(filterBy))
    const criteria = _buildCriteria(filterBy)
    logger.debug('Built criteria:', JSON.stringify(criteria))

    const collection = await dbService.getCollection('channel')
    var channels = await collection.find(criteria).toArray()
    logger.debug('Found channels:', channels.length)
    logger.debug('Channel details:', JSON.stringify(channels))

    return channels
  } catch (err) {
    logger.error('cannot find channels', err)
    throw err
  }
}

async function getById(channelId) {
  try {
    const collection = await dbService.getCollection('channel')
    const channel = await collection.findOne({ _id: new ObjectId(channelId) })
    return channel
  } catch (err) {
    logger.error(`while finding channel ${channelId}`, err)
    throw err
  }
}

async function remove(channelId) {
  try {
    const collection = await dbService.getCollection('channel')
    await collection.deleteOne({ _id: new ObjectId(channelId) })
  } catch (err) {
    logger.error(`cannot remove channel ${channelId}`, err)
    throw err
  }
}

async function add(channel) {
  try {
    logger.debug('Adding channel:', JSON.stringify(channel))
    
    // Ensure participantsIds is an array
    if (!Array.isArray(channel.participantsIds)) {
      channel.participantsIds = []
    }

    const collection = await dbService.getCollection('channel')
    const addedChannel = await collection.insertOne(channel)
    channel._id = addedChannel.insertedId

    const chat = {
      channelId: channel._id.toString(),
      messages: [],
    }
    await chatService.add(chat)
    
    logger.debug('Successfully added channel:', JSON.stringify(channel))
    return channel
  } catch (err) {
    logger.error('cannot insert channel', err)
    throw err
  }
}

async function update(channel) {
  try {
    const channelToSave = { ...channel, _id: new ObjectId(channel._id) }
    const collection = await dbService.getCollection('channel')
    await collection.updateOne({ _id: channelToSave._id }, { $set: channelToSave })
    return channel
  } catch (err) {
    logger.error(`cannot update channel ${channel._id}`, err)
    throw err
  }
}

function _buildCriteria(filterBy = {}) {
  const criteria = {}
  logger.debug('Building criteria with filterBy:', JSON.stringify(filterBy))

  if (filterBy.userId) {
    criteria.participantsIds = filterBy.userId
    logger.debug('Added user filter criteria:', JSON.stringify(criteria))
  }

  if (filterBy.txt) {
    criteria.name = { $regex: filterBy.txt, $options: 'i' }
    logger.debug('Added text search criteria:', JSON.stringify(criteria))
  }

  if (filterBy.isDirectMessages !== undefined) {
    criteria.isDirectMessages = filterBy.isDirectMessages
    logger.debug('Added direct messages filter:', JSON.stringify(criteria))
  }

  logger.debug('Final criteria:', JSON.stringify(criteria))
  return criteria
}

export { remove, query, getById, add, update }
