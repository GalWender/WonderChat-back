const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')
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
    // TODO: un-comment for real login
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid email or password')

    delete user.password
    user._id = user._id.toString()
    return user
}

async function signup(username, password, name, email, birthday) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${email}, name: ${name}`)
    if (!username || !password || !name || !email || !birthday) return Promise.reject('name, username, emial, birthday and password are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, name, email, birthday })
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
        console.log('Invalid login token')
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