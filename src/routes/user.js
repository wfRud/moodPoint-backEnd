import express from 'express'
import { isAuth } from '../controllers/admin'
import {
  getUser,
  getUsers,
  addUser,
  editUser,
  deleteUser,
  loginUser,
  logoutUser,
  isUserAuth,
  isResourceExists,
  editUserCredentials,
} from '../controllers/user'
import { addMood, getUserMoods } from '../controllers/mood'
import {
  addContactRequest,
  updateContactrequest,
  addNoteToContactrequest,
  getContactRequestsOfUserByDate,
} from '../controllers/contactRequest'

const router = express.Router()

router.post('/', isAuth, addUser)
// router.post('/moods', isUserAuth, addMood)
router.post('/moods', addMood)
// router.post('/contactRequest', isUserAuth, addContactRequest)
router.post('/contactRequest', addContactRequest)
router.post('/login', loginUser)
router.post('/isResourceExists', isAuth, isResourceExists)

router.get('/', isAuth, getUsers)
router.get('/isAuth', isUserAuth)
router.get('/:id', isAuth, getUser)

router.get('/:id/moods', isAuth, getUserMoods)

router.get(
  '/:id/contactRequests/:date?',
  isAuth,
  getContactRequestsOfUserByDate
)

router.put('/:id/edit', isAuth, editUser)

router.put('/:id/credentials', isAuth, editUserCredentials)

router.put('/:id/contactRequest/resolve', isAuth, updateContactrequest)

router.put('/:id/contactRequest/note', isAuth, addNoteToContactrequest)

router.delete('/logout', logoutUser)

router.delete('/:id/delete', isAuth, deleteUser)

export default router
