const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('../models/userModel');
const User = mongoose.model('User');
const handlerErr = require(`../errors/HandlerErrors`);

exports.register = async function (body) {
  try {
    var newUser = new User(body);
    newUser.hash_password = bcrypt.hashSync(body.password, 10);
    let SavedUser = await newUser.save(newUser)
    return SavedUser;
  } catch (error) {
    new handlerErr(new Error (error));
  }
};

exports.sign_in = async function (body, expiresIn) {
  return new Promise((resolve, reject) => {
    User.findOne({
      email: body.email
    }, function (err, user) {
      if (err) reject(err)
      if (!user) {
        reject({ message: 'Authentication failed. User not found.' });
      } else if (user) {
        if (!user.comparePassword(body.password)) {
          reject({ message: 'Authentication failed. Wrong password.' })
        } else {
          try {
            let token = jwt.sign(
              { 
                email: user.email, 
                fullName: user.fullName, 
                _id: user._id, 
              }, 
              'RESTFULAPIs',
              { expiresIn: expiresIn }
            )
            resolve({ token: token}); 
          } catch (error) {
            return new handlerErr(error);
          }
        }
      }
    });  
  })
  
};

exports.loginRequired =  async function (req) {
  if (req.user) {
    return req.user;
  } 
    return new handlerErr(new Error ('Unauthorized user'))
};