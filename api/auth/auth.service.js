import fs from 'fs'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import Cryptr from 'cryptr'
import * as userService from '../user/user.service.js'
import * as channelService from '../channel/channel.service.js'
import logger from '../../services/logger.service.js'

let cryptr

function getCryptr() {
  if (!cryptr) {
    if (!process.env.CRYPTR_SECRET) {
      throw new Error('CRYPTR_SECRET environment variable is required')
    }
    cryptr = new Cryptr(process.env.CRYPTR_SECRET)
  }
  return cryptr
}

async function verifyUsername(username) {
  logger.debug(`auth.service - verify username: ${username}`)
  const user = await userService.getByUsername(username)
  return !!user
}

async function login(email, password) {
  logger.debug(`auth.service - login with email: ${email}`)

  const user = await userService.getByEmail(email)
  if (!user) return Promise.reject('Invalid email or password')

  const match = await bcrypt.compare(password, user.password)
  if (!match) return Promise.reject('Invalid email or password')

  delete user.password
  if (typeof user._id === 'object') {
    user._id = user._id.toString()
  }

  logger.debug('User after login:', JSON.stringify(user))
  return user
}

async function signup(username, password, name, email, birthday) {
  const saltRounds = 12
  const ID = new ObjectId()

  try {
    logger.debug(`auth.service - signup with email: ${email}, name: ${name}`)
    if (!username || !password || !name || !email || !birthday) {
      return Promise.reject('name, username, email, birthday and password are required!')
    }

    // Check for existing users
    const userExist = await userService.getByUsername(username)
    if (userExist) return Promise.reject('Username already taken')

    const emailExist = await userService.getByEmail(email)
    if (emailExist) return Promise.reject('Email already taken')

    // Create user
    const hash = await bcrypt.hash(password, saltRounds)
    const signedUser = await userService.add({
      _id: ID,
      username,
      password: hash,
      name,
      email,
      birthday,
    })

    // Create initial channels
    await channelService.add({
      logoSrc: '',
      participantsIds: [ID.toString()],
      name: 'Direct Messages',
      isDirectMessages: true,
    })

    logger.debug('Created user and initial channels for:', username)
    return signedUser
  } catch (err) {
    logger.error('Failed during signup:', err)
    throw err
  }
}

function getLoginToken(user) {
  return getCryptr().encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
  try {
    logger.debug('Validating token')
    const json = getCryptr().decrypt(loginToken)
    const loggedinUser = JSON.parse(json)
    logger.debug('Token contains user:', JSON.stringify(loggedinUser))
    return loggedinUser
  } catch (err) {
    logger.error('Invalid login token:', err)
  }
  return null
}

export { verifyUsername, login, signup, getLoginToken, validateToken }
