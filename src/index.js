import 'dotenv/config'
import Express from 'express'
import Cors from 'cors'
import Helmet from 'helmet'
import RateLimit from 'express-rate-limit'
import Morgan from 'morgan'
import Mongoose from 'mongoose'

const app = Express()

const port = process.env.PORT
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(Cors())
app.use(Helmet())
app.use(limiter)
app.use(Morgan('tiny'))
app.use(Express.json())

Mongoose.connect(
  `mongodb+srv://admin:${dbPassword}@cluster0.dclwf.mongodb.net/${dbName}?retryWrites=true&w=majority`
)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(`Could not connect to MongoDB... ${err}`))

app.listen(port, () => console.log(`listening on port ${port}`))
