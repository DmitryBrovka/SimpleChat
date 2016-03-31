var MessageBundle = {
	/**
	 * CreateMessage and append into messages list
	 * @param {string} msg [message string]
	 */
	createMessage: function(msg, connection, messageList){
		var quote = document.createElement("blockquote"),
			footer = document.createElement("footer");

		if (!msg.system){
			if (connection.isVibro) navigator.vibrate(100);
			
			var p = document.createElement("p"), t = document.createElement("span");

			footer.textContent = msg.author;
			footer.className = 'author';

			p.innerHTML = msg.text;

			t.textContent = formatDate(msg.timestamp);
			t.className = 'time';

			quote.appendChild(footer);
			messageList.appendChild(quote).appendChild(p).appendChild(t);
			
		} else {
			footer.textContent = msg.author + ' ' + msg.text;
			quote.appendChild(footer);
			quote.className = 'system';
			messageList.appendChild(quote);
		}

		/**
		 * formatDate get timestamp from server and parse them to hunamize format
		 * @param  {int} unix [timestamp from server]
		 * @return {string}      [string with needed format]
		 */
		function formatDate(unix){
			var date = new Date(unix),
				DD = date.getDate(),
				MM = date.getMonth()+1,
				hh = date.getHours(),
				yy = date.getFullYear(),
				mm = date.getMinutes();		
			return DD + '/' + MM + '/' + yy + ' ' + hh + ':' + mm;
		}
	},

	/**
	 * inputHandler is a handler for user input events
	 * @param  {object} event [user event]
	 * @return {boolean}       [return false for prevent default behaviour]
	 */
	inputHandler: function(event, connection) {
		var msg = document.getElementById("msg");
		if (msg.value)
			connection.send(msg.value.replace(/\n/g, "<br/>"));
		msg.value = "";
		event.preventDefault();
		return false;
	}
}

module.exports = MessageBundle;