/* eslint-disable no-underscore-dangle */
/* eslint func-names: ["error", "never"] */
import Mongoose from 'mongoose'
import Joi from 'joi'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { joiPassword } from 'joi-password'
import {
  validateLogin,
  validatePhoneNumber,
  validatePesel,
  hashingPassword,
  checkIsLoginExist,
} from '../helpers'

const { Schema } = Mongoose

const userSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  role: {
    type: String,
    default: 'user',
  },
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordConfirmation: {
    type: String,
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 19,
    trim: true,
    required: true,
  },
  lastName: {
    type: String,
    minlength: 3,
    maxlength: 30,
    trim: true,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  pin: {
    type: Number,
    length: 11,
    required: true,
  },
  adress: {
    city: {
      type: String,
      required: true,
    },
    street: String,
    houseNumber: {
      type: Number,
      required: true,
    },
    apartmentNumber: Number,
    phoneNumber: {
      type: Number,
      required: true,
    },
  },
  describe: String,
})

userSchema.pre('save', function (next) {
  if (this.login) {
    checkIsLoginExist(this.login)
  }
  if (this.password) {
    this.password = hashingPassword(this.password)
  }
  return next()
})

userSchema.pre('findOneAndUpdate', async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery())
  if (!docToUpdate) {
    next()
  }

  if (this._update.password) {
    const comparePass = bcrypt.compareSync(
      this._update.password,
      docToUpdate.password,
      (err, result) => {
        if (err) throw new Error(err)
        return result
      }
    )

    if (!comparePass) {
      this._update.password = hashingPassword(this._update.password)
    } else {
      this._update.password = docToUpdate.password
    }
  }

  if (this._update.login) {
    const user = await this.model.findOne({ login: this._update.login })

    if (user) {
      if (user._id !== this._update._id) {
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

const UserModel = Mongoose.model('User', userSchema)

const JoiSchema = Joi.object({
  login: Joi.string().required().external(validateLogin),
  password: joiPassword
    .string()
    .minOfNumeric(1)
    .minOfUppercase(1)
    .minOfLowercase(1)
    .min(8)
    .max(16)
    .noWhiteSpaces()
    .required(),
  passwordConfirmation: Joi.any().equal(Joi.ref('password')),
  name: Joi.string()
    .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ]+[a-ząćęłńóśźż][^\s,.\\/-_]{3,19}$/)
    .required(),
  lastName: Joi.string()
    .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ]+[a-ząćęłńóśźż][^\s,.\\/_]{3,30}$/)
    .required(),
  birthDate: Joi.date().min('1920-01-01').max('1970-01-01').messages({
    'date.min': 'Data urodzenia nie może być wcześniejsza niż 1920-01-01',
    'date.max': 'Data urodzenia nie może być późniejsza niż 1970-01-01',
  }),
  pin: Joi.number()
    .required()
    .custom(validatePesel, 'personal identification number validation'),
  adress: {
    city: Joi.string().min(3).max(30).required().messages({
      'string.base': 'Nazwa miasta musi być tekstem',
      'string.empty': 'Proszę podać nazwę miasta',
      'string.min': 'Nazwa miasta musi mieć co najmniej 3 znaki',
      'string.max': 'Nazwa miasta nie może być dłuższa niż 30 znaków',
    }),
    street: Joi.string().min(3).max(100).messages({
      'string.base': 'Nazwa ulicy musi być tekstem',
      'string.empty': 'Proszę podać nazwę ulicy',
      'string.min': 'Nazwa ulicy musi mieć co najmniej 3 znaki',
      'string.max': 'Nazwa ulicy nie może być dłuższa niż 100 znaków',
    }),
    houseNumber: Joi.number().min(1).required().messages({
      'number.base': 'Numer budynku musi składać się z cyfr',
      'number.empty': 'Proszę podać numer budynku',
      'number.min': 'Numer budynku musi być większy od 0',
    }),
    apartmentNumber: Joi.number().min(1).messages({
      'number.base': 'Numer mieszkania musi składać się z cyfr',
      'number.min': 'Numer mieszkania musi być większy od 0',
    }),
    phoneNumber: Joi.number()
      .required()
      .custom(validatePhoneNumber, 'phone number validation'),
  },
  describe: Joi.string().min(15).max(300).messages({
    'string.min': 'Opis pacjenta nie może być krótszy niż 15 znaków',
    'string.max': 'Opis pacjenta nie może być dłuższy  niż 300 znaków',
  }),
})

export const validateUser = (user) =>
  JoiSchema.validateAsync(user, { abortEarly: false })

export default UserModel
