import * as messageService from './message.service.js'
import logger from '../../services/logger.service.js'

//?- GET LIST
async function getMessages(req, res) {
  try {
    logger.debug('Getting Messages')
    const filterBy = req.query ? req.query : null
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

// ?- CREATE
async function addMessage(req, res) {
  try {
    const message = req.body
    const addedMessage = await messageService.add(message)
    res.json(addedMessage)
  } catch (error) {
    logger.error('Failed to add Message', error)
    res.status(500).send({ err: 'Failed to add Message' })
  }
}

// ?- UPDATE
async function updateMessage(req, res) {
  try {
    const message = req.body
    const updatedMessage = await messageService.update(message)
    res.json(updatedMessage)
  } catch (error) {
    logger.error('Failed to update Message', error)
    res.status(500).send({ err: 'Failed to update Message' })
  }
}

// ?- DELETE
async function removeMessage(req, res) {
  try {
    const { messageId } = req.params
    await messageService.remove(messageId)
    res.send({ msg: 'Deleted successfully' })
  } catch (error) {
    logger.error('Failed to remove Message', error)
    res.status(500).send({ err: 'Failed to remove Message' })
  }
}

export { getMessages, getMessage, addMessage, updateMessage, removeMessage }
