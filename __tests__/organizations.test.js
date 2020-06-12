const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const Organization = require('../lib/models/Organization');
const Vote = require('../lib/models/Vote');
const Poll = require('../lib/models/Poll');
const User = require('../lib/models/User');

const request = require('supertest');
const app = require('../lib/app');

describe('Organization routes', () => {
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

  it('creates an organization via POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: 'Brunch Club',
        description: 'A club for brunch',
        imageUrl: 'somestring'
      })
      .then(res =>{
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Brunch Club',
          description: 'A club for brunch',
          imageUrl: 'somestring',
        });
      });
  });

  it('will not create an organization due to bad data type', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: 'Brunch Club',
        descriptioan: 'A club for brunch',
        imageUrl: 'somestring'
      })
      .then(res =>{
        expect(res.body).toEqual({
          message: 'Organization validation failed: description: Path `description` is required.',
          status: 400,
        });
      });
  });

  it('updates an organization by ID via PATCH', () => {
    return Organization.create({ 
      title: 'Brunch Club',
      description: 'A club for brunch',
      imageUrl: 'somestring'
    })
      .then(organization => {
        return request(app)
          .patch(`/api/v1/organizations/${organization._id}`)
          .send({ title: 'New Club', });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'New Club',
          description: 'A club for brunch',
          imageUrl: 'somestring',
        });
      });
  });

  it('gets an organization by ID via GET', () => {
    return Organization.create({ 
      title: 'Brunch Club',
      description: 'A club for brunch',
      imageUrl: 'somestring'
    })
      .then(organization => {
        return request(app)
          .get(`/api/v1/organizations/${organization._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Brunch Club',
          memberships: [],
          description: 'A club for brunch',
          imageUrl: 'somestring',
        });
      });
  });

  it('deletes an organization by ID via DELETE', () => {
    return Organization.create({ 
      title: 'Delete Club',
      description: 'A club for deleting',
      imageUrl: 'somestring'
    })
      .then(organization => {
        return request(app)
          .delete(`/api/v1/organizations/${organization._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Delete Club',
          description: 'A club for deleting',
          imageUrl: 'somestring',
        });
      });
  });

  it ('gets all organizations with titles, imageURLs and IDs via GET', async() =>{
    await Organization.create([
      {
        title: 'Delete Club',
        description: 'A club for deleting',
        imageUrl: 'somestring'
      },
      {
        title: 'Cool Club',
        description: 'A club for being cool',
        imageUrl: 'morestring'
      }, 
      {
        title: 'Neat Club',
        description: 'A club for being neat',
        imageUrl: 'astring'
      }
    ])
      .then(() => request(app).get('/api/v1/organizations'))
      .then(res => {
        expect(res.body).toEqual([
          {
            _id: expect.anything(),
            title: 'Delete Club',
            imageUrl: 'somestring'
          }, 
          {
            _id: expect.anything(),
            title: 'Cool Club',
            imageUrl: 'morestring'
          },
          {
            _id: expect.anything(),
            title: 'Neat Club',
            imageUrl: 'astring'
          }
        ]);
      });
  });

  it('deletes an organization,polls, and votes by ID via DELETE', async() => {
    const organization = await Organization.create({ 
      title: 'Delete Club',
      description: 'A club for deleting',
      imageUrl: 'somestring'
    });

    const user = await User.create({
      name: 'Bob',
      phone: '15031112222',
      email: 'not@realmail.com',
      communicationMedium: ['phone'],
      imageUrl: 'somestring'
    });
    const poll = await Poll.create([
      {
        organization: organization._id,
        title: 'Monday Mania',
        description: 'Mania on Monday',
        list: 'option4'
      },      
      {
        organization: new mongoose.Types.ObjectId(),
        title: 'Monday Mania',
        description: 'Mania on Monday',
        list: 'option2'
      }
    ]);
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
      .delete(`/api/v1/organizations/${organization._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Delete Club',
          description: 'A club for deleting',
          imageUrl: 'somestring',
        });
        return Poll.find({ organization: organization.id }),
        Vote.find({ organization: vote.id });
      })
      .then(poll, vote => {
        expect(poll, vote).toEqual([]);
      });
  });

  it('gets an organization by ID and shows all members via GET', () => {

    return Organization.create({ 
      title: 'Brunch Club',
      description: 'A club for brunch',
      imageUrl: 'somestring'
    })
    
      .then(organization => {
        return request(app)
          .get(`/api/v1/organizations/${organization._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Brunch Club',
          memberships: [],
          description: 'A club for brunch',
          imageUrl: 'somestring',
        });
      });
  });
});
