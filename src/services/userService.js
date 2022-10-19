const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { verifyUserLoggedIn } = require('./permissionService');
const PermissionService = require('./permissionService');

const cleanUser = (userDocument) => {
  return {
    id: userDocument._id,
    firstName: userDocument.firstName,
    lastName: userDocument.lastName,
    email: userDocument.email,
    profilePicture: userDocument.profilePicture,
    isAdmin: userDocument.isAdmin,
    favorites: userDocument.favorites,
  };
};

const getToken = (userId) => {
  return jwt.sign({ userId, iat: Date.now() }, process.env.AUTH_SECRET_KEY);
};

const signOut = (req, res, next) => {
  res.clearCookie('session_token');
  res.send('Signed out successfully');
};

const testAuth = async (req, res, next) => {
  //check if user is logged in ... they should have valid JWT

  try {
    verifyUserLoggedIn(req, res);
    res.send({ userFirstName: req.user.firstName });
  } catch (error) {
    next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
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

    await userDocument.save();

    const token = getToken(userDocument._id);
    res.cookie('session_token', token, { httpOnly: true, secure: false });

    res.send({
      user: cleanUser(userDocument),
    });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    //Get user credentials from request
    const { email, password } = req.body.credentials;

    // Check if the user exists in DB
    const foundUser = await UserModel.findOne({ email });

    //if user exists in DB verify password matches
    if (!foundUser) {
      return res.status(401).send('User not found or incorrect credentials');
    }

    // the user can be successfully authenticated
    const passwordMatch = await bcrypt.compare(
      password,
      foundUser.hashedPassword
    );

    if (!passwordMatch) {
      return res.status(401).send('User not found or incorrect credentials');
    }

    //The user can be successfully authenticated
    // Send user data back to client
    const token = getToken(foundUser._id);
    res.cookie('session_token', token, { httpOnly: true, secure: false });

    res.send({
      user: cleanUser(foundUser),
    });
  } catch (error) {
    next(error);
  }
};

const updateFavorites = async (req, res, next) => {
  try {
    PermissionService.verifyUserLoggedIn(req, res);
    const { productId } = req.body;
    if (req.user.favorites.includes(productId)) {
      req.user.favorites.pull(productId);
      await req.user.save();
      return res.send({ user: cleanUser(req.user) });
    }
    req.user.favorites.push(productId);
    await req.user.save();
    res.send({ user: cleanUser(req.user) });
  } catch (error) {
    next(error);
  }
};

const UserService = {
  signIn,
  signOut,
  registerUser,
  testAuth,
  updateFavorites,
};
module.exports = UserService;
