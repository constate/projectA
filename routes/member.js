const express = require('express');
const router = express.Router();
const mysql = require('mysql');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'project01',
  password: '1234',
  database: 'projectA',
  port: 3306
});

router.get('/', (req, res) => {
  res.render('member/member_register.ejs');
});

// http://127.0.0.1:4000/member/register_form
router.get('/register_form', (req, res) => {
  const userInfo = {
    user_id: req.session['user_id'],
    username: req.session['username'],
    email: req.session['email'],
  };
  res.render('member/member_register', { userInfo: userInfo }); // views/member/member_register.ejs를 불러와서 렌더
});

// http://127.0.0.1:4000/member/register
router.post('/register', (req, res) => {
  const userId = req.body['user_id'];
  const password = req.body.password;
  const password2 = req.body.password2;
  const username = req.body.username;
  const nickname = req.body.nickname;
  const email = req.body.email;
  const phone = req.body.phone;
  const zipcode = req.body.zipcode;
  const address1 = req.body.address1;
  const address2 = req.body.address2;

  pool.getConnection((err, connection) => {
    const sql = `
        insert into tb_member(user_id, password, username, nickname, email, phone, zipcode, address1, address2, wdate)
        values(
          '${userId}','${password}','${username}','${nickname}','${email}','${phone}','${zipcode}','${address1}','${address2}', now()
        )
      `;
    console.log(sql);
    connection.query(sql, (err, result) => {
      // console.log('err', err.code);
      console.log('result', result);
      // res.redirect('/');
      res.send({ 'result': 'success' });
      connection.release();
    });
  });
});

// http://127.0.0.1:4000/member/idcheck
router.post('/idcheck', (req, res) => {
  const userId = req.body['user_id'];
  pool.getConnection((err, connection) => {
    const sql = `
    SELECT count(*) cnt 
    FROM tb_member 
    WHERE user_id='${userId}'
    `;
    console.log(sql);
    connection.query(sql, (err, results) => {
      const result = parseInt(results[0]['cnt']);
      if (result === 0) {
        res.send({ 'result': 'success' });
      } else {
        res.send({ 'result': 'fail' });
      }
      connection.release();
    });
  });
});

// http://127.0.0.1:3000/member/logon_form - GET
router.get('/logon_form', (req, res) => {
  res.render('member/member_logon');
});


// http://127.0.0.1:3000/member/logon - POST
router.post('/logon', (req, res) => {
  const userId = req.body['user_id'];
  const password = req.body.password;

  pool.getConnection((err, connection) => {
    const sql = `
      select user_id, password, username,email
      from tb_member
      where user_id='${userId}'
      `;
    console.log(sql);
    connection.query(sql, (err, results) => {
      if (results.length === 0) {
        res.send({ 'result': '3' }); // 아이디조차 없는 경우
      } else {
        if (password === results[0]['password']) {
          req.session['user_id'] = results[0]['user_id'];
          req.session['username'] = results[0]['username'];
          req.session['email'] = results[0]['email'];
          res.send({ 'result': '1' });
        } else {
          res.send({ 'result': '2' }); // 아이디는 맞는데 패스워드가 틀린경우
        }
      }
      connection.release();
    });
  });
});

router.use('/logout', (req, res) => {
  req.session.destroy(); // 세션 없애기
  res.redirect('/');
});


// module을 내보내야 다른 파일에서 이 파일의 router에 접근 가능
module.exports = router;