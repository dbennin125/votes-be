const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');
const Vote = require('../lib/models/Vote');

const request = require('supertest');
const app = require('../lib/app');

describe('vote routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let organization;
  beforeEach(async() => {
    organization = await Organization.create({
      title: 'Brunch Club',
      description: 'A club for brunch',
      imageUrl: 'somestring',
    });
  });
    
  let poll;
  beforeEach(async() => {
    poll = await Poll.create({
      organization: organization._id,
      title: 'Casual Friday',
      description: 'Jean and T-shirts',
      list: 'option1'
    });
  });
      
  let user;
  beforeEach(async() => {
    user = await User.create({
      name: 'Bob',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
  });
  
  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });
    
  it('creates a vote via POST', async() => {
    return request(app)
      .post('/api/v1/votes')
      .send({
        poll: poll._id,
        user: user.id,
        option: 'astring'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'astring',
        });
      });
  });
  
});
