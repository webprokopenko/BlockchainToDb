const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
Schema = mongoose.Schema;

/**
 * User Schema
 */

 let UserSchema = new Schema({
    currency: {
         type: String,
         trim: true,
         default: 'usd',
         required: true,
         lowercase: true,
         enum: ['usd', 'eur']
     },
     email: {
         type: String,
         unique: true,
         lowercase: true,
         trium: true,
         required: true,
     },
     hash_password: {
         type: String,
         required: true
     },
     created: {
         type: Date,
         default: Date.now
     }
 });

 UserSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.hash_password);
 }

 mongoose.model('User', UserSchema);
