'use strict'

import * as clipboard from 'clipboard-polyfill'
import formatJson from 'format-json-pretty'

// 从每次的请求中记录所有api，产生一定格式的数据（返回值必须包含code，msg，data），返回值的数据会根据code不同重复记录
let generateApiData=function (data,res) {
  if (!data[res.config.url]) {
    let code = {}
    code[res.data.code] = res.data
    data[res.config.url] = {
      method: res.config.method,
      requestData: res.config.data?JSON.parse(res.config.data):{},
      responseData: code
    }
  } else {
    if (!data[res.config.url].responseData[res.data.code]) { data[res.config.url].responseData[res.data.code] = res.data }
  }
}

//获取参数的名称和数据类型，生成表格格式，以缩进表示层次关系
let getReDataPart=function(data,type){
  let str=''

  //返回数据类型
  let g = function (a) {
    if((typeof a)=='object'){
      if(Array.isArray(a))
        return 'Array'
      else
        return 'Object'
    }
    else
      return typeof a
  }

  let n=function (n) {
    let str = ''
    for(let i=0;i<n;i++)
      str+='&emsp;'
    return str
  }

  //递归获取层次关系，数组支取第一个
  let f = function (obj,level) {
    if(g(obj)!='Object') return
    for (let i in obj) {
      if(type=='res')
        str += n(level)+i + '|-|' + g(obj[i]) + '|\n'
      else
        str+= n(level)+i + '|-|' + g(obj[i]) + '||\n'
      if(g(i)=='Object')
        f(i,level+1)
      if(g(obj[i])=='Array'&&obj[i].length>0)
        f(obj[i][0],level+1)
    }
  }

  f(data,0)

  return str

}

//获取代表成功信息的数据的key，没有就最后一个
let getSuccessResKey=function(res){
  let last
  for(let i in res){
    last = i
    if((i+'').indexOf('1')>-1)
      return i
  }
  return last
}

let generateApiDocMd=function (apis,type) {
  let str = ''
  for (let api in apis) {
    if(type!='all')
      str = ''

    let part1 = '# 1.\n\n- [ ] 前端已完成\n- [ ] 后端已完成\n\n- **接口说明**: \n- **请求地址**: `'+api+'`\n- **请求方式**: `'+apis[api].method.toUpperCase()+'`\n\n'

    let part2 = '请求参数名 | 请求参数 | 参数类型 | 是否必填 | 说明\n-|-|-|:-:|:-\n'
    part2 += getReDataPart(apis[api].requestData,'req')
    part2 += '## 请求值示例\n\n```json\n' + formatJson(apis[api].requestData) + '\n```\n\n'

    let part3 = '返回值名 | 返回值 | 参数类型 |  说明\n:-|:-:|:-|-\n'
    part3 += getReDataPart(apis[api].responseData[getSuccessResKey(apis[api].responseData)],'res')
    part3 += '## 返回值示例\n\n```json\n'
    let firstTag=true
    for(let item in apis[api].responseData){
      part3 += (firstTag?'':'\n\nOR\n\n')+formatJson(apis[api].responseData[item])
      firstTag=false
    }
    part3 += '\n```\n\n'

    str += part1 + part2 + part3
  }
  clipboard.writeText(str)
  console.log("api doc copyed")
}


let generate = function (data,res,type) {
  generateApiData(data,res)

  //type: all全部 默认最后一个
  generateApiDocMd(data,type)
}

export default generate
