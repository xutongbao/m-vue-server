const mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'demo' //数据库
});

connection.connect((error) => {
  if (error) {
    console.log('数据库连接失败,详情：', error)
  } else {
    console.log('数据库连接成功')
  }
})

//登陆
const find = (nickname, password) => {
  return new Promise((resolve, reject) => {
    connection.query('select nickname from user where nickname=? and password=?', [
      nickname, password
    ], (error, res) => {
      if (!error) {
        resolve({ ...res[0] })
      } else {
        reject(error)
      }
    })
  })
}

//检查用户名是否被占用
const registerCheckUsername = (nickname) => {
  return new Promise((resolve, reject) => {
    connection.query('select nickname from user where nickname=?', [
      nickname
    ], (error, res) => {
      if (!error) {
        resolve({ ...res[0] })
      } else {
        reject(error)
      }
    })
  })
}

//注册
const register = (uid, username, password) => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO user VALUES ('${uid}', '${username}', '${password}');`, [
    ], (error, res) => {
      if (!error) {
        resolve(true)
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

const list = () => {
  return new Promise((resolve, reject) => {
    connection.query('select * from overtime', [
    ], (error, res) => {
      if (!error) {
        resolve(sqlListToObject(res))
      } else {
        reject(error)
      }
    })
  })
}

const deleteItem = (applicationNumber) => {
  return new Promise((resolve, reject) => {
    connection.query('delete from overtime where applicationNumber=?', [
      applicationNumber
    ], (error, res) => {
      if (!error) {
        resolve(res)
      } else {
        reject(error)
      }
    })
  })  
}

const addItem = (applicationNumber, nickname) => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO overtime VALUES ('${applicationNumber}', '${nickname}', '2', '2019-05-23 00:00:00', '2019-05-24 00:00:00')`, [
    ], (error, res) => {
      if (!error) {
        resolve(res)
      } else {
        reject(error)
      }
    })
  })   
}

module.exports = {
  find,
  registerCheckUsername,
  register,
  list,
  deleteItem,
  addItem,
}