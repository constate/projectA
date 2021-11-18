var express = require('express');
var router = express.Router();
var mysql = require('mysql');
/* GET home page. */

var pool = mysql.createPool({
  host: '127.0.0.1', user: 'project01', password: '1234',
  database: 'projectA', port: 3306
});

router.get("/", (res, req) => {
  req.redirect("/board/list/1");
});

//본인들이 데이터가져와서 작업하기 
router.get('/list/:page', function (req, res, next) {
  var userinfo = {
    user_id: req.session["user_id"],
    username: req.session["username"],
    email: req.session["email"]
  };

  var page = parseInt(req.params.page);
  var pageSize = 10;

  pool.getConnection((err, connection) => {
    var sql = `SELECT board_id, username writer, title, contents, hit,  DATE_FORMAT(regdate, "%Y-%m-%d" ) wdate 
            FROM tb_board A
            LEFT OUTER JOIN tb_member B ON A.write_id=B.member_id
            where 1=1 
            order by board_id desc 
            limit ${(page - 1) * pageSize}, ${pageSize} `;
    console.log(sql);

    connection.query(sql, (err, results) => {
      console.log(results);

      //db로 부터 데이터가 로딩된후 
      res.render('board/board_list', { userinfo: userinfo, boardList: results });
      connection.release();
    });
  });
});

router.use("/write", (req, res) => {
  var userinfo = {
    user_id: req.session["user_id"],
    username: req.session["username"],
    email: req.session["email"]
  };
  res.render("board/board_write.ejs", { userinfo: userinfo });
});


router.post("/save", (req, res) => {
  var write_id = req.body.write_id;
  var title = req.body.title;
  var contents = req.body.contents;
  console.log('save:', write_id, title, contents);

  // if (write_id == "") write_id = 13;

  pool.getConnection((err, connection) => {
    var sql = `INSERT INTO tb_board(write_id, title, contents, hit, regdate) VALUES 
                ( ${write_id}, '${title}', '${contents}', 0, NOW())
                `;
    console.log(sql);
    connection.query(sql, (err, results) => {
      console.log(results);
      res.redirect("/board/list/1");
      connection.release();
    });
  });
});

// view 조회수 업데이트
// view 내용 화면에 뿌리기
router.get('/view/:id', (req, res) => {
  const id = req.params.id;
  var userinfo = {
    user_id: req.session["user_id"],
    username: req.session["username"],
    email: req.session["email"]
  };

  const sql1 = `
    update tb_board set hit = hit +1 where board_id = ${id};
  `;
  console.log(sql1);

  const sql2 = `
  SELECT board_id, username writer, title, contents, hit,  DATE_FORMAT(regdate, "%Y-%m-%d" ) wdate 
  FROM tb_board A
  LEFT OUTER JOIN tb_member B ON A.write_id=B.member_id
  where board_id = ${id}
  `;
  console.log(sql2);

  pool.getConnection((err, connection) => {
    connection.query(sql1, (err, results) => {
      connection.query(sql2, (err, results) => {
        res.render('board/board_view', { userinfo: userinfo, board: results[0] });
        connection.release();
      });
    });
  });
});







module.exports = router;

