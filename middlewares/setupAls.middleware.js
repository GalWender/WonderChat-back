import * as authService from '../api/auth/auth.service.js';
import asyncLocalStorage from '../services/als.service.js';

async function setupAsyncLocalStorage(req, res, next) {
  const storage = {};
  asyncLocalStorage.run(storage, () => {
    const {logginToken} = req.cookies;
    if (!logginToken) return next();
    const loggedinUser = authService.validateToken(req.cookies.loginToken);

    if (loggedinUser) {
      const alsStore = asyncLocalStorage.getStore();
      alsStore.loggedinUser = loggedinUser;
    }
    next();
  });
}

export default setupAsyncLocalStorage;
