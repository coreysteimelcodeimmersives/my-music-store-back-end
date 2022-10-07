require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/userRouter');

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

app.use(bodyParser.json());

app.use(userRouter);

app.listen(port, () =>
  console.log('Music Store server is listening for request')
);
