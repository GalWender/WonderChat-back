import express from 'express';
import { login, signup, logout, verifyUsername } from './auth.controller.js';

const router = express.Router();

router.get('/verifyUsername', verifyUsername);
router.post('/login', login);
router.post('/signup', signup);
router.post('/logout', logout);

export default router;