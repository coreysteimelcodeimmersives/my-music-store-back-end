const express = require('express');
const userRouter = express.Router();
const {
  signIn,
  signOut,
  registerUser,
  testAuth,
  updateFavorites,
} = require('../services/userService');

userRouter.get('/sign-out', signOut);

userRouter.get('/test-auth', testAuth);

userRouter.post('/register-user', registerUser);

userRouter.post('/sign-in', signIn);

userRouter.post('/update-favorites', updateFavorites);

module.exports = userRouter;
