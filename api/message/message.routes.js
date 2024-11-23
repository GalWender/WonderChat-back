import express from 'express'
import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'
import { getMessages, getMessage, addMessage, updateMessage, removeMessage } from './message.controller.js'

const router = express.Router()

router.get('/', log, getMessages)
router.get('/:messageId', log, getMessage)
router.post('/', addMessage)
router.put('/:messageId', updateMessage)
router.delete('/:messageId', removeMessage)

export default router
