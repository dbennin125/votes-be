const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 250
  },
  phone: { 
    type: String,
    required: true,
    maxlength: 15
  },
  email: {
    type: String,
    required: true,
  },
  communicationMedium: [{
    type: String,
    enum: ['phone', 'email']
  }],
  imageUrl: {
    type: String, 
  }
},  {
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
userSchema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'user'
});
userSchema.virtual('organizations', {
  ref: 'Organization',
  localField: '_id',
  foreignField: 'user'
});

module.exports = mongoose.model('User', userSchema);
