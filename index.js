const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const app = express()
const userKey = 'thisisverysecretkey'
const adminKey = 'thisisverysecretkey'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "covid"
})

db.connect((err) => {
    if (err) throw err
    console.log('Database Terkoneksi')
})

/************** JWT USER ***************/
const authUser = (request, result, next) => {
    if (typeof(request.headers['user']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Error. Token Tidak Ada Atau Token Tidak Valid!'
        })
    }

    let token = request.headers['user']

    jwt.verify(token, userKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Error. Token Tidak Ada Atau Token Tidak Valid!'
            })
        }
    })

    next()
}

/************** HOMEPAGE ***************/
app.get('/', (request, result) => {
    result.json({
        success: true,
        message: 'Selamat Datang!, Silahkan Register Atau Login!'
    })
})

/************** REGISTER USER ***************/
app.post('/register', (request, result) => {
    let data = request.body

    let sql = `
        insert into user (nama, email, password)
        values ('`+data.nama+`', '`+data.email+`', '`+data.password+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Akun Anda Berhasil Didaftarkan!'
    })
})

/************** LOGIN USER ***************/
app.post('/login', function(request, result) {
  let data = request.body
	var email = data.email;
	var password = data.password;
	if (email && password) {
		db.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.email + '|' +data.password, userKey)
        result.json({
          success: true,
          message: 'Login Sukses!',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Kredensial Tidak Valid!',
        });
			}
			result.end();
		});
	}
});


/************** GET SEMUA PASIEN ***************/
app.get('/pasien/all', authUser, (req, res) => {
    let sql = `
        select * from pasien
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Sukses Memuat Semua Pasien!',
            data: result
        })
    })
})

/************** GET PASIEN DENGAN ID ***************/
app.get('/pasien/:id', authUser, (req, res) => {
    let sql = `
        select * from pasien
        where id_pasien = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Sukses Mendapatkan Detail Pasien",
            data: result[0]
        })
    })
})

/************** BAGIAN ADMIN ***************/
/************** BAGIAN ADMIN ***************/
/************** BAGIAN ADMIN ***************/

/************** JWT ADMIN ***************/
const authAdmin = (request, result, next) => {
    if (typeof(request.headers['admin']) == 'undefined') {
        return result.status(403).json({
            success: false,
            message: 'Error. Token Tidak Ada Atau Token Tidak Valid!'
        })
    }

    let token = request.headers['admin']

    jwt.verify(token, adminKey, (err, decoded) => {
        if (err) {
            return result.status(401).json({
                success: false,
                message: 'Error. Token Tidak Ada Atau Token Tidak Valid!'
            })
        }
    })

    next()
}

/************** LOGIN ADMIN ***************/
app.post('/login/admin', function(request, result) {
  let data = request.body
	var email = data.email;
	var password = data.password;
	if (email && password) {
		db.query('SELECT * FROM admin WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
        let token = jwt.sign(data.email + '|' +data.password, adminKey)
        result.json({
          success: true,
          message: 'Login Sebagai Admin Sukses!',
          token: token
        });
			} else {
				result.json({
          success: false,
          message: 'Kredensial Tidak Valid!',
        });
			}
			result.end();
		});
	}
});

/************** TAMBAH PASIEN ***************/
app.post('/admin/pasien/add', authAdmin, (request, result) => {
    let data = request.body

    let sql = `
        insert into pasien(nama, umur)
        values ('`+data.nama+`', '`+data.umur+`');
    `

    db.query(sql, (err, result) => {
        if (err) throw err
    })

    result.json({
        success: true,
        message: 'Data Pasien Sukses Didaftarkan!'
    })
})

/************** GET SEMUA PASIEN ***************/
app.get('/admin/pasien/all', authAdmin, (req, res) => {
    let sql = `
        select * from pasien
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            success: true,
            message: 'Sukses Memuat Semua Pasien!',
            data: result
        })
    })
})

/************** GET PATIENT BY ID ***************/
app.get('/admin/pasien/:id', authAdmin, (req, res) => {
    let sql = `
        select * from pasien
        where id_pasien = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "Sukses Mendapatkan Detail Pasien",
            data: result[0]
        })
    })
})

/************** PORT ***************/
app.listen(6009, () => {
    console.log('App is running on port 6009!')
})
