/* eslint-disable dot-notation */
import bcrypt from 'bcrypt'
import Admin from '../model/admin'

export const getAdmin = async (req, res) => {
  try {
    let admin = await Admin.findById({ _id: req.params.id })

    if (!admin) {
      return res.status(401).json({
        success: false,
        data: [],
        message: 'Nie istnieje użytkownik o podanym id',
      })
    }

    admin = {
      // eslint-disable-next-line no-underscore-dangle
      _id: admin._id,
      name: admin.name,
      lastname: admin.lastname,
      company: admin.company,
    }
    return res.status(200).json({
      success: true,
      data: admin,
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

export const loginAdmin = async (req, res) => {
  const { login, password } = req.body.data

  if (!login || !password) {
    return res.status(401).json({
      success: false,
      data: [],
      message: 'Login lub hasło nie został podany',
    })
  }

  try {
    let admin = await Admin.findOne({ login })

    if (!admin) {
      return res.status(401).json({
        success: false,
        data: [],
        message: 'Podany login jest nieprawidłowy',
      })
    }
    const comparePass = bcrypt.compareSync(
      password,
      admin.password,
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

    const adminSession = {
      sessionUserId: admin['_id'],
    }

    req.session.admin = adminSession
    admin = {
      _id: admin['_id'],
      name: admin.name,
      lastname: admin.lastname,
      company: admin.company,
    }

    return res.status(200).json({
      success: true,
      data: admin,
      message: 'Logowanie pomyślne',
      adminSession,
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error,
    })
  }
}

export const logoutAdmin = async (req, res) => {
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

export const isAdminAuth = async (req, res) => {
  if (req.session.admin) {
    return res.json(req.session.admin)
  }

  return res.status(401).json({
    success: false,
    data: [],
    message: 'Unauthorize',
  })
}
export const isAuth = async (req, res, next) => {
  if (req.session.admin) {
    return next()
  }

  return res.status(401).json({
    success: false,
    data: [],
    message: 'Unauthorize',
  })
}
