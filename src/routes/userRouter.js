const express = require('express');
const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userRouter = express.Router();

userRouter.post('/register-user', async (req, res, next) => {
  // 1. need a way to uniquely identify users by email, name, phone, etc
  // 2. we get creds from front end and HASH (Bcrypt) and save user info in DB
  console.log('req.body: ', req.body);

  const { firstName, lastName, email, password, profilePicture } = req.body;

  // store password HASH not the actually password
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const userDocument = new UserModel({
    firstName,
    lastName,
    email,
    hashedPassword,
    profilePicture,
  });

  userDocument.save();

  res.send({
    user: {
      id: userDocument._id,
      firstName,
      lastName,
      email,
      profilePicture,
      isAdmin: userDocument.isAdmin,
    },
  });
});

module.exports = userRouter;
