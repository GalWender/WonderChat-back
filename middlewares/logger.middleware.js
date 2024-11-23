import logger from '../services/logger.service.js';

async function log(req, res, next) {
  logger.info('Req was made');
  next();
}

export {
  log
};
