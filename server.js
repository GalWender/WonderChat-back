import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createServer } from 'http'
import * as awsService from './services/aws.service.js'

// Verify environment variables are loaded
// console.log('Environment check:', {
//   NODE_ENV: process.env.NODE_ENV,
//   CRYPTR_SECRET: process.env.CRYPTR_SECRET,
//   DB_URL: process.env.DB_URL,
//   REGION: process.env.REGION,
//   ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
//   SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
//   BUCKET_NAME: process.env.BUCKET_NAME,
// })

// awsService.downloadFile('IMG_20210408_154159.jpg')

import authRoutes from './api/auth/auth.routes.js'
import userRoutes from './api/user/user.routes.js'
import channelRoutes from './api/channel/channel.routes.js'
import chatRoutes from './api/chat/chat.routes.js'
import messageRoutes from './api/message/message.routes.js'

import socketService from './services/socket.service.js'
import setupAsyncLocalStorage from './middlewares/setupAls.middleware.js'
import logger from './services/logger.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const http = createServer(app)

//?- Express App Config
app.use(cookieParser())
app.use(express.json())
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'public')))
} else {
  const corsOptions = {
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true,
  }
  app.use(cors(corsOptions))
}

//?- Routes
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/channel', channelRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
socketService.setupSocketAPI(http)

app.get('/**', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const port = process.env.PORT
http.listen(port, () => {
  logger.info('Server is running on port: ' + port)
})
