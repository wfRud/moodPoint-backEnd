/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
import Mongoose from 'mongoose'
import Joi from 'joi'
import { hashingPassword } from '../utils/helpers'

const { Schema } = Mongoose

const userCredentialsSchema = new Schema({
  _id: {
    type: String,
  },
  source: {
    userId: { type: String, required: true },
  },
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConfirm: {
    type: String,
  },
})

userCredentialsSchema.pre('save', function (next) {
  if (this.password) {
    this.password = hashingPassword(this.password)
  }

  return next()
})

userCredentialsSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery())

  if (!docToUpdate) {
    next()
  }
  if (this._update.password) {
    this._update.password = hashingPassword(this._update.password)
  }

  if (this._update.login) {
    if (docToUpdate) {
      if (this._update.source.userId !== docToUpdate.source.userId) {
        throw new Joi.ValidationError(
          'string.login',
          [
            {
              message: 'Podany login jest już zajęty',
              path: ['login'],
              type: 'string.login',
              context: {
                key: 'login',
                label: 'login',
                login: this._update.login,
              },
            },
          ],
          this._update.login
        )
      }
    }
  }
  return next()
})

const UserCredentials = Mongoose.model('UserCredentials', userCredentialsSchema)

export default UserCredentials
