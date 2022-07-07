import bcrypt from 'bcrypt'
import User, { validateUser } from '../model/user'
import { AggregateUserCalendarByUserId } from '../helpers'

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

    return res.json({
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
    await validateUser(req.body)

    let user = new User({
      login: req?.body?.login,
      password: req?.body?.password,
      name: req?.body?.name,
      lastName: req?.body?.lastName,
      birthDate: req?.body?.birthDate,
      pin: req?.body?.pin,
      adress: req?.body?.adress,
    })

    user = await user.save()

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
    await validateUser(req.body)
    const { login, password, name, lastName, birthDate, pin, adress } = req.body

    const editedUser = new User({
      _id: req.params.id,
      login,
      password,
      name,
      lastName,
      birthDate,
      pin,
      adress,
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
    console.log(error)
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

    if (!deletedUser) {
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
    const user = await User.findOne({ login })
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
    const userSession = { login: user.login }
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
