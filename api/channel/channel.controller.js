import * as channelService from './channel.service.js'
import logger from '../../services/logger.service.js'

// ?- GET LIST
async function getChannels(req, res) {
  try {
    logger.debug('Getting Channels')
    logger.debug('User ID from request:', req.loggedinUser?._id)

    const filterBy = {
      ...(req.query || {}),
      userId: req.loggedinUser?._id,
    }
    logger.debug('Filter criteria:', JSON.stringify(filterBy))

    const channels = await channelService.query(filterBy)
    logger.debug('Found channels:', channels.length)

    res.json(channels)
  } catch (error) {
    logger.error('Failed to get Channels', error)
    res.status(500).send({ err: 'Failed to get Channels' })
  }
}

// ?- GET BY ID
async function getChannel(req, res) {
  try {
    logger.debug('Getting Channel')
    const { channelId } = req.params
    const channel = await channelService.getById(channelId)

    // Check if user has access to this channel
    const userId = req.loggedinUser?._id
    if (!userId || !channel.participantsIds?.includes(userId)) {
      return res.status(403).send({ err: 'Not authorized to view this channel' })
    }

    res.json(channel)
  } catch (error) {
    logger.error('Failed to get Channel', error)
    res.status(500).send({ err: 'Failed to get Channel' })
  }
}

// ?- CREATE
async function addChannel(req, res) {
  try {
    const channel = req.body
    const userId = req.loggedinUser._id
    
    // Ensure creator is in participants
    channel.participantsIds = channel.participantsIds || []
    if (!channel.participantsIds.includes(userId)) {
      channel.participantsIds.push(userId)
    }

    const addedChannel = await channelService.add(channel)
    res.json(addedChannel)
  } catch (error) {
    logger.error('Failed to add Channel', error)
    res.status(500).send({ err: 'Failed to add Channel' })
  }
}

// ?- UPDATE
async function updateChannel(req, res) {
  try {
    const channel = req.body
    const existingChannel = await channelService.getById(channel._id)

    // Check if user has permission to update
    const userId = req.loggedinUser._id
    if (!existingChannel.participantsIds?.includes(userId)) {
      return res.status(403).send({ err: 'Not authorized to update this channel' })
    }

    // Ensure we don't remove the creator from participants
    if (!channel.participantsIds?.includes(existingChannel.participantsIds[0])) {
      channel.participantsIds = [existingChannel.participantsIds[0], ...(channel.participantsIds || [])]
    }

    const updatedChannel = await channelService.update(channel)
    res.json(updatedChannel)
  } catch (error) {
    logger.error('Failed to update Channel', error)
    res.status(500).send({ err: 'Failed to update Channel' })
  }
}

// ?- DELETE
async function removeChannel(req, res) {
  try {
    const { channelId } = req.params
    const channel = await channelService.getById(channelId)

    // Check if user has permission to delete (must be creator - first participant)
    if (channel.participantsIds[0] !== req.loggedinUser._id) {
      return res.status(403).send({ err: 'Not authorized to delete this channel' })
    }

    await channelService.remove(channelId)
    res.send({ msg: 'Deleted successfully' })
  } catch (error) {
    logger.error('Failed to remove Channel', error)
    res.status(500).send({ err: 'Failed to remove Channel' })
  }
}

export { getChannels, getChannel, addChannel, updateChannel, removeChannel }
