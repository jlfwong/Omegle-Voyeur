function omegle(targ,respfunc) {
	new Ajax.Request("omegle.php?"+targ, {
		method: 'get',
		onSuccess: function(transport) {
			var response = transport.responseText;
			respfunc(response.evalJSON());
		},
		onFailure: function() {
			alert("Request failed");
		}
	});
}

function display_event(id,omegle_event,css_class) {
	// Update table_events
	var tr = $('table_events').insertRow(-1);
	tr.className = css_class;
	
	var td = tr.insertCell(-1);
	td.innerHTML = id;

	td = tr.insertCell(-1);
	td.innerHTML = omegle_event[0];
//	td = tr.insertCell(-1);
//	if (omegle_event[1]) {
//		td.innerHTML = omegle_event[1];	
//	} else {
//		td.innerHTML = "&nbsp;";
//	}
}

var OmegleConnection = Class.create({
	id: '',
	partner: '',
	css_class: '',
	chat_td: '',

	initialize: function(chat_td_id,css_class) {
		this.chat_td = $(chat_td_id);
		this.css_class = css_class;

		this.systemMessage("Connecting to server...");

		omegle('start',
			function (response) {
				this.id = response;
				this.checkEvents();
			}.bind(this)
		);
	},
	systemMessage: function(message) {	
		var span = new Element('span',{
			'class': 'system'
		}).update(message);
		var br = new Element('br');

		this.chat_td.appendChild(span);
		this.chat_td.appendChild(br);
	},
	addToChat: function(source,css_class,message) {
		var span = new Element('span',{
			'class': css_class
		}).update(source);
		var text = document.createTextNode(message);
		var br = new Element('br');

		this.chat_td.appendChild(span);
		this.chat_td.appendChild(text);
		this.chat_td.appendChild(br);
	},
	checkEvents: function() {
		omegle('events&id='+this.id,
			function(events) {
				for (var i = 0; i < events.length; i++) {
					display_event(this.id,events[i],this.css_class);

					var signal = events[i][0];
					if (signal == 'gotMessage') {
						var message = events[i][1];
						this.addToChat('You: ','you',message);
						this.partner.addToChat('Stranger: ','stranger',message);

						this.partner.send(events[i][1]);
					} else if (signal == 'waiting') {
						this.systemMessage("Looking for someone you can chat with. Hang on.");
					} else if (signal == 'connected') {
						this.systemMessage("You're now chatting with a random stranger. Say hi!");
					} else if (signal == 'typing') {
						this.partner.notifyTyping();
					} else if (signal == 'stoppedTyping') {
						this.partner.notifyStoppedTyping();
					} else if (signal == 'strangerDisconnected') {
						this.systemMessage("You have disconnected.");
						this.partner.notifyDisconnect();
						this.partner.systemMessage("Your conversational partner has disconnected.");
					}
				}
				this.checkEvents();
			}.bind(this)
		);
	},
	send: function(message) {
		omegle('send&id='+this.id+'&msg='+message,
			function(response) {
				alert(response);
			}
		);
	},
	notifyTyping: function() {
		omegle('typing&id='+this.id,
			function(response) {
				alert(response);
			}
		);
	},
	notifyStoppedTyping: function() {
		omegle('stoppedTyping&id='+this.id,
			function(response) {
				alert(response);
			}
		);
	},
	notifyDisconnect: function() {
		omegle('disconnect&id='+this.id,
			function(response) {
				alert(response);
			}
		);
	}
});

var p1,p2;
window.onload = function() {
	p1 = new OmegleConnection('td_chat_1','red');
	p2 = new OmegleConnection('td_chat_2','green');
	p1.partner = p2;
	p2.partner = p1;
};
