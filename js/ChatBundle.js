"use strict";

var MessageBundle = require('./MessageBundle');

var simpleChatApp = (function(){
	var connection, 
		messageList = document.getElementById('jsMessagesList'),
		overlay = document.getElementById('jsPageOverlay');

	/**
	 * UpdateUsers doing steps into list of users
	 * @param {array} list [list of online users]
	 */
	function UpdateUsers(list){
		var usrsList = document.getElementById('jsUsersList');
		usrsList.innerHTML = '';
		for (var i = 0; i<list.length; i++){
			var item = document.createElement('div');
			item.textContent = list[i];
			usrsList.appendChild(item)
		}
	}


	/**
	 * Create Websocket connection to current location server.
	 * Add listeners on connection events
	 * Parse server response statuses
	 * @param {string} nickname [new user nickname]
	 */
	function CreateConnection(nickname){
		connection = new WebSocket("ws://"+window.location.hostname+":8081");
		connection.onopen = function () {
			connection.send(nickname);
			if ("vibrate" in navigator) connection.isVibro = true;

			document.getElementById("form").onsubmit = function(event){
				MessageBundle.inputHandler(event, connection);
			}
			document.getElementById("msg").onkeydown = function(event){
				if (event.ctrlKey && event.keyCode == 13){
					MessageBundle.inputHandler(event, connection)	
				}
			}
		}
		connection.onerror = function (error) {
			console.warn("Connection error")
		}
		connection.onmessage = function (event) {	
			var data = JSON.parse(event.data);			

			switch (data.code){
				case "100":
					overlay.className = "page-overlay";
					var nickname = prompt(data.msg);
					showOverlay(nickname);
					if (nickname){
						connection.send(nickname);
					}
					break;
				case "200":
					MessageBundle.createMessage(data.msg, connection, messageList);
					scrollChat();
					break;
				case "201":
					for (var i = 0; i<data.msg.length; i++){
						MessageBundle.createMessage(data.msg[i], connection, messageList);
					}
					scrollChat();
					break;
				case "202":
					UpdateUsers(data.list);
					break;
				default:
					console.warn("no code at message")
			}
		}
	}

	/**
	 * scrollChat simple scrolling function for update messages list
	 * @return nothing
	 */
	function scrollChat(){
		var body = document.body,
    		html = document.documentElement;

		messageList.scrollTop = messageList.scrollHeight;
		if (body.scrollHeight > html.clientHeight){
			window.scrollTo(0, body.scrollHeight);
		}
	}

	/**
	 * showOverlay  is a function for shown page entering overlay
	 * @param  {boolean} t [true/false value for show/hide overlay]
	 * @return nothing
	 */
	function showOverlay(t){
		if (t){
			overlay.className = 'page-overlay slide';
		} else {
			overlay.className = 'page-overlay refresh';
		}
	}

	/**
	 * askNickname show nickname question prompt
	 * @param  {string} q [question text]
	 * @return nothing
	 */
	function askNickname(q){
		q = q ? q : "Enter a nickname";
		overlay.className = 'page-overlay';
		var nickname = prompt(q);
		showOverlay(nickname);
		if (nickname){
			CreateConnection(nickname);
		}
	}

	window.addEventListener("load", function () {
		askNickname()
	});
}());

module.exports = simpleChatApp;