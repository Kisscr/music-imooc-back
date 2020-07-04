const getAccessToken = require('../utils/getAccessToken')
const rp = require('request-promise')

const callCloudFn = async (ctx, fnName, params) => {
  const ACCESS_TOKEN = await getAccessToken() 
  const options = {
    method: 'POST',
    url: `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${ACCESS_TOKEN}&env=${ctx.state.env}&name=${fnName}`,
    body: {
      ...params
    },
    json: true // 将返回的数据转换为对象格式
  }

  return await rp(options).then(res => {
    return res
  }).catch(err => {
    return err
  })

}

module.exports = callCloudFn