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

membershipSchema.statics.deletesMemberAndAllVotes = function(id) {
  
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Vote').deleteMany({ membership: id })
  ])
    .then(([membership]) => membership); 
};

module.exports = mongoose.model('Membership', membershipSchema);
