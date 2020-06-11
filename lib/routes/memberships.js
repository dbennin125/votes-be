const { Router } = require('express');
const Membership = require('../models/Membership');

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
      .findByIdAndDelete(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });


