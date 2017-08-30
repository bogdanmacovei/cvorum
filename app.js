var mysql = require('mysql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/views'));

var server = app.listen(process.env.PORT||8000, function(){
	console.log('Connected to server on port ' + server.address().port);
});

var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'rootpass',
	database: 'mydb'
});

conn.connect(function(err){
	if(err)
		throw err;
	console.log('Connected to mysql');
});

conn.query(
	'CREATE TABLE IF NOT EXISTS user1 \
	(\
		id int AUTO_INCREMENT PRIMARY KEY,\
		first_name VARCHAR(20) NOT NULL,\
		last_name VARCHAR(20) NOT NULL,\
		user_name VARCHAR(20) NOT NULL,\
		password VARCHAR(30) NOT NULL\
	)',
	function(err, res){
		if(err)
			throw err;
		console.log(res);
});

conn.query(
	'CREATE TABLE IF NOT EXISTS post\
	(\
		id int AUTO_INCREMENT PRIMARY KEY,\
		title VARCHAR(50) NOT NULL,\
		content VARCHAR(300),\
		date VARCHAR(20),\
		user_id int REFERENCES user(id)\
	)',
	function(err, res){
		if(err) throw err;
		console.log(res);
});

conn.query(
	'CREATE TABLE IF NOT EXISTS comment\
	(\
		id int AUTO_INCREMENT PRIMARY KEY,\
		comment VARCHAR(300),\
		date VARCHAR(20),\
		user_id int REFERENCES user(id),\
		post_id int REFERENCES post(id)\
	)',
	function(err, res){
		if(err) throw err;
		console.log(res);
});


// conn.query(
// 	'ALTER TABLE user1\
// 	ADD joined VARCHAR(20),\
// 	ADD birth_date VARCHAR(20),\
// 	ADD country VARCHAR(20),\
// 	ADD short_description VARCHAR(300),\
// 	ADD img VARCHAR(100)',
// 	function(err, res){
// 		if(err) throw err;
// 		console.log(res);
// });

conn.query('SELECT * FROM user1', function(err, res) {
	if(err) throw err;
	console.log(res);
});


//get pages
app.get('/register', function(req, res){
	res.sendFile(__dirname + '/views/register.html');
});

app.get('/login', function(req, res){
	res.sendFile(__dirname + '/views/login.html');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/views/mainpage.html');
});

app.get('/browse', function(req, res){
	res.sendFile(__dirname + '/views/browse.html');
});

app.get('/post', function(req, res){
	res.sendFile(__dirname + '/views/post.html');
});

app.get('/profile', function(req, res){
	res.sendFile(__dirname + '/views/profile.html');
});


//get user
app.get('/selectuserwhere/:name', function(req, res) {
	conn.query('SELECT id, password FROM user1 WHERE user_name = ?', req.params.name, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

app.get('/selectuserbyid/:id', function(req, res) {
	conn.query('SELECT first_name, img FROM user1 WHERE id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

app.get('/selectalluserbyid/:id', function(req, res) {
	conn.query('SELECT first_name, last_name, user_name, joined, img, country, short_description, birth_date\
	 			FROM user1 WHERE id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

// select * from post

app.get('/selectpost', function(req, res){
	conn.query('SELECT * FROM post', function(err, result) {
		if (err) throw err;
		res.send(result);
	});
});

//get post / user
app.get('/selectallpost', function(req, res){
	conn.query(
		'SELECT b.title, b.content, b.date, a.user_name, b.id, b.user_id\
		FROM user1 a, post b\
		WHERE a.id = b.user_id',
		function(err, result){
			if(err) throw err;
			res.send(result);
		});
});

//get delete post
app.get('/deletepost/:id', function(req, res){
	conn.query('DELETE FROM post WHERE id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

//get detele comment
app.get('/deletecomment/:id', function(req, res){
	conn.query('DELETE FROM comment WHERE id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

//get detele comment from a specific post
app.get('/deletecommentpost/:id', function(req, res){
	conn.query('DELETE FROM comment WHERE post_id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});


//get post by post id
app.get('/post/:id', function(req, res){
	conn.query('SELECT a.*, b.* FROM post b, user1 a WHERE a.id = b.user_id AND b.id = ?', req.params.id, function(err, result){
		if(err) throw err;
		res.send(result);
	});
});

//get comments by page id

app.get('/selectallcomments/:pid', function(req, res){
	conn.query('SELECT c.comment, c.date, a.user_name, a.img, c.user_id, c.id\
				FROM user1 a, post b, comment c\
				WHERE c.post_id = b.id AND c.user_id = a.id AND c.post_id = ?', req.params.pid, function(err, result){
					if(err) throw err;
					res.send(result);
				});
});

// get comments by user id

app.get('/selectallcommentsuser/:uid', function(req, res) {
	conn.query('SELECT c.comment, c.date, b.title, b.id\
				FROM user1 a, post b, comment c\
				WHERE c.user_id = a.id AND c.post_id = b.id AND a.id = ? ORDER BY c.date DESC', req.params.uid, function(err, result) {
					if (err) throw err;
					res.send(result);
				});
});

// get posts by user id

app.get('/selectallpostsuser/:uid', function(req, res) {
	conn.query('SELECT b.title, b.id, b.date\
				FROM user1 a, post b\
				WHERE a.id = b.user_id AND a.id = ? ORDER BY b.date DESC', req.params.uid, function(err, result) {
					if (err) throw err;
					res.send(result);
				});
});


//post user
app.post('/insertuser', function(req, res){
	var arr = [[req.body.fn, req.body.ln, req.body.un, req.body.pw, req.body.jd]];
	
	conn.query('INSERT INTO user1 (first_name, last_name, user_name, password, joined) VALUES ?', [arr], function(err, result){
		if(err) 
			throw err;
	});
	res.end();
});


//post content
app.post('/insertpost', function(req, res){
	var txt = '\"' + req.body.title + '\", \"' + req.body.content + '\", \"' + req.body.user_id + '\", \"'
	 + req.body._date + '\"';
	var sql = 'INSERT INTO post(title, content, user_id, date) VALUES(' + txt + ')';
	console.log(sql);
	conn.query(sql, function(err, result){
		if(err) throw err;
	});
	res.end();
});

//post comment 

app.post('/insertcomment', function (req, res){
	var txt = '\"' + req.body.comment + '\", \"' + req.body._date + '\", \"' + req.body.user_id + '\", \"' + req.body.post_id + '\"';
	var sql = 'INSERT INTO comment (comment, date, user_id, post_id) VALUES (' + txt + ')';

	conn.query(sql, function(err, result){
		if(err) throw err;
	});
	res.end();
});

app.post('/updateuser', function(req, res) {
	var sql = 'UPDATE user1 SET img = ' + '"' + req.body.img + '", ' + 
				 'short_description = ' + '"' + req.body.description + '", ' + 
				           'country = ' + '"' + req.body.country + '", ' + 
				        'birth_date = ' + '"' + req.body.birth_date + '" WHERE id = ' + '"' + req.body.id + '"';

	console.log(sql);

	conn.query(sql, function(err, result) {
		if (err) throw err;
	});

	res.end();

});