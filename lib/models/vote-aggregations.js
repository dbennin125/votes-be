const byUser = [
  {
    '$group': {
      '_id': '$user', 
      'votes': {
        '$sum': 1
      }
    }
  }, {
    '$lookup': {
      'from': 'users', 
      'localField': '_id', 
      'foreignField': '_id', 
      'as': 'voter'
    }
  }, {
    '$unwind': {
      'path': '$voter'
    }
  }, {
    '$group': {
      '_id': '$voter.name', 
      'votesByUser': {
        '$sum': '$votes'
      }
    }
  }
];

module.exports = {
  byUser
};
