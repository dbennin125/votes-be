const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const Poll = require('../lib/models/Poll');
const Organization = require('../lib/models/Organization');

const request = require('supertest');
const app = require('../lib/app');

describe('Poll routes', () => {
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

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a poll via POST', async() => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: organization._id,
        title: 'Casual Friday',
        description: 'Jean and T-shirts',
        list: 'option1'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          title: 'Casual Friday',
          description: 'Jean and T-shirts',
          list: 'option1',
          __v: 0
        });
      });
  });

  it.only('gets all polls for an organization\'s ID via GET', async() => {
    await Poll.create([
      {
        organization: organization._id,
        title: 'Taco Tuesday',
        description: 'Tacos on Tuesday',
        list: 'option2'
      },      
      {
        organization: organization._id,
        title: 'Monday Mania',
        description: 'Mania on Monday',
        list: 'option1'
      },
    ]);
      
    return request(app)
      .get(`/api/v1/polls?organization=${organization.id}`)
    
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([
          {
            _id: expect.anything(),
            title: 'Taco Tuesday',
          },      {
            _id: expect.anything(),
            title: 'Monday Mania',
          },
        ]));
      });
  });
});
