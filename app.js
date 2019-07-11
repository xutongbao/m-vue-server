const express = require('express')
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
  const data = await find(username, password)
  console.log(data)
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