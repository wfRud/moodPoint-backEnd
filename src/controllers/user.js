/* eslint-disable no-unused-vars */
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import User, { validateUser } from '../model/user'
import UserCredentials from '../model/userCredentials'
import { AggregateUserCalendarByUserId } from '../utils/helpers'

export const getUser = async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: { _id: req.params.id },
      },
      AggregateUserCalendarByUserId,
    ]).exec()

    if (!user.length) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie istnieje',
      })
    }

    return res.json({
      success: true,
      data: user[0],
      message: 'Użytkownik znaleziony',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const getUsers = async (_req, res) => {
  try {
    const users = await User.aggregate([AggregateUserCalendarByUserId])

    return res.status(200).json({
      success: true,
      data: users,
      message: 'Użytkownicy znalezieni !',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const addUser = async (req, res) => {
  try {
    const { data } = req.body
    const { login, password, name, lastname, dob, pin, adress, describe } = data

    const id = nanoid()
    await validateUser(data, 'addMode')

    let user = new User({
      _id: id,
      login,
      password,
      name,
      lastname,
      dob,
      pin,
      adress,
      describe,
    })

    let userCredentials = new UserCredentials({
      _id: nanoid(),
      login,
      password,
      source: {
        userId: id,
      },
    })

    user = await user.save()
    userCredentials = await userCredentials.save()

    return res.json({
      success: true,
      data: user,
      message: 'Dodałeś nowego użytkownika',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const editUser = async (req, res) => {
  try {
    const { data } = req.body
    const { name, lastname, dob, pin, adress, describe } = req.body.data

    await validateUser(data, 'editMode')

    const editedUser = new User({
      _id: req.params.id,
      name,
      lastname,
      dob,
      pin,
      adress,
      describe,
    })

    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      editedUser,
      {
        new: true,
      }
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie istnieje',
      })
    }

    return res.json({
      success: true,
      data: user,
      message: 'Użytkownik Edytowany !',
    })
  } catch (error) {
    return res.json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const editUserCredentials = async (req, res) => {
  try {
    const { data } = req.body
    const { login, password } = req.body.data

    await validateUser(data, 'editUserCrudential')

    const editedUserCredentials = new UserCredentials({
      source: {
        userId: req.params.id,
      },
      login,
      password,
    })

    const userCredentials = await UserCredentials.findOneAndUpdate(
      { 'source.userId': req.params.id },
      editedUserCredentials,
      {
        new: true,
      }
    )

    if (!userCredentials) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie istnieje',
      })
    }

    return res.json({
      success: true,
      data: userCredentials,
      message: 'Hasło i Login zostało zmienione !',
    })
  } catch (error) {
    return res.json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req?.params?.id)
    const deletedUserCredentials = await UserCredentials.findOneAndDelete({
      'source.userId': req?.params?.id,
    })

    if (!deletedUser && !deletedUserCredentials) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Użytkownik o podanym id nie istnieje',
      })
    }
    return res.json({
      success: true,
      data: deletedUser,
      message: 'Użytkownik został usunięty',
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const loginUser = async (req, res) => {
  const { login, password } = req.body
  if (!login || !password) {
    return res.status(401).json({
      success: false,
      data: [],
      message: 'Login lub hasło nie został podany',
    })
  }

  try {
    const user = await User.UserCredential({ login })
    if (!user) {
      return res.status(401).json({
        success: false,
        data: [],
        message: 'Podany login jest nieprawidłowy',
      })
    }

    const comparePass = bcrypt.compareSync(
      password,
      user.password,
      (err, result) => {
        if (err) throw new Error(err)
        return result
      }
    )

    if (!comparePass) {
      return res.status(400).json({
        success: false,
        data: [],
        message: 'Podane hasło jest nieprawidłowe',
      })
    }
    const userSession = {
      name: user.name,
      surname: user.surname,
      login: user.login,
    }
    req.session.user = userSession

    return res.status(200).json({
      success: true,
      data: [],
      message: 'Logowanie pomyślne',
      userSession,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const logoutUser = async (req, res) => {
  req.session.destroy((error) => {
    if (error) throw error

    res.clearCookie('session-id')
    res.status(200).json({
      success: true,
      data: [],
      message: 'Logout sucessful',
    })
  })
}

export const isUserAuth = async (req, res, next) => {
  if (req.session.user) {
    return next()
  }

  return res.status(401).json({
    success: false,
    data: [],
    message: 'Unauthorize',
  })
}

export const isResourceExists = async (req, res) => {
  const record = await UserCredentials.findOne({ login: req.body.login })

  return record !== null
    ? res.status(409).json({
        success: false,
        data: { user: record.source.userId },
        message: 'resource already exists',
      })
    : res.status(200).json({
        success: true,
        data: [],
        message: `resource doesn't exist`,
      })
}
