const mysql = require('mysql')

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
    connection.query('delete  from overtime where applicationNumber=?', [
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

const addItem = (applicationNumber) => {
  return new Promise((resolve, reject) => {
    connection.query(`INSERT INTO overtime VALUES ('${applicationNumber}', '3a9f12z1ey200003a9f12z1ey20000', '2', '2019-05-23 00:00:00', '2019-05-24 00:00:00', 'adasdasd', '[\"/uploads/img-1558536899548.jpg\",\"/uploads/img-1558536903953.jpg\"]', '1', '[{\"avatar\":\"https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2814109303,2147705560&fm=27&gp=0.jpg\",\"nickname\":\"刘大雨\",\"email\":null,\"phone\":\"13683599382\",\"wechat\":null,\"remark\":\"同意\",\"status\":1}]', '2019-05-22 22:55:05', 'overtime')`, [
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
  list,
  deleteItem,
  addItem,
}