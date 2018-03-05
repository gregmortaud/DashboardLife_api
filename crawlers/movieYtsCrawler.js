var waterfall = require('async-waterfall');
var Crawler = require("crawler");
var async = require("async");
var mysql = require('mysql');

const config = require('./configCrawlers.js');
const env = process.env.NODE_ENV || 'development';

var storage = [];
var movies = [];
var nbMovieCrawled = 0;

var db = null;

var host = 'localhost';
var dbName = 'dashlife';
var username = 'root';
var password = 'root';
var port = '8889';

if (env == 'development') {
  console.log("Env development - movieYtsCrawler");
} else if (env == 'production') {
  console.log("Env production - movieYtsCrawler");
  host = config.host;
  dbName = config.dbName;
  username = config.username;
  port = config.port;
  password = config.password;
}

var logger = function (level, message)
{
	level = (level || "") + "";
	message = (message || "") + "";

	console.log('{"level":"' + level.toUpperCase() + '", "site": "yts.am/yify", "message": "' + message + '"}');
};

function removeExistingMovies(callback) {
	db.query('SELECT * FROM movie', (err,rows) => {
	  if(err) throw err;

		var i = 0;
		async.whilst(
			function () { return i < rows.length },
			function (callLoop) {
				logger("info", "Checking duplicate for: " + rows[i].name);

				var i2 = 0;
				async.whilst(
					function () { return i2 < movies.length },
					function (callLoop2) {
						logger("info", "Checking duplicate for: " + rows[i].name + " with " + movies[i2].name);
						if (rows[i].name == movies[i2].name) {
							logger("info", "Duplicate found for: " + rows[i].name);
							movies.splice(i2,1);
						}
						i2 ++;
						callLoop2();
					},
					function (err) {
						if (err) {
							logger("error", "Checking duplicate for: " + rows[i].name + " failed");
						}
						i ++;
						callLoop();
					}
				);
			},
			function (err) {
				if (err) {
					logger("error", "Remove existing movies failed");
				}
				callback();
			}
		);
	});
}

function insertDatabase(callback) {
  console.log("-------------");
  console.log(host);
  console.log(username);
  console.log(password);
  console.log(dbName);
  console.log(port);
	const con = mysql.createConnection({
	  host: host,
	  user: username,
	  password: password,
		database: dbName,
    port: port
	});

	con.connect(function(err) {
	  if (err) {
			logger("error", "Connection database failed");
			console.log(err);
			callback();
			return ;
		}
		logger("info", "Connection database successful");
		db = con;
		callback();
		return ;
	});
	return ;
}

function selectDownloadLink(listLinks, callback) {
	var i = 0;
  // console.log('---- length: ' + listLinks.length);
	async.whilst(
		function () { return i < listLinks.length },
		function (callLoop) {
			var regexp = / 720p /ig;
			var exp = regexp.exec(listLinks[i].attribs.title);
      // console.log('---- listLinks[i]: ' + i + " - " + listLinks[i].attribs.title);
      // console.log('---- exp: ' + exp);
			if (exp) {
				callback(listLinks[i].attribs.href);
				return ;
			}
			i ++;
			callLoop();
		},
		function (err) {
			callback(null);
		}
	)
}

function moviePage(urlMovie, callback) {
	var crawlMovie = new Crawler({
	    maxConnections : 10,
	    callback : function (error, res, done) {
	        if(error){
	            console.log(error);
              callback();
              done();
              return ;

	        } else {
	            var $ = res.$;
							var tmp = $("#movie-info")[0];
							var name = $(tmp).find("h1").text().trim();
              debugger;
							if (name) {
								var year = $("#movie-info h2")[0].children[0].data;

								tmp = $("#movie-info p")[0];
								selectDownloadLink($(tmp).find("a"), function(linkDl) {
									if (linkDl == null) {
										logger("error", "No link_download found");
										callback();
										done();
										return ;
									}
									var link_download = linkDl;
									var link_img = null;
									$("img.img-responsive")[1] == null ? link_img = $("img.img-responsive")[0].attribs.src : link_img = $("img.img-responsive")[1].attribs.src;
									var synopsis = $("#synopsis p")[1].children[0].data;
									movies.push({
										"name": name,
										"year": year,
										"link_download": link_download,
										"link_img": link_img,
										"synopsis": synopsis,
										"viewed": 0
									});
                  callback();
                  done();
                  return ;
								});
							}
							else {
								logger("error", "Movie not available detected");
                callback();
                done();
                return ;
							}
	        }
	    }
	});

	crawlMovie.queue({
		uri:urlMovie,
		param1:callback
	});
}

var crawlHomePage = new Crawler({
    maxConnections : 10,
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
						storage.listMovies = $("div.browse-movie-wrap a.browse-movie-link");
        }
				res.options.param1();
        done();
    }
});

var crawlYts = function(cb)
{
  logger("info", "Crawler starting");
	waterfall([
	  function(callback){
			logger("info", "Crawl HomePage");
			crawlHomePage.queue({
		    uri:"https://yts.am/yify",
		    param1:callback
			});
	  },
    function(callback){
			var i = 0;
			async.whilst(
				function () { return i < storage.listMovies.length; },
				function (cbLoop) {
					logger("info", "Crawling movie page " + (i+1) + "/" + storage.listMovies.length + " : " + storage.listMovies[i].attribs.href);
					moviePage(storage.listMovies[i].attribs.href, function() {
						i++;
						cbLoop();
            return ;
					});
				},
				function () {
					callback();
					return ;
				}
			);
	  },
		function(callback) {
			insertDatabase(function() {
				if (db == null) {
					cb();
					return ;
				}
				removeExistingMovies(function() {
					var i = 0;
					async.whilst(
						function () { return i < movies.length; },
						function (cbLoop) {
							logger("info", "Insert movie to database " + (i+1) + "/" + movies.length);

							db.query('INSERT INTO movie SET ?', movies[i], (err, res) => {
	  					if(err) throw err;
							});

							i++;
							cbLoop();
							return ;
						},
						function () {
							db.query('UPDATE general_stat SET newMovies = ?', movies.length, (err, res) => {
	  						if(err) throw err;
							});
							callback();
							return ;
						}
					);
					db.end();
					return ;
				});
			});
		},
	], function (err) {
		logger("info", "Crawler Done");
    cb();
    return ;
	});
};

exports.crawl = crawlYts;

// crawlYts(function (e)
// {
// 	console.log("--------------------------Crawler Done-----------------------------");
// });
