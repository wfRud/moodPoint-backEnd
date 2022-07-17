import express from 'express'
import { isAdminAuth } from '../controllers/admin'
import {
  getUser,
  getUsers,
  addUser,
  editUser,
  deleteUser,
  loginUser,
  logoutUser,
  isUserAuth,
  isUserExist,
  editUserCredentials,
} from '../controllers/user'
import { addMood, getUserMoods } from '../controllers/mood'
import {
  addContactRequest,
  updateContactrequest,
  addNoteToContactrequest,
} from '../controllers/contactRequest'

const router = express.Router()

// router.post('/', isAdminAuth, addUser)
router.post('/', addUser)
router.post('/moods', isUserAuth, addMood)
router.post('/contactRequest', isUserAuth, addContactRequest)
router.post('/login', loginUser)
// router.post('/isLoginExists', isAdminAuth, isUserExist)
router.post('/isLoginExists', isUserExist)

// router.get('/', isAdminAuth, getUsers)
router.get('/', getUsers)
router.get('/isAuth', isUserAuth)
// router.get('/:id', isAdminAuth, getUser)
router.get('/:id', getUser)
router.get('/moods/:id', isAdminAuth, getUserMoods)

// router.put('/:id', isAdminAuth, editUser)
router.put('/:id', editUser)
// router.put('/credentials/:id',isAdminAuth, editUserCredentials)
router.put('/credentials/:id', editUserCredentials)
router.put('/contactRequest/resolve/:id', isAdminAuth, updateContactrequest)
router.put('/contactRequest/note/:id', isAdminAuth, addNoteToContactrequest)

router.delete('/logout', logoutUser)
router.delete('/:id', isAdminAuth, deleteUser)

export default router
