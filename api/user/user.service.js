import * as dbService from '../../services/db.service.js'
import logger from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export { query, getById, getByUsername, getByEmail, remove, update, add }

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  try {
    const collection = await dbService.getCollection('user')
    var users = await collection.find(criteria).toArray()
    users = users.map((user) => {
      delete user.password
      return user
    })
    return users
  } catch (err) {
    logger.error('cannot find users', err)
    throw err
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    delete user.password
    return user
  } catch (err) {
    logger.error(`while finding user by id: ${userId}`, err)
    throw err
  }
}

async function getByUsername(username) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ username })
    return user
  } catch (err) {
    logger.error(`while finding user by username: ${username}`, err)
    throw err
  }
}

async function getByEmail(email) {
  try {
    const collection = await dbService.getCollection('user')
    const user = await collection.findOne({ email })
    return user
  } catch (err) {
    logger.error(`while finding user by email: ${email}`, err)
    throw err
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection('user')
    await collection.deleteOne({ _id: new ObjectId(userId) })
  } catch (err) {
    logger.error(`cannot remove user ${userId}`, err)
    throw err
  }
}

async function update(user) {
  try {
    // peek only updatable properties
    const userToSave = {
      _id: new ObjectId(user._id), // needed for the returnd obj
      username: user.username,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      imgUrl: user.imgUrl,
    }
    const collection = await dbService.getCollection('user')
    await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
    return userToSave
  } catch (err) {
    logger.error(`cannot update user ${user._id}`, err)
    throw err
  }
}

async function add(user) {
  try {
    console.log('Adding user:', user)

    // peek only updatable fields!
    const userToAdd = {
      _id: user._id,
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
      birthday: user.birthday,
      imgUrl: user.imgUrl || '',
    }
    const collection = await dbService.getCollection('user')
    const result = await collection.insertOne(userToAdd)
    userToAdd._id = result.insertedId
    delete userToAdd.password
    return userToAdd
  } catch (err) {
    logger.error('cannot add user', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        name: txtCriteria,
      },
    ]
  }
  return criteria
}
