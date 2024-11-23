import { Server } from 'socket.io'
import logger from './logger.service.js'
import * as messageService from '../api/message/message.service.js'

class SocketService {
  constructor() {
    this.io = null
  }

  setupSocketAPI(http) {
    if (this.io) return

    this.io = new Server(http, {
      cors: {
        origin: '*',
      },
    })

    this.io.on('connection', (socket) => {
      logger.info(`New connected socket [id: ${socket.id}]`)

      socket.on('disconnect', () => {
        if (socket.messageChannel) {
          socket.leave(socket.messageChannel)
          logger.info(`Socket left channel ${socket.messageChannel} due to disconnect [id: ${socket.id}]`)
        }
        if (socket.userId) {
          logger.info(`Socket disconnected with userId: ${socket.userId} [id: ${socket.id}]`)
        }
        logger.info(`Socket disconnected [id: ${socket.id}]`)
      })

      socket.on('message-set-channel', (channel) => {
        if (socket.messageChannel === channel) return
        if (socket.messageChannel) {
          socket.leave(socket.messageChannel)
          logger.info(`Socket is leaving channel ${socket.messageChannel} [id: ${socket.id}]`)
        }
        socket.join(channel)
        socket.messageChannel = channel
        logger.debug(`Socket is joining channel ${socket.messageChannel} [id: ${socket.id}]`)
      })

      socket.on('message-send', async (message) => {
        try {
          const savedMessage = await messageService.add(message)
          this.broadcast({
            type: 'message-add',
            data: savedMessage,
            room: socket.messageChannel,
          })
        } catch (err) {
          logger.error('Failed to save message', err)
          socket.emit('message-error', { error: 'Failed to save message' })
        }
      })

      socket.on('message-update', async ({ messageId, update }) => {
        try {
          const updatedMessage = await messageService.update({ _id: messageId, ...update })
          this.broadcast({
            type: 'message-update',
            data: updatedMessage,
            room: socket.messageChannel,
          })
        } catch (err) {
          logger.error('Failed to update message', err)
          socket.emit('message-error', { error: 'Failed to update message' })
        }
      })

      socket.on('message-delete', async (messageId) => {
        try {
          await messageService.remove(messageId)
          this.broadcast({
            type: 'message-remove',
            data: messageId,
            room: socket.messageChannel,
          })
        } catch (err) {
          logger.error('Failed to delete message', err)
          socket.emit('message-error', { error: 'Failed to delete message' })
        }
      })

      socket.on('set-user-socket', (userId) => {
        logger.info(`Setting socket.userId = ${userId} for socket [id: ${socket.id}]`)
        socket.userId = userId
      })

      socket.on('unset-user-socket', () => {
        logger.info(`Removing socket.userId for socket [id: ${socket.id}]`)
        delete socket.userId
      })
    })
  }

  emitTo({ type, data, label }) {
    if (!this.io) return
    if (label) this.io.to(label).emit(type, data)
    else this.io.emit(type, data)
  }

  emitToUser({ type, data, userId }) {
    if (!this.io) return
    const socket = this._getUserSocket(userId)
    if (socket) {
      logger.info(`Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`)
      socket.emit(type, data)
    } else {
      logger.info(`No active socket for user: ${userId}`)
    }
  }

  broadcast({ type, data, room = null, userId }) {
    if (!this.io) return

    logger.info(`Broadcasting event: ${type}${userId ? ` excluding user: ${userId}` : ''}`)

    if (room) {
      // Broadcast to room, excluding sender if userId provided
      if (userId) {
        this.io.to(room).except(this._getUserSocketId(userId)).emit(type, data)
      } else {
        this.io.to(room).emit(type, data)
      }
    } else {
      // Broadcast to all, excluding sender if userId provided
      if (userId) {
        this.io.except(this._getUserSocketId(userId)).emit(type, data)
      } else {
        this.io.emit(type, data)
      }
    }
  }

  _getUserSocket(userId) {
    if (!this.io) return null
    const sockets = this._getAllSockets()
    return sockets.find((s) => s.userId === userId)
  }

  _getUserSocketId(userId) {
    const socket = this._getUserSocket(userId)
    return socket ? socket.id : null
  }

  _getAllSockets() {
    if (!this.io) return []
    const sockets = Array.from(this.io.sockets.sockets.values())
    return sockets
  }

  _printSockets() {
    const sockets = this._getAllSockets()
    console.log(`Sockets (${sockets.length}):`)
    sockets.forEach(this._printSocket)
  }

  _printSocket(socket) {
    console.log(`Socket - id: ${socket.id}, userId: ${socket.userId}`)
  }
}

const socketService = new SocketService()
export default socketService
