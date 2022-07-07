import express from 'express'
import { isAdminAuth, loginAdmin, logoutAdmin } from '../controllers/admin'

const router = express.Router()

router.post('/login', loginAdmin)

router.get('/isAuth', isAdminAuth)

router.delete('/logout', logoutAdmin)

export default router
