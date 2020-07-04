const Router = require('koa-router')
const router = new Router()
const callCloudFn = require('../utils/callCloudFn')
const callCloudDB = require('../utils/callCloudDB')

// 查询歌单的路由
router.get('/list', async (ctx, next) => {
  // 获取get请求的参数
  const query = ctx.request.query
  // 调用封装好的请求云函数的方法
  const res = await callCloudFn(ctx, 'music', {
    $url: 'playlist',
    start: parseInt(query.start),
    count: parseInt(query.count)
  })
  let data = []
  if (res.resp_data) {
    data = JSON.parse(res.resp_data).data
  }
  ctx.body = {
    data,
    code: 20000   // 这里的code是前端模板要求的
  }
})

// 根据id查询当前歌单信息的路由
router.get('/getById', async (ctx, next) => {
  const query = `db.collection('playlist').doc('${ctx.request.query.id}').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  ctx.body = {
    code: 20000,
    data: JSON.parse(res.data)
  }
})

// 接收前端传入的数据，对数据库进行更新
router.post('/updatePlaylist', async (ctx, next) => {
  const params = ctx.request.body
  const query = `
    db.collection('playlist').doc('${params._id}').update({
      data: {
        name: '${params.name}',
        copywrite: '${params.copywrite}'
      }
    })
  `
  const res = await callCloudDB(ctx, 'databaseupdate', query)

  ctx.body = {
    code: 20000,
    data: res
  }
})

// 根据传入的id删除当前数据
router.get('/deletePlaylist', async (ctx, next) => {
  const params = ctx.request.query
  const query = `
    db.collection('playlist').doc('${params.id}').remove()
  `
  const res = await callCloudDB(ctx, 'databasedelete', query)
  // console.log(res)
  ctx.body = {
    code: 20000,
    data: res
  }
})

module.exports = router