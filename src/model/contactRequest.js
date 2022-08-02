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
  note: {
    text: String,
    timestamp: Date,
  },
})

const schemaContactRequest = {
  source: Joi.object({
    userId: Joi.string().required(),
    deviceId: Joi.string().required(),
  }),
  timestamp: Joi.date().required(),
  resolve: Joi.boolean().required(),
  note: Joi.object({
    text: Joi.string(),
    timestamp: Joi.date(),
  }),
}

const joiSchemaContactRequest = Joi.object(schemaContactRequest)

const joiSchemaContactRequesstNote = Joi.object(schemaContactRequest).fork(
  ['resolve', 'source', 'timestamp'],
  (schema) => schema.allow('').optional()
)

export const validateContactRequestSchema = (data) =>
  joiSchemaContactRequest.validateAsync(data, { abortEarly: false })

export const validateContactRequestNoteSchema = (data) =>
  joiSchemaContactRequesstNote.validateAsync(data, { abortEarly: false })

const ContactRequestModel = Mongoose.model(
  'ContactRequest',
  contactRequestSchema
)

export default ContactRequestModel
