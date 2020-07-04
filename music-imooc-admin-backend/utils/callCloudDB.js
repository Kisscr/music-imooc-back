const getAccessToken = require('../utils/getAccessToken')
const rp = require('request-promise')

const callCloudDB = async (ctx, fnName, query = {}) => {
  const ACCESS_TOKEN = await getAccessToken() 
  const options = {
    method: 'POST',
    url: `https://api.weixin.qq.com/tcb/${fnName}?access_token=${ACCESS_TOKEN}`,
    body: {
      query,
      env: ctx.state.env
    },
    json: true // 将返回的数据转换为对象格式
  }

  return await rp(options).then(res => {
    return res
  }).catch(err => {
    return err
  })

}

module.exports = callCloudDB