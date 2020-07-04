const KoaRouter = require('koa-router')
const router = new KoaRouter()
const callCloudDB = require('../utils/callCloudDB')
const cloudStorage = require('../utils/callCloudStorage')

// 获取blog列表数据的接口
router.get('/list', async (ctx, next) => {
  const params = ctx.request.query
  const query = `
    db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()
  `
  const res = await callCloudDB(ctx, 'databasequery', query)

  ctx.body = {
    code: 20000,
    data: res
  }
})

// 根据传入的博客id删除当前博客内容
router.post('/remove', async (ctx, next) => {
  const params = ctx.request.body
  // 1. 删除当前博客
  const query1 = `
    db.collection('blog').doc('${params._id}').remove()
  `
  const res1 = await callCloudDB(ctx, 'databasedelete', query1)

  console.log(res1)

  // 2. 删除当前博客下面的评论
  const query2 = `
    db.collection('blog-comment').where({
      blogId: '${params._id}'
    }).remove()
  `
  const res2 = await callCloudDB(ctx, 'databasedelete', query2)
  console.log(res2)

  // 3. 删除博客里面的图片
  const res3 = await cloudStorage.remove(ctx, params.imgs)
  console.log(res3)

  ctx.body = {
    code: 20000,
    data: {
      res1,
      res2,
      res3
    }
  }
})


module.exports = router
