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
});
userSchema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'organization'
});

module.exports = mongoose.model('User', userSchema);
