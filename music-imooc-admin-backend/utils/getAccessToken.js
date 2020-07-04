const rp = require('request-promise')
const fs = require('fs')
const path = require('path')

// 获取文件路径
const fileName = path.resolve(__dirname, 'access_token.json')

// 获取请求地址
const APPID = 'wxcbddccfbacb51338'
const APPSECRET = 'b94e65e87ea5f4feb4bec8df06d65267'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`


// 定义存储access_token的方法
const updateAccessToken = async () => {
  const res = await rp(URL)
  const resObj = JSON.parse(res)

  if (resObj.access_token) {
    // 将获取到的access_token写入文件中
    fs.writeFileSync(fileName, JSON.stringify({
      access_token: resObj.access_token,
      createTime: new Date()
    }))
  } else {
    // 如果获取失败，则重新获取一次
    await updateAccessToken()
  }
}

// 定义读取文件中access_token的方法
const getAccessToken = async () => {
  try {
    // 需要指定获取文件的编码格式，默认输出的是buffer二进制
    const res = fs.readFileSync(fileName, 'utf-8')
    const resObj = JSON.parse(res)

    // 可能会出现服务器长时间宕机,需要在服务器恢复时判断是否超出有效时间，超出则需要重新更新
    const createTime = new Date(resObj.createTime).getTime()
    const nowTime = new Date().getTime()
    if(nowTime - createTime > 7200 * 1000){
      await updateAccessToken()
      await getAccessToken()
    }

    return resObj.access_token

  } catch (error) {
    // 如果读取失败，则重新更新并获取
    await updateAccessToken()
    await getAccessToken()
  }
}

setInterval(async () => {
  await updateAccessToken()
}, (7200 - 300) * 1000)

// updateAccessToken()
// console.log(getAccessToken())

module.exports = getAccessToken