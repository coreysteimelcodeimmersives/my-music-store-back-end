require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const cookieParser = require('cookie-parser');
const UserModel = require('../src/models/UserModel');
const jwt = require('jsonwebtoken');

const port = process.env.PORT;

const app = express();

mongoose
  .connect(process.env.MONGO_DB_CONNECTION_STRING)
  .then(() => {
    console.log('Connected to mongo db successfully');
  })
  .catch(() => {
    console.log('error connecting to mongo db, what?');
  });

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);
app.use(cookieParser());

app.use(bodyParser.json());

// Authorization Middleware
app.use(async (req, res, next) => {
  try {
    const { session_token: sessionToken } = req.cookies;
    if (!sessionToken) {
      return next();
    }

    //this returns the data in the JWT or it throws if the jwt is not valid
    const { userId, iat } = jwt.verify(
      sessionToken,
      process.env.AUTH_SECRET_KEY
    );

    // if token too old we reject it
    if (iat < Date.now() - 30 * 24 * 60 * 60 * 1000) {
      return res.status(401).send('Session expired');
    }

    const foundUser = await UserModel.findOne({ _id: userId });

    if (!foundUser) {
      return next();
    }

    // after we find user in the token we add it to the request
    req.user = foundUser;

    return next();
  } catch (error) {
    next(error);
  }
});

app.use(userRouter);

app.use(productRouter);

// const errorHandler = (error, req, res, next) => {
//   console.log('Error: ', error);
//   res.status(500).send('There was an error, please try again.');
// };
// app.use(errorHandler);

app.listen(port, () =>
  console.log('Music Store server is listening for request')
);
