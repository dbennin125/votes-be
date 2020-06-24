require('dotenv').config();
require('./lib/utils/connect')();

const moongoose = require('mongoose');
const seed = require('./data-helpers/seed.js/seed');

seed()
  .then(() => console.log('Done'))
  .finally(() => moongoose.connection.close());
