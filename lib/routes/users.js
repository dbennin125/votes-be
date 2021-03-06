const { Router } = require('express');
const User = require('../models/User');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()
  .post('/', (req, res, next) => {
    User
      .create(req.body)
      .then(user => res.send(user))
      .catch(next);
  })
  .patch('/:id', ensureAuth,  (req, res, next) => {
    User
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.send(user))
      .catch(next);
  })
  .get('/:id', ensureAuth, (req, res, next) => {
    User
      .findById(req.params.id)
      .populate('organizations')
      .then(user => res.send(user))
      .catch(next);
  })
  .delete('/:id', ensureAuth, (req, res, next) => {
    User
      .findByIdAndDelete(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
