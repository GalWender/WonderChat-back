const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const channelService = require('../channel/channel.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId;
const Cryptr = require('cryptr')

const cryptr = new Cryptr(process.env.CRYPTR_SECRET)


async function verifyUsername(username) {
    logger.debug(`auth.service - verify username: ${username}`)
    const user = await userService.getByUsername(username)
    return (!!user)
}

async function login(email, password) {
    logger.debug(`auth.service - login with email: ${email}`)

    const user = await userService.getByEmail(email)
    if (!user) return Promise.reject('Invalid email or password')
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid email or password')

    delete user.password
    user._id = user._id.toString()
    return user
}

async function signup(username, password, name, email, birthday) {
    const saltRounds = 12
    const ID = new ObjectId()
    logger.debug(`auth.service - signup with email: ${email}, name: ${name}`)
    if (!username || !password || !name || !email || !birthday) return Promise.reject('name, username, emial, birthday and password are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    const signedUser = userService.add({ _id: ID, username, password: hash, name, email, birthday })
    // channelService.add({ logoSrc: "", participantsIds: [ID.toString()], name: "Direct Messages", isDirectMessages: true })
    return signedUser
}

function getLoginToken(user) {
    return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
    try {
        const json = cryptr.decrypt(loginToken)
        const loggedinUser = JSON.parse(json)
        return loggedinUser
    } catch (err) {
        logger.debug('Invalid login token', err)
    }
    return null
}



module.exports = {
    verifyUsername,
    login,
    signup,
    getLoginToken,
    validateToken
}