const express = require('express')
const JSEncrypt = require('node-jsencrypt');
const svgCaptcha = require('svg-captcha')
const redis = require('redis')
const { find, registerCheckUsername, register, list, deleteItem, addItem } = require('./utils')
const app = express()
var bodyParser = require('body-parser');

const client = redis.createClient();

client.on("error", function (err) {
    console.log("Error " + err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//token仓库
let tokenHistory = []
let captchaIdHistory = {}

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
function getTokenAuth(token) {
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
    if (tokenHistory[i].auth && now - tokenHistory[i].lastTime > 300000) {
      tokenHistory[i].auth = false
    }
  }
  if (tokenHistory.length) {
    console.log(tokenHistory)
  }
}, 10000)

//登陆
app.post('/login', async function (req, res) {
  let { username, password, captcha } = req.body

  let token = req.headers['token']

  let redisCaptcha = await new Promise( (resolve) => {
    client.get(token,function(err, res){
      return resolve(res);
    });
  });    
  console.log('login', redisCaptcha)
  if (captcha && captcha === redisCaptcha) {
  } else {
    res.send({
      code: 400,
      message: '验证码错误或过期'
    })
    return    
  }
  password = password.replace(/%2B/g, '+')
  let decrypt = new JSEncrypt()
  decrypt.setPrivateKey('MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCBlsrfdbHJOb6ZCWeukOGuVGVIyLnjNJUpQgK+HbfgN83n9Q65F3nFwhDXvNIZf+m21xkz3mlMm/UwcOPgW+MS1YDJfetMv/q0aLHJVma/lP3eiTpld7pkPIkhDmZutAUGHb+Kb3aA4j6IYh5tvQWKERgKqvULTyKT+mnGK2vr4OjtscvUtl5h1gBD+GChj0gjO3Y3lAGUU6Zowr32iZIhDda7qiN82VroQ1Z2ZbfLHDsXSwNZA43R2xhA6JTDwNDxRXkdYF//BuGlNYcqt9YCTeTNmEPUAUGG2fCRAq+XQdAuXeQ/9uMEOrShwWwK2iS9DHKsHVzQk6qXL17yHNT9AgMBAAECggEAT1IwvdU5zLUW0G/sUfMG4QFxubp75fICt21bZmmkao9d7vSWXX9cH0tpqdQ/OjKMqUlCePhTtfvkehEvut4jwRyEp1D3HVSJrbJD2LyVSgF136hZ4VAG/GH9gglhc7OnO5Yr7x3JCJzzr+F3RK6l3FwYPjdkpNZ8kN1/rzhW59syV5SSfZxhqS8j454tow6vdhjIHhsuZj/JR1yo6zp+Jgh1m/Js2tPq/3VtbhUsyWLbkUxZ0hFtlAIDhYYyu//9eHthEgelgXePXuPXTLb234PjTFs5gh17qiMozVJGuJLdOuw5SPggXkOwoM05yNyk1VcYVnA6PLh9uqy6J/vg4QKBgQDWuJh+qoFOniUH7DIob0LootQQZX8JEPu1opn308Ee3MurWImD8iB6Sgv4v1p5cggxz180uINf8CgfnKnRFY7iZE4rrHDhpepnJjc3EoFuBr4qOkKxt4+UpfpW+akingL6e2+TsE3hiWn7+anQ2CDHBtewb1zPmcEUCoXhGhwiyQKBgQCagHXXYKZkQP8ONt68d613cmnsarJ+A7WTPLsT9FdR/ue5f2XfLZieiJrz1XE3gNT0M4uGwQ1K5xGVDxAlDowICTR62bLTfcrlgDEabX7Ie6LoKHn94DuzYJp0hGIOoW/B/MUm1jGnabmRwd5fMN7kYkTHW76GOgCdtworFpzmlQKBgAKWmw/70i82bM/ZowklvjK7s7622n8rez1HRn/cR5mto67fFFlI0+dleRt4gwivvTWMgGNMThkb9f/bjZh9oAlOmDqii4HM1DSGG2hIitLetfAgX6lwwwRRs+DUhZtrODH4xvGK0IWFeIeXDNr9n/eGN5di4EWIXvF05wQ9olUxAoGAGFOnulzWdiyhvEw5b/VsE8WpFfeK2TqeSWujjTXI1flL5TJBCQ313OhndYMjC3k2jqjbDEGzZRrS8uRnR15uAAnrAHjspk5FNzOjB6U79Dc7ZFCTPL0kyU6pozUA94rFvQaeyEmrkc+cz212JQjd35n1eGpiqmHRnQOoDzbFR60CgYBYdZj0hYgVXVeSgZVWQGteLi46s/puRLgLZLjudqUZcQIq4GwBpVfSbsfuy+HjBc1GhlYpMp6ZZPzvPKasYyyFy2lgJj0AT7INuA9bnILYvqMzeCVL8RrEFrIGff64mxIMN/qE9uu+e9x2nWYdfXPfjaL6r7eOaZ59kE5UsCg/gA==')
  password = decrypt.decrypt(password)
  const data = await find(username)
  if (!data.password) {
    res.send({
      code: 400,
      message: '用户名不存在'
    })
    return
  }
  let dbPassword = data.password.replace(/%2B/g, '+')
  dbPassword = decrypt.decrypt(dbPassword)
  if (password === dbPassword) {
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
      message: '登陆密码错误'
    })
  }

})
app.get('/captcha', function (req, res) {
  var captcha = svgCaptcha.create({});
  let text = captcha.text.toLowerCase()
  captchaId = getID(10)
  let temp = {
    captchaId:　captchaId,
    captcha: captcha.data,
    text: text
  }
  captchaIdHistory[captchaId] = text
  client.set(captchaId, text, 'EX', 60)  //60秒后验证码过期知道
  client.get(captchaId, function (err,v) {
      console.log("图形验证码的值存入redis，值为：",v);
  })  
  res.send({
    code: 200,
    data: temp,
    message: '验证码'
  });
});

//注册
app.post('/register', async function (req, res) {
  let { username, password } = req.body
  console.log(username)
  const checkeUsername = await registerCheckUsername(username)
  console.log(checkeUsername)
  if (checkeUsername.username) {
    res.send({
      code: 400,
      message: '用户名已存在'
    })
  } else {
    let uid = getID(10)
    const data = await register(uid, username, password)
    console.log(data)
    if (data) {
      res.send({
        code: 200,
        message: '注册成功'
      })
    } else {
      res.send({
        code: 400,
        message: '注册失败'
      })
    }
  }
})

//获取加班列表数据
app.get('/getlist', async function (req, res) {
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
app.post('/deleteItem', async function (req, res) {
  let { applicationNumber } = req.body
  const data = await deleteItem(applicationNumber)
  res.send(({
    code: 200,
    data: data,
    message: '删除成功'
  }))
})
//添加列表数据
app.post('/addItem', async function (req, res) {
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

const server = app.listen(8888, function () {
  console.log('服务器启动成功，端口是8888')
})