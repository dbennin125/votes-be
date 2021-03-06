const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema ({
  title: {
    type: String,
    required: true, 
    maxlength: 500,
  }, 
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
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

organizationSchema.virtual('polls', {
  ref: 'Poll',
  localField: '_id',
  foreignField: 'organization'
});
organizationSchema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'organization'
});
organizationSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organization'
});

organizationSchema.statics.deleteOrganizationAndAllPollsAndVotes = function(id) {
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('Poll').deleteMany({ organization: id }),
    this.model('Vote').deleteMany({ organization: id })
  ])
    .then(([organization]) => organization);
};

module.exports = mongoose.model('Organization', organizationSchema);
