const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require(`${AppRoot}/models/UserModel.js`);
const User = mongoose.model('User');

exports.register = async function (body) {
  try {
    var newUser = new User(body);
    newUser.hash_password = bcrypt.hashSync(body.password, 10);
    let SavedUser = await newUser.save(newUser)
    return SavedUser;
  } catch (error) {
    new handlerErr(new Error(error));
  }
};
exports.sign_in = async function (body, expiresIn) {
  try {
    let user = await authUser(body)
    let token = jwt.sign(
      user,
      config.secret_key,
      { expiresIn: expiresIn }
    )
    return ({ token: token });
  } catch (error) {
    new handlerErr(new Error(error));
  }
};
exports.getCurrency = async function (req) {
  try {
    let user = await getUserFromHead(req);
    let curr = await getUserCurrById(user._id);
    return { currency: curr }
  } catch (error) {
    new handlerErr(error)
  }
};
exports.updateCurrency = async function (req) {
  try {
    let user = await getUserFromHead(req)
    return updateUserCurrById(user._id, req.body.currency)
  } catch (error) {
    new handlerErr(error)
  }
}
const authUser = function (body) {
  return new Promise((resolve, reject) => {
    User.findOne({
      email: body.email
    }, function (err, user) {
      if (err) reject(err)
      if (!user) {
        reject(new Error('Authentication failed. User not found.'));
      } else if (user) {
        if (!user.comparePassword(body.password)) {
          reject(new Error('Authentication failed. Wrong password.'));
        } else {
          resolve({
              email: user.email,
              currency: user.currency,
              _id: user._id,
            })
        }
      }
    })
  })
}
const getUserCurrById = async function (id) {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: id }, function (err, user) {
      if (err) return (err)
      if (!user) {
        reject(new AppError('getCurrency() User not found'))
      } else {
        resolve(user.currency)
      }
    })
  })
}
const updateUserCurrById = async function (id, curr) {
  return new Promise((resolve, reject) => {
    User.update({ _id: id }, { $set: { currency: curr } }, (err) => {
      if (err) reject((new Error(err)));
      resolve({ message: 'currency was updated' });
    })
  })
}
const getUserFromHead = function (req) {
  return new Promise((resolve, reject) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
      jwt.verify(req.headers.authorization.split(' ')[1], config.secret_key, function (err, decode) {
        if (err) reject((new Error('Unauthorized user')));
        resolve(decode);
      })
    }
  });
}