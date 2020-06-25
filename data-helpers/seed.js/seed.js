const chance = require('chance').Chance();

const User = require('../../lib/models/User');
const Organization = require('../../lib/models/Organization');
const Poll = require('../../lib/models/Poll');
const Membership = require('../../lib/models/Membership');
const Vote = require('../../lib/models/Vote');


module.exports = async({ users = 3, organizations = 4, polls = 3, memberships = 3, votes = 20 } = {}) => {
  const communication = ['phone', 'email'];
  

  const newUser = await User.create([...Array(users)].map(() => ({
    name: chance.name(),
    password: 'password',
    phone: chance.phone(),
    email: chance.email,
    communicationMedium: chance.pickset(communication),
    imageUrl: chance.url(),
  })));
  const newOrganization = await Organization.create([...Array(organizations)].map(() => ({
    title: chance.animal(),
    description: chance.profession(),
    imageUrl: chance.url(),
  })));
  const newPoll = await Poll.create([...Array(polls)].map(() => ({
    organization: chance.pickone(newOrganization)._id,
    title: chance.name,
    description: chance.province,
    list: chance.pickone(['option1', 'option2', 'option3', 'option4', 'option5'])
  })));
  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(newOrganization)._id,
    user: chance.pickone(newUser)._id
  })));
  await Vote.create([...Array(votes)].map(() => ({
    poll: chance.pickone(newPoll)._id,
    user: chance.pickone(newUser)._id,
    option: chance.pickone(['option1', 'option2', 'option3', 'option4', 'option5'])
  })));
};
