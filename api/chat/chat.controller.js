import * as chatService from './chat.service.js'
import * as channelService from '../channel/channel.service.js'
import logger from '../../services/logger.service.js'

// ?- GET LIST
async function getChats(req, res) {
  try {
    logger.debug('Getting Chats')
    logger.debug('User ID from request:', req.loggedinUser?._id)

    const filterBy = {
      ...(req.query || {}),
      userId: req.loggedinUser?._id,
    }
    logger.debug('Filter criteria:', JSON.stringify(filterBy))

    const chats = await chatService.query(filterBy)
    logger.debug('Found chats:', chats.length)

    res.json(chats)
  } catch (error) {
    logger.error('Failed to get Chats', error)
    res.status(500).send({ err: 'Failed to get Chats' })
  }
}

// ?- GET BY ID
async function getChat(req, res) {
  try {
    logger.debug('Getting Chat')
    const { chatId } = req.params
    const chat = await chatService.getById(chatId)

    // Get the associated channel to check permissions
    const channel = await channelService.getById(chat.channelId)
    const userId = req.loggedinUser?._id

    // Check if user has access to this chat's channel
    if (!userId || !channel.participantsIds?.includes(userId)) {
      return res.status(403).send({ err: 'Not authorized to view this chat' })
    }

    res.json(chat)
  } catch (error) {
    logger.error('Failed to get Chat', error)
    res.status(500).send({ err: 'Failed to get Chat' })
  }
}

// ?- CREATE
async function addChat(req, res) {
  try {
    logger.debug('Adding Chat')
    const chat = req.body

    // Verify the channel exists and user has access
    const channel = await channelService.getById(chat.channelId)
    const userId = req.loggedinUser._id

    if (!channel.participantsIds?.includes(userId)) {
      return res.status(403).send({ err: 'Not authorized to create chat in this channel' })
    }

    const addedChat = await chatService.add(chat)
    res.json(addedChat)
  } catch (error) {
    logger.error('Failed to add Chat', error)
    res.status(500).send({ err: 'Failed to add Chat' })
  }
}

// ?- UPDATE
async function updateChat(req, res) {
  try {
    logger.debug('Updating Chat')
    const chat = req.body

    // Get existing chat and its channel
    const existingChat = await chatService.getById(chat._id)
    const channel = await channelService.getById(existingChat.channelId)
    const userId = req.loggedinUser._id

    if (!channel.participantsIds?.includes(userId)) {
      return res.status(403).send({ err: 'Not authorized to update this chat' })
    }

    const updatedChat = await chatService.update(chat)
    res.json(updatedChat)
  } catch (error) {
    logger.error('Failed to update Chat', error)
    res.status(500).send({ err: 'Failed to update Chat' })
  }
}

// ?- DELETE
async function removeChat(req, res) {
  try {
    logger.debug('Removing Chat')
    const { chatId } = req.params
    
    // Get chat and its channel
    const chat = await chatService.getById(chatId)
    const channel = await channelService.getById(chat.channelId)
    const userId = req.loggedinUser._id

    // Only channel creator can delete chats
    if (channel.participantsIds[0] !== userId) {
      return res.status(403).send({ err: 'Not authorized to delete this chat' })
    }

    await chatService.remove(chatId)
    res.send({ msg: 'Deleted successfully' })
  } catch (error) {
    logger.error('Failed to remove Chat', error)
    res.status(500).send({ err: 'Failed to remove Chat' })
  }
}

export { getChats, getChat, addChat, updateChat, removeChat }
