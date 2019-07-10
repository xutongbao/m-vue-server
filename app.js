const express = require('express')
const mysql = require('mysql')
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

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'starbucks' //数据库
});

connection.connect((error) => {
  if (error) {
    console.log('数据库连接失败,详情：', error)
  } else {
    console.log('数据库连接成功')
  }
})

const find = (phone, password) => {
  return new Promise((resolve, reject) => {
    connection.query('select nickname from user where phone=? and password=?', [
      phone, password
    ], (error, res) => {
      if (!error) {
        console.log(phone, password)
        resolve({ ...res[0] })
      } else {
        reject(error)
      }
    })
  })
}

const sqlListToObject = (array) => {
  return array.map((item) => {
    const obj = {}
    for (let key in item) {
      try {
        obj[key] = JSON.parse(item[key])
      } catch (e) {
        obj[key] = item[key]
      }
    }
    return obj
  })
}

const list = (type) => {
  return new Promise((resolve, reject) => {
    connection.query('select * from overtime where type=?', [
      type
    ], (error, res) => {
      if (!error) {
        resolve(sqlListToObject(res))
      } else {
        reject(error)
      }
    })
  })
}

app.post('/login', async function(req, res) {
  let { username, password } = req.body
  const data = await find(username, password)
  console.log(data)
  if (data.nickname) {
    res.send({
      code: 200,
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
  let { type } = req.query
  const data = await list(type)
  console.log(type)
  console.log(data)
  res.send(({
    code: 200,
    data: data,
    message: '列表'
  }))
})

// app.get('/getlist', async function(req, res) {
//   let { type } = req.query
//   //const list = await select({})
//   console.log(list)
// })

const server = app.listen(8888, function() {
  console.log('成功')
})