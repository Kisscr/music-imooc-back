const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const cors = require('koa2-cors')
const koaBody = require('koa-body')

// 小程序的环境id
const ENV = 'kisscr'

// 使用koa2-cors解决跨域的问题
app.use(cors({
  origin: ['http://localhost:9528'],
  credentials: true
}))

// 接收post参数解析
app.use(koaBody({
  multipart: true
}))

// 全局的中间件
app.use(async (ctx, next) => {
  // console.log('全局的中间件')
  // ctx.body = 'hello world'
  ctx.state.env = ENV
  await next()
})

const playlist = require('./controller/playlist')
const swiper = require('./controller/swiper')
const blog = require('./controller/blog')
router.use('/playlist', playlist.routes())
router.use('/swiper', swiper.routes())
router.use('/blog', blog.routes())

app.use(router.routes())
app.use(router.allowedMethods())



app.listen(3000, () => {
  console.log('服务开启在3000端口')
})
