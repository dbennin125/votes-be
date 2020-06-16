require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const User = require('../lib/models/User');



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
        password: 'password',
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
        });
      });
  });

  it('will not create a user because of bad data', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Bob',
        password: 'password',
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
  
  it('updates a user by ID via PATCH route', async() => {
    const user = await User.create({ 
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
      
    const agent = request.agent(app);
    
    return agent
      .post('/api/v1/auth/login')
      .send({ 
        email: 'not@realmail.com',
        password: 'password',
      })
      .then(() => agent
        .patch(`/api/v1/users/${user._id}`)
        .send({ name: 'Jim' }))
 
      
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Jim',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
        });
      });
  });

  it('deletes a user by ID via DELETE route', async() => {
    const user = await User.create({ 
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
      
    const agent = request.agent(app);
    
    return agent
      .post('/api/v1/auth/login')
      .send({ 
        email: 'not@realmail.com',
        password: 'password',
      })
      .then(() => agent
        .delete(`/api/v1/users/${user._id}`))
 
      
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Bob',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
        });
      });
  });

  it('gets a user by ID, displays all organizations via GET route', async() => {
    
    const user = await User.create({ 
      name: 'Rob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({ 
        email: 'not@realmail.com',
        password: 'password',
      })
      .then(() => agent
        .get(`/api/v1/users/${user._id}`))

      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Rob',
          phone: '15031112222',
          organizations: [], 
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring',
        });
      });
  });
});
