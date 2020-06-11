const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');
const Membership = require('../lib/models/Membership');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');

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

  it('creates a membership via POST', () => {
    return request(app)
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

  it('gets all users for an organization\'s ID via GET', async() => {
    await Membership.create([
      {
        organization: organization._id,
        user: user._id
      },      
      {
        organization: organization._id,
        user: user._id
      },
    ]);
    return request(app)
      .get(`/api/v1/memberships?organization=${organization.id}`)
    
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([{"_id": expect.anything(), "organization": {"_id": expect.anything(), "imageUrl": "somestring", 
          "title": "Brunch Club"}, "user": {"_id": expect.anything(), "imageUrl": "somestring", "name": "Bob"}}, {"_id": expect.anything(), "organization": {"_id": expect.anything(), "imageUrl": "somestring", "title": "Brunch Club"}, "user": {"_id": expect.anything(), "imageUrl": "somestring", "name": "Bob"}}]));
      });
  });

  it('gets all organizations for an user\'s ID via GET', async() => {
    await Membership.create([
      {
        organization: organization._id,
        user: user._id
      },      
      {
        organization: organization._id,
        user: user._id
      },
    ]);
    return request(app)
      .get(`/api/v1/memberships?user=${user.id}`)
    
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([{"_id": expect.anything(), "organization": {"_id": expect.anything(), "imageUrl": "somestring", 
          "title": "Brunch Club"}, "user": {"_id": expect.anything(), "imageUrl": "somestring", "name": "Bob"}}, {"_id": expect.anything(), "organization": {"_id": expect.anything(), "imageUrl": "somestring", "title": "Brunch Club"}, "user": {"_id": expect.anything(), "imageUrl": "somestring", "name": "Bob"}}]));
      });
  });

  
});
