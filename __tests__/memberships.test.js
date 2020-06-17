require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const Membership = require('../lib/models/Membership');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');

const request = require('supertest');
const app = require('../lib/app');

describe('Membership routes', () => {
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
      imageUrl: 'somestring'
    });
  });

  let user;
  beforeEach(async() => {
    user = await User.create({
      name: 'Bob',
      password: 'password',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
  });

  const agent = request.agent(app);
  
  beforeEach(() => {
    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'not@realmail.com',
        password: 'password',
      });
  });
  
  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a membership via POST', () => {
    return agent
      .post('/api/v1/memberships')
      .send({
        organization: organization._id,
        user: user._id
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
        });
      });
  });

  it('gets all users for an organization\'s ID via GET', () => {
    
    return  Membership.create([
      {
        organization: organization._id,
        user: user._id
      },      
      {
        organization: organization._id,
        user: user._id
      },
    ])
      .then (() => agent
        .get(`/api/v1/memberships?organization=${organization.id}`))
    
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([
          { _id: expect.anything(),
            organization: 
            { _id: expect.anything(),
              imageUrl: 'somestring',
              title: 'Brunch Club' },
            user: { _id: expect.anything(),
              imageUrl: 'somestring',
              name: 'Bob' }
          }, 
          { _id: expect.anything(),
            organization: 
            { _id: expect.anything(),
              imageUrl: 'somestring',
              title: 'Brunch Club' },
            user: { _id: expect.anything(),
              imageUrl: 'somestring',
              name: 'Bob' } }]
        ));
      });
  });

  it('gets all organizations for an user\'s ID via GET', () => {
    return Membership.create([
      {
        organization: organization._id,
        user: user._id
      },      
      {
        organization: organization._id,
        user: user._id
      },
    ])
      .then(() => agent
        .get(`/api/v1/memberships?user=${user.id}`))
    
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([
          { _id: expect.anything(),
            organization: 
            { _id: expect.anything(),
              imageUrl: 'somestring',
              title: 'Brunch Club' },
            user: { _id: expect.anything(),
              imageUrl: 'somestring',
              name: 'Bob' }
          }, 
          { _id: expect.anything(),
            organization: 
            { _id: expect.anything(),
              imageUrl: 'somestring',
              title: 'Brunch Club' },
            user: { _id: expect.anything(),
              imageUrl: 'somestring',
              name: 'Bob' } }]
        ));
      });
  });

  it('deletes a membership by ID and all votes via DELETE', async() => {
    const membership = await Membership.create({
      organization: organization._id,
      user: user._id
    });
    const poll = await Poll({
      organization: organization._id,
      title: 'Monday Mania',
      description: 'Mania on Monday',
      list: 'option4'
    });
    const vote = await Vote.create([
      {
        poll: poll._id,
        user: user.id,
        option: 'astring'
      },
      {
        poll: poll._id,
        user: user.id,
        option: 'anewstring'
      }
    ]);
    return request(app)
      .delete(`/api/v1/memberships/${membership.id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
        });
        return Vote.find({ membership : membership.id });
      })
      .then(vote => {
        expect(vote).toEqual([]);
      });
  });
});
