const getAccessToken = require('./getAccessToken')
const rp = require('request-promise')
const baseURL = 'https://api.weixin.qq.com/tcb/'
const fs = require('fs')

const cloudStorage = {
  // 获取文件下载链接的请求方法
  async download(ctx, fileList) {
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'POST',
      uri: `${baseURL}batchdownloadfile?access_token=${ACCESS_TOKEN}`,
      body: {
        env: ctx.state.env,
        file_list: fileList
      },
      json: true
    }

    return await rp(options)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  },

  // 获取文件上传链接的请求方法
  async upload(ctx) {
    const ACCESS_TOKEN = await getAccessToken()
    const file = ctx.request.files.file
    const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
    const options = {
      method: 'POST',
      uri: `${baseURL}uploadfile?access_token=${ACCESS_TOKEN}`,
      body: {
        path,
        env: ctx.state.env,
      },
      json: true
    }
    // 请求上传图片的参数
    const info = await rp(options).then(res => {
      return res
    }).catch(err => {
      return err
    })

    // 
    const params = {
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data'
      },
      uri: info.url,
      formData: {
        key: path,
        Signature: info.authorization,
        'x-cos-security-token': info.token,
        'x-cos-meta-fileid': info.cos_file_id,
        file: fs.createReadStream(file.path)
      },
      json: true
    }

    await rp(params)
    return info.file_id
  },

  // 删除云存储中的数据
  async remove(ctx, fileid_list){
    const ACCESS_TOKEN = await getAccessToken()
    const options = {
      method: 'POST',
      uri: `${baseURL}batchdeletefile?access_token=${ACCESS_TOKEN}`,
      body: {
        fileid_list,
        env: ctx.state.env,
      },
      json: true
    }

    return await rp(options)
      .then(res => {
        return res
      })
      .catch(err => {
        return err
      })
  }
}

module.exports = cloudStorage