const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    require: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    require: true
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

module.exports = mongoose.model('Membership', membershipSchema);
