import * as authService from './auth.service.js'
import logger from '../../services/logger.service.js'

async function verifyUsername(req, res) {
  const { username } = req.query
  try {
    const isVerified = await authService.verifyUsername(username)
    res.send(isVerified)
  } catch (err) {
    logger.error(`User was not verify ${username}` + err)
    res.status(401).send({ err: 'Failed to verify' })
  }
}

async function login(req, res) {
  const { email, password } = req.body
  try {
    logger.debug('Login attempt:', email)
    const user = await authService.login(email, password)
    const loginToken = authService.getLoginToken(user)

    logger.debug('Generated login token')
    logger.info('User login:', JSON.stringify(user))

    // Set cookie with proper options
    res.cookie('loginToken', loginToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    })

    res.json(user)
  } catch (err) {
    logger.error('Failed to Login:', err)
    res.status(401).send({ err: 'Failed to Login' })
  }
}

async function signup(req, res) {
  try {
    const { username, password, name, email, birthday } = req.body
    logger.debug('Signup attempt:', { username, name, email })

    const account = await authService.signup(username, password, name, email, birthday)
    logger.debug('New account created:', JSON.stringify(account))

    const user = await authService.login(email, password)
    const loginToken = authService.getLoginToken(user)

    // Set cookie with proper options
    res.cookie('loginToken', loginToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    })

    logger.info('User signup and login:', JSON.stringify(user))
    res.json(user)
  } catch (err) {
    logger.error('Failed to signup:', err)
    res.status(500).send({ err: 'Failed to signup' })
  }
}

async function logout(req, res) {
  try {
    res.clearCookie('loginToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: process.env.NODE_ENV === 'production',
    })
    res.send({ msg: 'Logged out successfully' })
  } catch (err) {
    res.status(500).send({ err: 'Failed to logout' })
  }
}

export { verifyUsername, login, signup, logout }
