import logger from '../services/logger.service.js'
import * as authService from '../api/auth/auth.service.js'

async function requireAuth(req, res, next) {
  logger.debug('Checking authentication')
  logger.debug('Cookies:', req.cookies)
  
  if (!req?.cookies?.loginToken) {
    logger.debug('No login token found')
    return res.status(401).send('Not Authenticated')
  }
  
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  logger.debug('Validated user:', loggedinUser)
  
  if (!loggedinUser) {
    logger.debug('Invalid login token')
    return res.status(401).send('Not Authenticated')
  }
  
  // Set the loggedinUser on the request object
  req.loggedinUser = loggedinUser
  next()
}

async function requireAdmin(req, res, next) {
  logger.debug('Checking admin rights')
  
  if (!req?.cookies?.loginToken) {
    logger.debug('No login token found')
    return res.status(401).send('Not Authenticated')
  }
  
  const loggedinUser = authService.validateToken(req.cookies.loginToken)
  if (!loggedinUser.isAdmin) {
    logger.warn(loggedinUser.fullname + ' attempted to perform admin action')
    res.status(403).end('Not Authorized')
    return
  }
  
  req.loggedinUser = loggedinUser
  next()
}

export { 
  requireAuth,
  requireAdmin 
}
