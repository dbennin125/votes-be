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
  },
];
const byOption = [
  {
    '$group': {
      '_id': {
        'poll': '$poll', 
        'option': '$option'
      }, 
      'votes': {
        '$sum': 1
      }
    }
  }, {
    '$unwind': {
      'path': '$_id'
    }
  }, {
    '$sort': {
      '_id': 1
    }
  }, {
    '$group': {
      '_id': '$_id.option', 
      'option': {
        '$sum': 1
      }
    }
  }
];

module.exports = {
  byUser, 
  byOption
};
