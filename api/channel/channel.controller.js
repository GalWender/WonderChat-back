const channelService = require('./channel.service')
const logger = require('../../services/logger.service')

//?- GET LIST
async function getChannels(req, res) {
    try {
        logger.debug('Getting Channels')
        const filterBy = (req.query) ? req.query : null
        const channels = await channelService.query(filterBy)
        res.json(channels)
    } catch (error) {
        logger.error('Failed to get Channels', error)
        res.status(500).send({ err: 'Failed to get Channels' })
    }
}

//?- GET BY ID
async function getChannel(req, res) {
    try {
        console.log(req.params);
        logger.debug('Getting Channel')
        const { channelId } = req.params
        const channel = await channelService.getById(channelId)
        res.json(channel)
    } catch (error) {
        logger.error('Failed to get Channel', error)
        res.status(500).send({ err: 'Failed to get Channel' })
    }
}

//?- CREATE
async function addChannel(req, res) {
    try {
        logger.debug('Adding Channel')
        const channel = req.body
        const addedChannel = await channelService.add(channel)
        res.json(addedChannel)
    } catch (error) {
        logger.error('Failed to add Channel', error)
        res.status(500).send({ err: 'Failed to add Channel' })
    }
}

//?- UPDATE
async function updateChannel(req, res) {
    try {
        logger.debug('Updating channel')
        const channel = req.body
        const updatedChannel = await channelService.update(channel)
        res.json(updatedChannel)
    } catch (error) {
        logger.error('Failed to update Channel', error)
        res.status(500).send({ err: 'Failed to update Channel' })
    }
}

//?- DELETE
async function removeChannel(req, res) {
    try {
        logger.debug('Removing Channel')
        const { channelId } = req.params
        const removedChannel = await channelService.remove(channelId)
        res.json(removedChannel)
    } catch (error) {
        logger.error('Failed to remove Channel', error)
        res.status(500).send({ err: 'Failed to remove Channel' })
    }
}

module.exports = {
    getChannels,
    getChannel,
    addChannel,
    updateChannel,
    removeChannel
}  