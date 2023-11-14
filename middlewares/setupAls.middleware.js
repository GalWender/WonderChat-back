const authService = require('../api/auth/auth.service')
const asyncLocalStorage = require('../services/als.service')

async function setupAsyncLocalStorage(req, res, next) {
  const storage = {}
  asyncLocalStorage.run(storage, () => {
    const {logginToken} = req.cookies
    if (!logginToken) return next()
    const loggedinUser = authService.validateToken(req.cookies.loginToken)

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore()
      alsStore.loggedinUser = loggedinUser
    }
    next()
  })
}

module.exports = setupAsyncLocalStorage

