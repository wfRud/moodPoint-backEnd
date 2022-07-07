import bcrypt from 'bcrypt'
import Admin from '../model/admin'

export const loginAdmin = async (req, res) => {
  const { login, password } = req.body
  if (!login || !password) {
    return res.status(401).json({
      success: false,
      data: [],
      message: 'Login lub hasło nie został podany',
    })
  }

  try {
    const user = await Admin.findOne({ login })
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
    const adminSession = { login: user.login }
    req.session.admin = adminSession

    return res.status(200).json({
      success: true,
      data: [],
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

export const isAdminAuth = async (req, res, next) => {
  if (req.session.admin) {
    return next()
  }

  return res.status(401).json({
    success: false,
    data: [],
    message: 'Unauthorize',
  })
}
