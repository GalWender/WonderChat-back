const chatService = require('./chat.service')
const logger = require('../../services/logger.service')

//?- GET LIST
async function getChats(req, res) {
    try {
        logger.debug('Getting Chats')
        const filterBy = (req.query) ? req.query : null
        const chats = await chatService.query(filterBy)
        res.json(chats)
    } catch (error) {
        logger.error('Failed to get Chats', error)
        res.status(500).send({ err: 'Failed to get Chats' })
    }
}

//?- GET BY ID
async function getChat(req, res) {
    try {
        logger.debug('Getting Chat')
        const { chatId } = req.params
        const chat = await chatService.getById(chatId)
        res.json(chat)
    } catch (error) {
        logger.error('Failed to get Chat', error)
        res.status(500).send({ err: 'Failed to get Chat' })
    }
}

//?- CREATE
async function addChat(req, res) {
    try {
        logger.debug('Adding Chat')
        const chat = req.body
        const addedChat = await chatService.add(chat)
        res.json(addedChat)
    } catch (error) {
        logger.error('Failed to add Chat', error)
        res.status(500).send({ err: 'Failed to add Chat' })
    }
}

//?- UPDATE
async function updateChat(req, res) {
    try {
        logger.debug('Updating chat')
        const chat = req.body
        const updatedChat = await chatService.update(chat)
        res.json(updatedChat)
    } catch (error) {
        logger.error('Failed to update Chat', error)
        res.status(500).send({ err: 'Failed to update Chat' })
    }
}

//?- DELETE
async function removeChat(req, res) {
    try {
        logger.debug('Removing Chat')
        const { chatId } = req.params
        const removedChat = await chatService.remove(chatId)
        res.json(removedChat)
    } catch (error) {
        logger.error('Failed to remove Chat', error)
        res.status(500).send({ err: 'Failed to remove Chat' })
    }
}

module.exports = {
    getChats,
    getChat,
    addChat,
    updateChat,
    removeChat
}  