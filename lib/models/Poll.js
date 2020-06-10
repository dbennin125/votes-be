const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema ({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    require: true
  },
  title: {
    type: String,
    required: true, 
    maxlength: 60,
  }, 
  description: {
    type: String,
    required: true,
  },
  list: {
    type: String,
    required: true,
    enum: ['option1', 'option2', 'option3', 'option4', 'option5']
  }
});

module.exports = mongoose.model('Poll', pollSchema);
