var http = require('http'),
    express = require('express'),
    app = express(),
    sqlite3 = require('sqlite3').verbose(),
    bodyParser = require('body-parser'),
    db = new sqlite3.Database('cozy');

/* We add configure directive to tell express to use Pug to
   render templates */
app.set('views', __dirname + '/views');
//app.engine('.html', require('pug').__express);
app.engine('pug', require('pug').__express);

// Allows express to get data from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='bookmarks'", function(err, row) {
    if(err !== null) {
        console.log(err);
    }
    else if(row == null) {
        db.run('CREATE TABLE "bookmarks" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "title" VARCHAR(255), url VARCHAR(255))', function(err) {
            if(err !== null) {
                console.log(err);
            }
            else {
                console.log("SQL Table 'bookmarks' initialized.");
            }
        });
    }
    else {
        console.log("SQL Table 'bookmarks' already initialized.");
    }
});

// We render the templates with the data
app.get('/', function(req, res) {

    db.all('SELECT * FROM bookmarks ORDER BY title', function(err, row) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.render('index.pug', {bookmarks: row}, function(err, html) {
                res.status(200).send(html);
            });
        }
    });
});

// We define a new route that will handle bookmark creation
app.post('/add', function(req, res) {
    title = req.body.title;
    url = req.body.url;
    sqlRequest = "INSERT INTO 'bookmarks' (title, url) VALUES('" + title + "', '" + url + "')"
    db.run(sqlRequest, function(err) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

// We define another route that will handle bookmark deletion
app.get('/delete/:id', function(req, res) {
    db.run("DELETE FROM bookmarks WHERE id='" + req.params.id + "'", function(err) {
        if(err !== null) {
            res.status(500).send("An error has occurred -- " + err);
        }
        else {
            res.redirect('back');
        }
    });
});

/* This will allow Cozy to run your app smoothly but
 it won't break other execution environment */
var port = process.env.PORT || 9250;
var host = process.env.HOST || "127.0.0.1";

// Starts the server itself
var server = http.createServer(app).listen(port, host, function() {
    console.log("Server listening to %s:%d within %s environment",
                host, port, app.get('env'));
});
