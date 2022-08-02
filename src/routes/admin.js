import express from 'express'
import {
  isAuth,
  isAdminAuth,
  loginAdmin,
  logoutAdmin,
  getAdmin,
} from '../controllers/admin'

const router = express.Router()

router.get('/isAuth', isAdminAuth)

router.get('/:id', isAuth, getAdmin)

router.post('/login', loginAdmin)

router.delete('/logout', logoutAdmin)

export default router
