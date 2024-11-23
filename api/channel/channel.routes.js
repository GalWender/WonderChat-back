import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getChannels, getChannel, addChannel, updateChannel, removeChannel } from './channel.controller.js'

const router = express.Router()

// All channel routes require authentication
router.get('/', requireAuth, log, getChannels)
router.get('/:channelId', requireAuth, log, getChannel)
router.post('/', requireAuth, log, addChannel)
router.put('/:channelId', requireAuth, log, updateChannel)
router.delete('/:channelId', requireAuth, log, removeChannel)

export default router