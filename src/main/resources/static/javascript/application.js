$(function() {
	"use strict";

	var content = $('#content');
	var input = $('#input');
	var status = $('#status');
	var myName = false;
	var author = null;
	var logged = false;
	var socket = atmosphere;
	var subSocket;
	var transport = 'websocket';
	var falgnum = Math.ceil(Math.random()* (flag.length));
	var meflag = '<span class="' + flag[falgnum] + '" aria-hidden="true"></span>';

	// We are now ready to cut the request
	var request = {
		url : '/chat',
		contentType : "application/json",
		logLevel : 'debug',
		transport : transport,
		trackMessageLength : true,
		reconnectInterval : 5000
	};

	request.onOpen = function(response) {
		content.html($('<p>', {
			text : '欢迎光临~'
		}));
		input.removeAttr('disabled').focus();
		status.text('输个名字:');
		transport = response.transport;

		// Carry the UUID. This is required if you want to call
		// subscribe(request) again.
		request.uuid = response.request.uuid;
	};

	request.onClientTimeout = function(r) {
		content
				.html($(
						'<p>',
						{
							text : 'Client closed the connection after a timeout. Reconnecting in '
									+ request.reconnectInterval
						}));
		subSocket
				.push(atmosphere.util
						.stringifyJSON({
							author : author,
							message : 'is inactive and closed the connection. Will reconnect in '
									+ request.reconnectInterval
						}));
		input.attr('disabled', 'disabled');
		setTimeout(function() {
			subSocket = socket.subscribe(request);
		}, request.reconnectInterval);
	};

	request.onReopen = function(response) {
		input.removeAttr('disabled').focus();
		content.html($('<p>', {
			text : '回归地球...'
		}));
	};

	// For demonstration of how you can customize the fallbackTransport using
	// the onTransportFailure function
	request.onTransportFailure = function(errorMsg, request) {
		atmosphere.util.info(errorMsg);
		request.fallbackTransport = "long-polling";
	};

	request.onMessage = function(response) {

		var message = response.responseBody;
		try {
			var json = atmosphere.util.parseJSON(message);
		} catch (e) {
			console.log('This doesn\'t look like a valid JSON: ', message);
			return;
		}

		input.removeAttr('disabled').focus();
		if (!logged && myName) {
			logged = true;
			status.text(myName + ' : ').css('color', 'blue');
			status.html(meflag+ status.html());
		} else {
			var me = json.author == author;
			var date = typeof (json.time) == 'string' ? parseInt(json.time) : json.time;
			var flagtmp = me ? meflag : '<span class="' + flag[json.flag] + '" aria-hidden="true"></span>';
			addMessage(json.author, json.message,flagtmp, me ? 'blue' : 'black',
					new Date(date));
		}
	};

	request.onClose = function(response) {
		content.html($('<p>', {
			text : 'Server closed the connection after a timeout'
		}));
		if (subSocket) {
			subSocket.push(atmosphere.util.stringifyJSON({
				author : author,
				message : '离线了~'
			}));
		}
		input.attr('disabled', 'disabled');
	};

	request.onError = function(response) {
		content.html($('<p>', {
			text : '网络断了...可能服务器爆炸了...'
		}));
		logged = false;
	};

	request.onReconnect = function(request, response) {
		content.html($('<p>', {
			text : '重连中....'
		}));
		input.attr('disabled', 'disabled');
	};

	subSocket = socket.subscribe(request);

	input.keydown(function(e) {
		if (e.keyCode === 13) {
			var msg = $(this).val();
			if(!msg){
				return;
			}

			// First message is always the author's name
			if (author == null) {
				if(msg.length > 10){
					showalert('名字太长......');
					return;
				}
				author = msg;
			}

			subSocket.push(atmosphere.util.stringifyJSON({
				author : author,
				flag: falgnum,
				message : msg
			}));

			$(this).val('');

			input.attr('disabled', 'disabled');
			if (myName === false) {
				myName = msg;
			}
		}
	});

	var _url = "http://([w-]+.)+[w-]+(/[w- ./?%&=]*)?"; 

	var msgid= 0;
	
	function addMessage(author, message,flag, color, datetime) {
//		if(_url.search(message) >= 0){
//			content.append('<p><a href="'+ message+ '"  target="_blank"><span style="color:' + color + '">' + author + '</span> ('
//					+ (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) 
//					+ ':'
//					+ (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
//					+ ':'
//					+ (datetime.getSeconds() < 10 ? '0' + datetime.getSeconds() : datetime.getSeconds()) +') 说 :'
//					+ message + '</a><span style="color: red">(点击外链,请注意安全.)</span><p>');
//		}else{
			content.append('<div id="'+msgid + '" class="alert alert-info"><p>' + flag + '&nbsp;<span style="color:' + color + '">' + author + '</span> ('
					+ (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) 
					+ ':'
					+ (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
					+ ':'
					+ (datetime.getSeconds() < 10 ? '0' + datetime.getSeconds() : datetime.getSeconds()) +') 说 :'
					+ message + '</p></div>');
			document.getElementById(msgid).scrollIntoView(true);
			msgid++;
//		}
	}
});
