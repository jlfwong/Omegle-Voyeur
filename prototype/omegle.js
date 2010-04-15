function omegle(targ,respfunc) {
	new Ajax.Request("omegle.php?"+targ, {
		method: 'get',
		onSuccess: function(transport) {
			var response = transport.responseText;
			if(response.isJSON()) {
				respfunc(response.evalJSON());
			}
		}.bind(targ),
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
	initialize: function(chat_td_id,css_class) {
		this.id = '';
		this.partners = [];
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
	addPartner: function(partner) {
		this.partners[this.partners.length] = partner;
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
	handleEvents: function(events) {
		for (var i = 0; i < events.length; i++) {
			display_event(this.id,events[i],this.css_class);

			var signal = events[i][0];
			if (signal == 'gotMessage') {
				var message = events[i][1];

				this.addToChat('You: ',this.css_class,message);
				
				if (this.partners.length == 0) {
					alert(this.css_class + " has no partners");
				}
				for (var i = 0; i < this.partners.length; i++) {
					partner = this.partners[i];
					partner.addToChat('Stranger: ',this.css_class,message);
					partner.send(message);
				}
			} else if (signal == 'waiting') {
				this.systemMessage("Looking for someone you can chat with. Hang on.");
			} else if (signal == 'connected') {
				this.systemMessage("You're now chatting with a random stranger. Say hi!");
			} else if (signal == 'typing') {
				for (var i = 0; i < this.partners.length; i++) {
					partner = this.partners[i];
					partner.notifyTyping();
				}
			} else if (signal == 'stoppedTyping') {
				for (var i = 0; i < this.partners.length; i++) {
					partner = this.partners[i];
					partner.notifyStoppedTyping();
				}
			} else if (signal == 'strangerDisconnected') {
				this.systemMessage("You have disconnected.");
				for (var i = 0; i < this.partners.length; i++) {
					partner = this.partners[i];
					partner.notifyDisconnect();
					partner.systemMessage("Your conversational partner has disconnected.");
				}
			}
		}
		this.checkEvents();
	},

	checkEvents: function() {
		omegle('events&id='+this.id,this.handleEvents.bind(this));
	},
	send: function(message) {
		omegle('send&id='+this.id+'&msg='+message,function(){});
	},
	notifyTyping: function() {
		omegle('typing&id='+this.id,function(){});
	},
	notifyStoppedTyping: function() {
		omegle('stoppedTyping&id='+this.id,function(){});
	},
	notifyDisconnect: function() {
		omegle('disconnect&id='+this.id,function(){});
	}
});

