import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getChats, getChat, addChat, updateChat, removeChat } from './chat.controller.js'

const router = express.Router()

// All chat routes require authentication
router.get('/', requireAuth, log, getChats)
router.get('/:chatId', requireAuth, log, getChat)
router.post('/', requireAuth, log, addChat)
router.put('/:chatId', requireAuth, log, updateChat)
router.delete('/:chatId', requireAuth, log, removeChat)

export default router