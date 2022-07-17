/* eslint-disable no-underscore-dangle */
/* eslint func-names: ["error", "never"] */
import Mongoose from 'mongoose'
import Joi from 'joi'
import { joiPassword } from 'joi-password'
import { validatePhoneNumber, validatePesel } from '../utils/helpers'

const { Schema } = Mongoose

const userSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  name: {
    type: String,
    minlength: 3,
    maxlength: 19,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
    minlength: 3,
    maxlength: 30,
    trim: true,
    required: true,
  },
  dob: {
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
  describe: { type: String, required: true },
})

const UserModel = Mongoose.model('User', userSchema)

const validateSchema = {
  name: Joi.string()
    .min(3)
    .max(19)
    .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-Z '.-]*[^-]$/)
    .required()
    .messages({
      'string.base': 'Imię użytkownika musi być stringiem',
      'string.min': 'Imię użytkownika musi się składać z conajmniej 3 znaków',
      'string.max': 'Imię użytkownika musi się składać z conajmniej 19 znaków',
      'string.pattern.base': 'Imię użytkwownika musi zaczynać się dużą literą',
      'string.empty': 'Imię użytkownika nie może być puste',
      'any.required': 'Imię użytkownika jest wymagane',
    }),
  lastname: Joi.string()
    .min(3)
    .max(30)
    .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-Z '.-]*[^-]$/)
    .required()
    .messages({
      'string.base': 'Nazwisko użytkownika musi być stringiem',
      'string.min':
        'Nazwisko użytkownika musi się składać z conajmniej 3 znaków',
      'string.max':
        'Nazwisko użytkownika musi się składać z conajmniej 19 znaków',
      'string.pattern.base':
        'Nazwisko użytkwownika musi zaczynać się dużą literą',
      'string.empty': 'Nazwisko użytkownika nie może być puste',
      'any.required': 'Nazwisko użytkownika jest wymagane',
    }),
  login: Joi.string()
    .min(3)
    .max(16)
    .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-Z0-9 '.-]*[^-]$/)
    .required()
    .messages({
      'string.base': 'Login musi być stringiem',
      'string.min': 'Login musi się składać z conajmniej 3 znaków',
      'string.max': 'Login musi się składać z conajmniej 16 znaków',
      'string.pattern.base': 'Login musi zaczynać się dużą literą',
      'string.empty': 'Login nie może być pusty',
    }),
  password: joiPassword
    .string()
    .minOfNumeric(1)
    .minOfUppercase(1)
    .minOfLowercase(1)
    .min(8)
    .max(16)
    .noWhiteSpaces()
    .required()
    .messages({
      'string.base': 'Hasło musi być stringiem',
      'password.minOfNumeric':
        'Podane hasło musi zawierać przynajmniej jedna cyfrę',
      'password.minOfUppercase':
        'Podane hasło musi zawierać przynajmniej jedną wielką literę',
      'password.minOfLowercase':
        'Podane hasło musi zawierać przynajmniej jedną małą literę',
      'string.min': 'Podane hasło musi zawierać co najmniej 8 znaków',
      'string.max': 'Podane hasło może zawierać maksymalnie 16 znaków',
      'password.noWhiteSpaces':
        'Podane hasło nie może zawierać żadnych białych znaków',
      'string.empty': 'Hasło jest wymagane',
    }),
  passwordConfirm: Joi.any()
    .equal(Joi.ref('password'))
    .messages({ 'any.only': 'Podane hasła różnią się od siebie' }),
  dob: Joi.date().min('1920-01-01').max('1970-01-01').messages({
    'date.base': 'Podaj prawidłową datę',
    'date.min': 'Data urodzenia nie może być wcześniejsza niż 1920-01-01',
    'date.max': 'Data urodzenia nie może być późniejsza niż 1970-01-01',
  }),
  pin: Joi.number().required().custom(validatePesel).messages({
    'number.base': 'Pesel jest wymagany',
    'any.invalid': 'Podany pesel jest nie prawidłowy',
  }),
  adress: {
    city: Joi.string()
      .min(3)
      .max(30)
      .regex(/^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźżA-Z '.-]*[^-]$/)
      .required()
      .messages({
        'string.base': 'Nazwa miasta musi być tekstem',
        'string.min': 'Nazwa miasta musi mieć co najmniej 3 znaki',
        'string.max': 'Nazwa miasta nie może być dłuższa niż 30 znaków',
        'string.pattern.base': 'Nazwa miasta musi zaczynać się dużą literą',
        'string.empty': 'Proszę podać nazwę miasta',
      }),
    street: Joi.string().allow('').min(3).max(100).messages({
      'string.base': 'Nazwa ulicy musi być tekstem',
      'string.min': 'Nazwa ulicy musi mieć co najmniej 3 znaki',
      'string.max': 'Nazwa ulicy nie może być dłuższa niż 100 znaków',
    }),
    houseNumber: Joi.number().min(1).required().messages({
      'number.base': 'Numer budynku musi składać się z cyfr',
      'number.min': 'Numer budynku musi być większy od 0',
      'number.empty': 'Proszę podać numer budynku',
    }),
    apartmentNumber: Joi.number().allow('').messages({
      'number.base': 'Numer mieszkania musi składać się z cyfr',
    }),
    phoneNumber: Joi.number().required().custom(validatePhoneNumber).messages({
      'number.base': 'Numer telefonu musi składać się z cyfr',
      'number.empty': 'Proszę podać numer telefonu',
    }),
  },
  describe: Joi.string().min(15).max(300).required().messages({
    'string.min': 'Opis pacjenta nie może być krótszy niż 15 znaków',
    'string.max': 'Opis pacjenta nie może być dłuższy  niż 300 znaków',
    'string.empty': 'Proszę podać opis użytkownika',
    'any.required': 'Proszę podać opis użytkownika',
  }),
}

export const AddUserSchema = Joi.object(validateSchema)
export const EditUserSchema = Joi.object(validateSchema).fork(
  ['login', 'password', 'passwordConfirm'],
  (schema) => schema.allow('').optional()
)
const EditUserCredentialSchema = Joi.object(validateSchema).fork(
  [
    'name',
    'lastname',
    'dob',
    'pin',
    'adress.city',
    'adress.street',
    'adress.houseNumber',
    'adress.apartmentNumber',
    'adress.phoneNumber',
    'describe',
  ],

  (schema) => schema.allow('').optional()
)

export const validateUser = (user, editMode = 'addMode') => {
  switch (editMode) {
    case 'addMode':
      return AddUserSchema.validateAsync(user, { abortEarly: false })
    case 'editMode':
      return EditUserSchema.validateAsync(user, { abortEarly: false })
    case 'editUserCrudential':
      return EditUserCredentialSchema.validateAsync(user, { abortEarly: false })

    default:
      return undefined
  }
}

export default UserModel
