const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const User = require('../lib/models/User')

const request = require('supertest');
const app = require('../lib/app');

describe('User routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a user via POST', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Bob',
        phone: '15031112222',
        email: 'not@realmail.com',
        communicationMedium: ['phone'],
        imageUrl: 'somestring'
      })
      .then(res =>{
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Bob',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
          __v: 0
        });
      });
  });

  it('will not create a user because of bad data', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Bob',
        phone: '1112222',
        email: 'not@realmail.com',
        communicationMedium: ['smoke signals'],
        imageUrl: 'somestring'
      })
      .then(res =>{
        expect(res.body).toEqual({
          message: 'User validation failed: communicationMedium.0: `smoke signals` is not a valid enum value for path `communicationMedium.0`.',
          status: 400
        });
      });
  });

  it('updates a user via PATCH', () => {
    return User.create({ 
      name: 'Bob',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    })
      .then(user => {
        return request(app)
          .patch(`/api/v1/users/${user._id}`)
          .send({ name: 'Jim', phone: '5415551234' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Jim',
          phone: '5415551234',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
          __v: 0
        });
      });
  });

  it('deletes a user via DELETE route', () => {
    return User.create({ 
      name: 'Bob',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    })
      .then(user => {
        return request(app)
          .delete(`/api/v1/users/${user._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Bob',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
          __v: 0
        });
      });
  });
});
