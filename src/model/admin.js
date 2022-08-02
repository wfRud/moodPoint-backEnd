import Mongoose from 'mongoose'
import { nanoid } from 'nanoid'

const { Schema } = Mongoose

const adminSchema = new Schema({
  _id: {
    type: String,
    default: () => nanoid(),
  },
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
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
  company: {
    type: String,
    required: true,
  },
})

const AdminModel = Mongoose.model('Admin', adminSchema)

export default AdminModel
