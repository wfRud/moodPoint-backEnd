import 'dotenv/config'
import Express from 'express'
import Cors from 'cors'
import Helmet from 'helmet'
import RateLimit from 'express-rate-limit'
import Morgan from 'morgan'

const app = Express()

const port = process.env.PORT
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

app.listen(port, () => console.log(`listening on port ${port}`))
