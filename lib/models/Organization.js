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
      delete ret.id;
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

module.exports = mongoose.model('Organization', organizationSchema);
