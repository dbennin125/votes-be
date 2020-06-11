const { Router } = require('express');
const Organization = require('../models/Organization');

module.exports = Router()
  .post('/', (req, res, next) => {
    Organization
      .create(req.body)
      .then(item => res.send(item))
      .catch(next);
  })
  .get('/:id', (req, res, next) => {
    Organization
      .findById(req.params.id)
      .populate('memberships')
      .then(item => res.send(item))
      .catch(next);
  })
  .patch('/:id', (req, res, next) => {
    Organization
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(item => res.send(item))
      .catch(next);
  })
  .delete('/:id', (req, res, next) => {
    Organization
      .deleteOrganizationAndAllPollsAndVotes(req.params.id)
      .then(item => res.send(item))
      .catch(next);
  })
  .get('/', (req, res, next) => {
    Organization
      .find(req.query)
      .select({
        _id: true,
        title: true,
        imageUrl: true
      })
      .then(items => res.send(items))
      .catch(next);
  });
