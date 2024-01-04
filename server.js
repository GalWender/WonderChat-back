const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
const http = require('http').createServer(app)

//?- Express App Config
app.use(cookieParser())
app.use(express.json())
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'public')))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

//?- Routes
const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const channelRoutes = require('./api/channel/channel.routes.js')
const chatRoutes = require('./api/chat/chat.routes.js')
const messageRoutes = require('./api/message/message.routes.js')

const { setupSocketAPI } = require('./services/socket.service')
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/channel', channelRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
setupSocketAPI(http)


app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

const logger = require('./services/logger.service')
const port = process.env.PORT
http.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})