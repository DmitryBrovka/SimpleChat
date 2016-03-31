var http = require("http");
var ws = require("nodejs-websocket");

var fs = require("fs"), path = require("path"), url = require("url");

http.createServer(function(request,response){
	var my_path = url.parse(request.url).pathname === '/' ? '/index.html' : url.parse(request.url).pathname;
	var full_path = path.join(process.cwd(),my_path);

	fs.exists(full_path,function(exists){
		if(!exists){
			response.writeHeader(404, {"Content-Type": "text/plain"});  
			response.write("404 Not Found\n");  
			response.end();
		}
		else{
			fs.readFile(full_path, "binary", function(err, file) {  
				if(err) {  
					response.writeHeader(500, {"Content-Type": "text/plain"});  
					response.write(err + "\n");  
					response.end();  
				}  
				else{
					response.writeHeader(200);  
					response.write(file, "binary");
					response.end();
				}
			});
		}
	});
}).listen(8080);


var nicknames = [], history = [];
var server = ws.createServer(function (connection) {
	connection.nickname = null;
	connection.on("text", function (str) {
		var toHistory = {"timestamp": Math.floor(Date.now())};
		var updateNicks = false;
		if (connection.nickname === null) {
			for (var i=0; i<nicknames.length; i++){
				if (nicknames[i] == str){
					errTakenNick(connection);
					return false;
				}
			}
			nicknames.push(str);

			updateNicks = true;
			connection.nickname = str;
			toHistory.text = "entered";
			toHistory.system = "true";
			loadHistory(connection);
		} else {
			toHistory.text = str;
		}

		toHistory.author = connection.nickname;
		history.push(toHistory);
		broadcast(toHistory, updateNicks);
	});
	connection.on("close", function (data) {
		if (connection && connection.nickname){
			var currentIndex = nicknames.findIndex(x => x == connection.nickname);
			var toHistory = {
				"author": connection.nickname,
				"timestamp": Math.floor(Date.now()),
				"text": "left our chat",
				"system": "true"
			}

			nicknames.splice(currentIndex,1);
			history.push(toHistory);
			broadcast(toHistory, true);
		}
	});
})
server.listen(8081);

function errTakenNick(connection){
	connection.sendText('{"code": "100", "msg": "This nickname is already taken. Please choose another nickname"}');
}

function loadHistory(connection){
	if (history.length > 0){
		var toLoad = JSON.stringify(history);
		connection.sendText('{"code": "201", "msg": ' + toLoad + '}')
	}
}

function broadcast(message, nicksUpd) {
	var toLoad = JSON.stringify(message);
	server.connections.forEach(function (connection) {
		connection.sendText('{"code": "200", "msg": ' + toLoad + '}');
		if (nicksUpd){
			connection.sendText('{"code": "202", "list": ' + JSON.stringify(nicknames) + '}')
		}
	});
}