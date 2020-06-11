const { Router } = require('express');
const Membership = require('../models/Membership');
const Vote = require('../models/Vote');

module.exports = Router()
  .post('/', (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })
  .get('/', (req, res, next) => {
    Membership
      .find(req.query)
      .populate('organization', { title: true, imageUrl: true })
      .populate('user', { name: true, imageUrl: true })
      .then(membership => res.send(membership))
      .catch(next);
  })
  .delete('/:id', (req, res, next) => {
    Membership
      .deletesMemberAndAllVotes(req.params.id)
      .then(deletedMembership => res.send(deletedMembership))
      .catch(next);
  });
// .delete('/:id/:userID', (req, res, next) => {
//   Promise.all([
//     Vote
//       .deleteMany({ user: req.params.userID }),
//     Membership
//       .findByIdAndDelete(req.params.id),
//   ])
//     .then(([, deletedMembership]) => res.send(deletedMembership))
//     .catch(next);
// });
