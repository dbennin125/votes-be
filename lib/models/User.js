const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 250
  },
  passwordHash: {
    type: String,
    required: true
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
      delete ret.passwordHash;
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
//changes password to password HASH with BCrypt
userSchema.virtual('password').set(function(password) {
  this.passwordHash = bcrypt.hashSync(password, +process.env.SALT || 10);
});
//finds if a user is authorized by email, if not throws error.
userSchema.statics.authorize = function(email, password) {
  return this.findOne({ email })
    .then(user => {
      if(!user) {
        throw new Error('Invalid Email/Password');
      }
      if(!bcrypt.compareSync(password, user.passwordHash)) {
        throw new Error('Invalid Email/Password');
      }
      return user;
    });
};
//verifies tokens, turns token info into object/User model
userSchema.statics.verifyToken = function(token) {
  const { sub } = jwt.verify(token, process.env.APP_SECRET);
  return this.hydrate(sub);
};
//authorizes the token to be used, expires in one day
userSchema.methods.authToken = function() {
  return jwt.sign({ sub: this.toJSON() }, process.env.APP_SECRET, { expiresIn: '1day' });
};

module.exports = mongoose.model('User', userSchema);
