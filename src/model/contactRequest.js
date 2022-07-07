import Mongoose from 'mongoose'
import Joi from 'joi'

const { Schema } = Mongoose

const contactRequestSchema = new Schema({
  source: {
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  timestamp: { type: Date, required: true },
  resolve: { type: Boolean, required: true },
})

const JoiSchemaContactRequest = Joi.object({
  source: Joi.object({
    userId: Joi.string().required(),
    deviceId: Joi.string().required(),
  }),
  timestamp: Joi.date().required(),
  resolve: Joi.boolean().required(),
})

export const validateContactRequestModel = (data) =>
  JoiSchemaContactRequest.validateAsync(data, { abortEarly: false })

const ContactRequestModel = Mongoose.model(
  'ContactRequest',
  contactRequestSchema
)

export default ContactRequestModel
