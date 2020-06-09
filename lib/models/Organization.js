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
});

module.exports = mongoose.model('Organization', organizationSchema)
