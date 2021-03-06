require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('auth routes', () => {
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

  it('creates an authorized user via POST', () => {
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

  it('has an authToken method', () => {
    
    const user = new User({
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
    expect(user.authToken()).toEqual(expect.any(String));
  });

  it('can verify a token and return a user', () => {
    const user = new User({
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
    const token = user.authToken();
    const verifiedUser = User.verifyToken(token);

    expect(verifiedUser.toJSON()).toEqual(user.toJSON());
  }); 

  it('can verify a logged in user', async() => {
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
        password: 'password'
      })
      .then(() => {
        
        return agent
          .get('/api/v1/auth/verify');
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: 'Bob',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring'
        });
      });
  });

  it('can log a user in via POST', async() => {
    const user = await User.create({
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
    return request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'not@realmail.com',
        password: 'password'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: 'Bob',
          phone: '15031112222',
          email: 'not@realmail.com',
          communicationMedium: ['phone'],
          imageUrl: 'somestring'
        });
      });
  });

});

