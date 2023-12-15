const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getChats, getChat, addChat, updateChat, removeChat } = require('./chat.controller')
const router = express.Router()

router.get('/', log, getChats)
router.get('/:chatId', log, getChat)
router.post('/', addChat)
router.put('/:chatId', updateChat)
router.delete('/:chatId', removeChat)

module.exports = router