const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getMessages, getMessage, addMessage, updateMessage, removeMessage } = require('./message.controller')
const router = express.Router()

router.get('/', log, getMessages)
router.get('/:messageId', log, getMessage)
router.post('/', addMessage)
router.put('/:messageId', updateMessage)
router.delete('/:messageId', removeMessage)

module.exports = router