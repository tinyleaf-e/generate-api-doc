'use strict'

import * as clipboard from 'clipboard-polyfill'
import formatJson from 'format-json-pretty'

let generateApiData=function (data,res) {
  if (!data[res.config.url]) {
    let code = {}
    code[res.data.code] = res.data
    data[res.config.url] = {
      method: res.config.method,
      requestData: JSON.parse(res.config.data),
      responseData: code
    }
  } else {
    if (!data[res.config.url].responseData[res.data.code]) { data[res.config.url].responseData[res.data.code] = res.data }
  }
}

let generateApiDocMd=function (apis) {
  let str = ''
  for (let api in apis) {
    let part1 = '# 1.\n\n- [x] 前端已完成\n- [x] 后端已完成\n\n- **接口说明**: \n- **请求地址**: \n- **请求方式**: \n\n'

    let part2 = '请求参数 | 参数名 | 参数类型 | 是否必填 | 说明\n-|-|-|:-:|:-\n'
    for (let req in apis[api].requestData) {
      part2 += '-|' + req + '|' + (typeof req) + '||\n'
    }
    part2 += '## 请求值示例\n\n```json\n' + formatJson(apis[api].requestData) + '\n```\n\n'

    let part3 = '返回值名 | 返回值 |  说明\n:-|:-:|:-\n'
    for (let res in apis[api].responseData[0]) {
      part3 += res + '|' + (typeof res) + '|-\n'
    }
    part3 += '## 返回值示例\n\n```json\n' + formatJson(apis[api].responseData[0]) + '\n```\n\n'

    str = part1 + part2 + part3
  }
  clipboard.writeText(str)
  console.log("api doc copyed")
}

let generate = function (data,res) {
  generateApiData(data,res)
  generateApiDocMd(data)
}

export default generate
