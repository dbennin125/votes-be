const mongoose = require('mongoose');
const { byUser, byOption } = require('./vote-aggregations');

const voteSchema = new mongoose.Schema({
  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    require: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  option: {
    type: String,
    required: true
    
  }
}, {
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id,
      delete ret.__v;
    }
  },
  toObject: { 
    virtuals: true
  }
});
voteSchema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'vote'
});

voteSchema.statics.byUser = function() {
  return this.aggregate(byUser);
};

voteSchema.statics.byOption = function() {
  return this.aggregate(byOption);
};

module.exports = mongoose.model('Vote', voteSchema);
