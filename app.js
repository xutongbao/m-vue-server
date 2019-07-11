const express = require('express')
//const JSEncrypt = require('jsencrypt')
const JSEncrypt = require('node-jsencrypt');
const NodeRSA = require('node-rsa')
const fs = require('fs')
const { find, list, deleteItem, addItem } = require('./utils')
const app = express()
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//token仓库
let tokenHistory = []

//允许跨域
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); //设置方法
  res.header('Access-Control-Max-Age', '1000'); // 1000s之内，不需要再发送预请求进行验证了，时间内直接发正式请求
  next()
})

//生成token
function getID(length) {
  return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
}

//获取token是否过期
function getTokenAuth (token) {
  for (let i = 0; i < tokenHistory.length; i++) {
    if (tokenHistory[i].token === token) {
      if (tokenHistory[i].auth) {
        tokenHistory[i].lastTime = new Date().getTime()
      }
      return tokenHistory[i].auth
    }
  }
  return false;
}

//删除过期的token
function deleteTokenHistory(token) {
  for (let i = 0; i < tokenHistory.length; i++) {
    if (tokenHistory[i].token === token) {
      tokenHistory.splice(i, 1)
    }
  }
}

//定时检查token是否过期
setInterval(() => {
  let now = new Date().getTime()
  for (let i = 0; i < tokenHistory.length; i++) {
    if (tokenHistory[i].auth && now - tokenHistory[i].lastTime > 30000) {
      tokenHistory[i].auth = false
    }
  }
  if (tokenHistory.length) {
    console.log(tokenHistory)
  }
}, 10000)

//登陆
app.post('/login', async function(req, res) {
  let { username, password } = req.body
  console.log(password)
  password = password.replace(/%2B/g, '+')
  console.log(password)
  var decrypt = new JSEncrypt();
  decrypt.setPrivateKey(`MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsocnr8cv+BYaJNuGZLjie78cdg3xnKhDIADvpbaUTK7+IQucrhup6/V7jRO/ZvOgF7Dy0KlTCW7TAClRCoMJVAYQl4W9lt1yp0eQMyFG2k+mQM35MrQrL4bIlBdN1Z/lxFjx13j5stFNAvBzmTHBGJu+8RTL+cFgqfDe6xa58KQ3i8aqorw3LSoft5fwx9bRwjhJ9Uz+DbnHbqcxZbPDbTotTN4iumQc8qtQQc7UYCEgNnk1pGvK8FeWc8KJxZma+zgzqEmxEBrtS6vz7pouBuNuACq3n2emNEI4O/9MK4/9laujngYg585V8rif+aiF4sW11ihoLNVDBLV/PN1wpAgMBAAECggEBAIb0zEhZ9SGW7EAk2WTJD5ag2Man3f9AkXHpTO0FvIEqOEesFdCfXnvby+xcHi3YUoMe1a37UdvHmZxv9sNHreSKlOaQQGgCWryfy2p6x/a112fV+ayzsrcEsCHlVhR4vja8LXPv1Fli95qp9OXNaBBPrCdA6cajySkdhuvKUsfYf1f70AjUo2O9B2jkJta39LJuU4bKZqXdJNEb0O4c2tR/fUDK3V7rJpO3zIdOTBPsSOoDg/or/0SbIQ//V8vCFiOPg96M+uCjdBYdHGQbaXWahtKYtbQVHpGecFCBfOY4ITR6PDvmxNV37jc45tE2o9rKzvL0UZ8qAXcClj8PnSECgYEA3R++q2LOWhiA1Z1iwO7NwN+HUh/ZNr8juKu/9whQtXAwBVdU8B5NZLGmyBlHzfnea4u7NttkXjA3Perx7G+CR8Ur1zANJOvYsfFdDNyt6rEmxaKtQ9rPN4U/zj5LylXcnTTfAiVnMKFgcbMIfPBfOwYarzrqHWUXqlDHOmwLKn0CgYEAx9wYzfFH0oaqQv0j4ttPoMUBuZgUATr+fZhw2nlI4LOwf2gpo1FN/vKD4/8csiwApQCzYTxMIj0//fjtA4U5dv+Z9UyRraX/Gqv4EzEM2M/9uMfpVv/oCQJS9AGAeKJgRwO/wN9ojnp2AC+BAJjz+uWZYfOTZwLGsds84I4LfB0CgYEA2ynnlX7s/6dhqle/1XHbRNtICEHAzN5NzW+NaI85T1vOfLy+Vu/xzWe24oUMAj8yEG4CNLDmneQ0HI6NEcbD3dazSSk7HekUcenETEc9qWvD/gbqrGJnF6ReRVDBVd4cN0R79GiWCkEokgjc1Nh5ysqWEC/YcyILfqdpj6IevxECgYAR0AMB79w33jq0h704DdXV/Vj/Apfd2DUwWnLMdfzR0hIL+OulG6z46QJqQqV7F8Li8eIK64XZk13ts87j/m61tWgyXaWqNV48MVGF3FxJwpfZbS/Vyi8TBnsANlYN6mLsUWA4v3ChKjb0I0e7Fua/2NDH0x6zEqNE3MZbOS263QKBgD8dpyWpqukad5CzdQB43BG+oVMhBbzo1RAGeccDmcOO2r2wWR4fONw8h+S3L1xAbFq2qyuzo7n45oVJfWtfIwhgGHa4tyYJO28jIP/Cf9HfuuQCwauC3PWLbdxIXgq66bEVjwgT8yR/OOq81GZ7rBm+wJnutDKhdS2IeDcQQrFr`);
  password = decrypt.decrypt(password);  
  console.log(password)

  const data = await find(username, password)
  if (data.nickname) {
    let token = getID(10)

    tokenHistory.push({
      token: token,
      lastTime: new Date().getTime(),
      auth: true
    })

    res.send({
      code: 200,
      data: {
        username: username,
        token: token,
      },
      message: '登陆成功'
    })
  } else {
    res.send({
      code: 400,
      message: '登陆失败'
    })
  }
})
//获取加班列表数据
app.get('/getlist', async function(req, res) {
  //let { type } = req.query
  
  const data = await list()
  let token = req.headers['token']
  console.log(token)
  
  let auth = getTokenAuth(token)
  console.log(auth)
  if (auth) {
    res.send(({
      code: 200,
      data: data,
      message: '列表'
    }))
  } else {
    deleteTokenHistory(token)
    res.send(({
      code: 403,
      message: '无权限'
    }))    
  }
})
//删除列表数据
app.post('/deleteItem', async function(req, res) {
  let { applicationNumber } = req.body
  const data = await deleteItem(applicationNumber)
  res.send(({
    code: 200,
    data: data,
    message: '删除成功'
  }))  
})
//添加列表数据
app.post('/addItem', async function(req, res) {
  let { applicationNumber, nickname } = req.body
  console.log(nickname)
  const data = await addItem(applicationNumber, nickname)
  console.log(applicationNumber)
  res.send(({
    code: 200,
    data: data,
    message: '增加成功'
  }))  
})
//修改列表数据
// app.post('/updateItem', async function(req, res) {
//   let { applicationNumber, nickname } = req.body
//   const data = await 
// })

const server = app.listen(8888, function() {
  console.log('服务器启动成功，端口是8888')
})