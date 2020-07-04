const Router = require('koa-router')
const router = new Router()
const callCloudDB = require('../utils/callCloudDB')
const cloudStorage = require('../utils/callCloudStorage')


// 调用轮播图云数据库中的内容，并返回图片的https路径
router.get('/list', async (ctx, next) => {
  const query = `db.collection('swiper').get()`
  const res = await callCloudDB(ctx, 'databasequery', query)
  // 从云数据库请求到的轮播图数据
  const swiperList = []
  res.data.forEach(item => {
    swiperList.push(JSON.parse(item))
  });
  // 准备参数，发送请求，获取文件下载链接
  const fileList = []
  res.data.forEach(item => {
    fileList.push({
      fileid: JSON.parse(item).fileid,
      max_age: 7200
    })
  });
  // 发送获取文件下载链接请求
  const dlRes = await cloudStorage.download(ctx, fileList)
  // console.log(dlRes)
  // 整合返回到前端的数据
  const returnDate = []
  for (let i = 0; i < dlRes.file_list.length; i++) {
    returnDate.push({
      download_url: dlRes.file_list[i].download_url,
      fileid: dlRes.file_list[i].fileid,
      id: JSON.parse(res.data[i])._id
    })
  }
  ctx.body = {
    code: 20000,
    data: returnDate
  }
})

// 获取上传文件的路径的接口
router.post('/upload', async (ctx, next) => {
  const fileid = await cloudStorage.upload(ctx)
  console.log(fileid)

  // 将上传成功的图片插入到数据库中
  const query = `
    db.collection('swiper').add({
      data: {
        fileid: '${fileid}'
      }
    })
  `
  const res = await callCloudDB(ctx, 'databaseadd', query)
  ctx.body = {
    code: 20000,
    id_list: res.id_list
  }

})

// 删除轮播图数据的接口
router.get('/remove', async (ctx, next) => {
  const params = ctx.request.query

  // 1. 删除云数据库中的数据
  const query = `db.collection('swiper').doc('${params.id}').remove()`
  const res1 = await callCloudDB(ctx, 'databasedelete', query)
  console.log(res1)

  // 2. 删除云存储中的数据
  const fileid_list = [params.fileid]
  const res2 = await cloudStorage.remove(ctx, fileid_list)
  console.log(res2)
  
  const res = {
    deleted: res1.deleted,
    delete_list: res2.delete_list
  }
  ctx.body = {
    code: 20000,
    data: res
  }
})

module.exports = router