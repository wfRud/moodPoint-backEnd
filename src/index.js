import 'dotenv/config'
import Express from 'express'
import Cors from 'cors'
import Helmet from 'helmet'
import RateLimit from 'express-rate-limit'
import Morgan from 'morgan'
import Mongoose from 'mongoose'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import ConnectMongoDBSession from 'connect-mongodb-session'
import User from './routes/user'
import Admin from './routes/admin'

const app = Express()
const MongoDBStore = ConnectMongoDBSession(session)

const port = process.env.PORT
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME
const nodeEnv = process.env.NODE_ENV
const inProd = nodeEnv === 'production'
const dbString = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.dclwf.mongodb.net/${dbName}?retryWrites=true&w=majority`

const maxAge = new Date('2099-01-01T00:00:00+0000').getTime()

const limiter = RateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const mongoDBStore = new MongoDBStore({
  uri: dbString,
  collection: 'mysessions',
  expires: maxAge,
})

app.disable('x-powered-by')

const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: 'http://localhost:3000',
}

app.use(Cors(corsOptions))
app.use(Helmet())
app.use(limiter)
app.use(Morgan('tiny'))
app.use(Express.json())
app.use(cookieParser())
app.use(
  session({
    secret: process.env.SECRET_SESSION_KEY,
    name: 'session-id',
    store: mongoDBStore,
    cookie: {
      maxAge,
      sameSite: false,
      secure: inProd,
    },
    resave: false,
    saveUninitialized: false,
  })
)

Mongoose.connect(dbString)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(`Could not connect to MongoDB... ${err}`))

app.use('/api/users', User)
app.use('/api/admins', Admin)

app.listen(port, () => console.log(`listening on port ${port}`))
