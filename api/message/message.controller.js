const messageService = require('./message.service')
const logger = require('../../services/logger.service')

//?- GET LIST
async function getMessages(req, res) {
    try {
        logger.debug('Getting Messages')
        const filterBy = (req.query) ? req.query : null
        const messages = await messageService.query(filterBy)
        res.json(messages)
    } catch (error) {
        logger.error('Failed to get Messages', error)
        res.status(500).send({ err: 'Failed to get Messages' })
    }
}

//?- GET BY ID
async function getMessage(req, res) {
    try {
        logger.debug('Getting Message')
        const { messageId } = req.params
        const message = await messageService.getById(messageId)
        res.json(message)
    } catch (error) {
        logger.error('Failed to get Message', error)
        res.status(500).send({ err: 'Failed to get Message' })
    }
}

//?- CREATE
async function addMessage(req, res) {
    try {
        logger.debug('Adding Message')
        const message = req.body
        const addedMessage = await messageService.add(message)
        res.json(addedMessage)
    } catch (error) {
        logger.error('Failed to add Message', error)
        res.status(500).send({ err: 'Failed to add Message' })
    }
}

//?- UPDATE
async function updateMessage(req, res) {
    try {
        logger.debug('Updating message')
        const message = req.body
        const updatedMessage = await messageService.update(message)
        res.json(updatedMessage)
    } catch (error) {
        logger.error('Failed to update Message', error)
        res.status(500).send({ err: 'Failed to update Message' })
    }
}

//?- DELETE
async function removeMessage(req, res) {
    try {
        logger.debug('Removing Message')
        const { messageId } = req.params
        const removedMessage = await messageService.remove(messageId)
        res.json(removedMessage)
    } catch (error) {
        logger.error('Failed to remove Message', error)
        res.status(500).send({ err: 'Failed to remove Message' })
    }
}

module.exports = {
    getMessages,
    getMessage,
    addMessage,
    updateMessage,
    removeMessage
}  