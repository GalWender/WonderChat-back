import fs from 'fs'
import asyncLocalStorage from './als.service.js'

const logsDir = './logs'
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir)
}

//define the time format
function getTime() {
    let now = new Date()
    return now.toLocaleString('he')
}

function isError(e) {
    return e && e.stack && e.message
}

function doLog(level, ...args) {
    try {
        const strs = args.map(arg =>
            (typeof arg === 'string' || isError(arg)) ? arg : JSON.stringify(arg)
        )

        var line = strs.join(' | ')
        let store
        try {
            store = asyncLocalStorage.getStore()
        } catch (err) {
            store = null
        }
        const userId = store?.loggedinUser?._id
        const str = userId ? `(userId: ${userId})` : ''
        line = `${getTime()} - ${level} - ${line} ${str}\n`
        fs.appendFile('./logs/backend.log', line, (err) => {
            if (err) console.log('FATAL ERROR WRITING TO LOGGER FILE')
        })
    } catch (err) {
        console.log('LOGGER ERROR:', err)
    }
}

function debug(...args) {
    if (process.env.NODE_ENV === 'production') return
    doLog('DEBUG', ...args)
}

function info(...args) {
    doLog('INFO', ...args)
}

function warn(...args) {
    doLog('WARN', ...args)
}

function error(...args) {
    doLog('ERROR', ...args)
}

export default {
    debug,
    info,
    warn,
    error
}