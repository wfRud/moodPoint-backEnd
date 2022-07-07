/* eslint-disable import/prefer-default-export */
import Mongoose from 'mongoose'
import Joi from 'joi'
import bcrypt from 'bcrypt'

export const checkIsLoginExist = (login) => {
  const isLoginExist = Mongoose.models.User.exists({ login })

  if (isLoginExist !== null) {
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
            login,
          },
        },
      ],
      login
    )
  }
}

export const validateLogin = async (login) => {
  const reg = /^[A-ZĄĆĘŁŃÓŚŹŻ]+[a-ząćęłńóśźż][^\s]{3,15}$/
  const isValid = reg.test(login)

  if (!isValid) {
    throw new Joi.ValidationError(
      'string.invalidLogin',
      [
        {
          message: 'Podany login jest nieprawidłowy',
          path: ['login'],
          type: 'string.invalidLogin',
          context: {
            key: 'login',
            label: 'login',
            login,
          },
        },
      ],
      login
    )
  }
}

export const validatePhoneNumber = (phoneNumber, helpers) => {
  const reg = /^([+]?\d{1,2}[-\s]?|)\d{2,3}[-\s]?\d{2,3}[-\s]?\d{3}$/

  return reg.test(phoneNumber)
    ? true
    : helpers.message('Podany format telefonu jest niepoprawny')
}

export const validatePesel = (pesel, helpers) => {
  const reg = /^[0-9]{11}$/

  if (reg.test(pesel) === false) return false

  const digits = pesel.toString().split('')
  const month = parseInt(digits[2] + digits[3], 10)
  const day = parseInt(digits[4] + digits[5], 10)

  if (day > 31 || month > 12)
    return helpers.message('Podany pesel jest niepoprawny')

  let checksum =
    (1 * parseInt(digits[0], 10) +
      3 * parseInt(digits[1], 10) +
      7 * parseInt(digits[2], 10) +
      9 * parseInt(digits[3], 10) +
      1 * parseInt(digits[4], 10) +
      3 * parseInt(digits[5], 10) +
      7 * parseInt(digits[6], 10) +
      9 * parseInt(digits[7], 10) +
      1 * parseInt(digits[8], 10) +
      3 * parseInt(digits[9], 10)) %
    10

  if (checksum === 0) checksum = 10

  checksum = 10 - checksum

  return parseInt(digits[10], 10) === checksum
}

export const hashingPassword = (pass) => {
  const saltRound = 10
  return bcrypt.hashSync(pass, saltRound, (err, hash) => {
    if (err) {
      throw new Error(err)
    }

    return hash
  })
}

export const AggregateUserCalendarByUserId = {
  $lookup: {
    from: 'moods',
    localField: '_id',
    foreignField: 'source.userId',
    pipeline: [
      {
        $lookup: {
          from: 'contactrequests',
          localField: 'source.userId',
          foreignField: 'source.userId',
          let: {
            // truncate timestamp to start of day
            moodsDate: {
              $dateTrunc: {
                date: '$timestamp',
                unit: 'day',
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    '$$moodsDate',
                    {
                      // truncate timestamp to start of day
                      $dateTrunc: {
                        date: '$timestamp',
                        unit: 'day',
                      },
                    },
                  ],
                },
              },
            },
          ],
          as: 'contactRequests',
        },
      },
    ],
    as: 'calendar',
  },
}
