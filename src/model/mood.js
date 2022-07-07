import Mongoose from 'mongoose'
import Joi from 'joi'

const { Schema } = Mongoose

const moodSchema = new Schema({
  source: {
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  timestamp: { type: Date, required: true },
  mood: { type: String, required: true },
})

const JoiSchemaMood = Joi.object({
  source: Joi.object({
    userId: Joi.string().required(),
    deviceId: Joi.string().required(),
  }),
  timestamp: Joi.date().required(),
  mood: Joi.string().required(),
})

export const validateMoodModel = (data) =>
  JoiSchemaMood.validateAsync(data, { abortEarly: false })

const MoodModel = Mongoose.model('Mood', moodSchema)

export default MoodModel
