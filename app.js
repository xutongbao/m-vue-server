const express = require('express')
const { find, list, deleteItem, addItem } = require('./utils')
const app = express()
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS'); //设置方法
  res.header('Access-Control-Max-Age', '1000'); // 1000s之内，不需要再发送预请求进行验证了，时间内直接发正式请求
  next()
})

app.post('/login', async function(req, res) {
  let { username, password } = req.body
  const data = await find(username, password)
  console.log(data)
  if (data.nickname) {
    res.send({
      code: 200,
      data: {
        username: username
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

app.get('/getlist', async function(req, res) {
  //let { type } = req.query
  const data = await list()
  res.send(({
    code: 200,
    data: data,
    message: '列表'
  }))
})

app.post('/deleteItem', async function(req, res) {
  let { applicationNumber } = req.body
  const data = await deleteItem(applicationNumber)
  res.send(({
    code: 200,
    data: data,
    message: '删除成功'
  }))  
})

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

const server = app.listen(8888, function() {
  console.log('成功')
})