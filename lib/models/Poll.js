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
pollSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'poll',
  count: true

});

module.exports = mongoose.model('Poll', pollSchema);
