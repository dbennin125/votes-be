const { Router } = require('express');
const Vote = require('../models/Vote');

module.exports = Router()
  .post('/', (req, res, next) => {
    Vote
      .create(req.body)
      .then(vote => res.send(vote))
      .catch(next);
  })
  .get('/', (req, res, next) => {
    Vote
      .find(req.query)
      .populate('poll')
      .populate('user')
      .then(vote => res.send(vote))
      .catch(next);
  })
  .delete('/:id', (req, res, next) => {
    Vote
      .findByIdAndDelete(req.params.id)
      .then(vote => res.send(vote))
      .catch(next);
  })
  .patch('/:id', (req, res, next) => {
    Vote
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(item => res.send(item))
      .catch(next);
  });
