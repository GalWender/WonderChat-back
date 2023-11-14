const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { getChannels, getChannel, addChannel, updateChannel, removeChannel } = require('./channel.controller')
const router = express.Router()

router.get('/', log, getChannels)
router.get('/:channelId', log, getChannel)
router.post('/', addChannel)
router.put('/:channelId', updateChannel)
router.delete('/:channelId', removeChannel)

module.exports = router