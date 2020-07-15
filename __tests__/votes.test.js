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
      password: 'password',
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
  
  it('gets all votes by a poll via GET', async() => {
    return Vote.create({
      poll: poll._id,
      user: user.id,
      option: 'anewstring'
    })
      .then(() => request(app).get(`/api/v1/votes?poll=${poll.id}`))
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining(
          [
            { 
              _id: expect.anything(),
              option: 'anewstring',
              poll: { _id: poll.id },
              user: user.id
            }
          ]));
      });
  });

  it('gets all votes by a user via GET', async() => {
    return Vote.create({
      poll: poll._id,
      user: user.id,
      option: 'acoolstring'
    })
      .then(() => request(app).get(`/api/v1/votes?user=${user.id}`))
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining(
          [
            { 
              _id: expect.anything(),
              option: 'acoolstring',
              poll: { _id: poll.id },
              user: user.id
            }
          ]));
      });
  });

  it('gets vote by ID via GET', () => {
    return Vote.create({ 
      poll: poll._id,
      user: user.id,
      option: 'asupercoolstring'
    })
      .then(vote => {
        return request(app)
          .get(`/api/v1/votes/${vote._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'asupercoolstring'
        });
      });
  });

  it('updates vote by ID via PATCH', () => {
    return Vote.create({ 
      poll: poll._id,
      user: user.id,
      option: 'asupercoolstring'
    })
      .then(vote => {
        return request(app)
          .patch(`/api/v1/votes/${vote._id}`)
          .send({ option: 'wickedstring' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'wickedstring'
        });
      });
  });

  it('deletes a vote by ID via DELETE', () => {
    return Vote.create({ 
      poll: poll._id,
      user: user.id,
      option: 'deletestring'
    })
      .then(vote => {
        return request(app)
          .delete(`/api/v1/votes/${vote._id}`);
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          poll: poll.id,
          user: user.id,
          option: 'deletestring'
        });
      });
  });
  
  it('gets a user\'s name and total votes', async() => {
    await Vote.create({ 
      poll: poll._id,
      user: user.id,
      option: 'deletestring'
    });
    return request(app)
      .get('/api/v1/votes/by-user')
      .then(res => {
        expect(res.body).toEqual([{
          _id: 'Bob', 
          votesByUser: 1
        }]);
      });
  });

  it('amount of votes each option got', async() => {
    await Vote.create([
      { 
        poll: poll._id,
        user: user.id,
        option: 'deletestring',
      },
      { 
        poll: poll._id,
        user: user.id,
        option: 'nostring',
      },
      { 
        poll: poll._id,
        user: user.id,
        option: 'deletestring',
      }
    ]);
    //only one vote per user on an option so this test is interesting. 
    return request(app)
      .get('/api/v1/votes/by-option')
      .then(res => {
        expect(res.body).toEqual(expect.arrayContaining([
          {
            _id: 'deletestring', 
            option: 1
          }, 
          {
            _id: 'nostring', 
            option: 1
          }, 
        ]));
      });
  });

});
