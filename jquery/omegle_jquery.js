function log(msg) {
	if(window.console !== undefined) {
		console.log(msg);
	}
}

var connections = [];

$(document).ready(function() {
	//log("ready");
	connections[0] = new OmegleConnection('red');
	connections[1] = new OmegleConnection('blue');

	connections[0].outputTo(connections[1]);
	connections[1].outputTo(connections[0]);
});

OmegleConnection = $.klass({
	initialize: function(color) {
		this.id = '';
		this.outgoing = [];
		this.color = color;

		// Is this connection currently live (is someone listening?)
		this.live = false;

		// The table cell in the chat displays. 
		// Contains everything else relevant to this connection
		this.display = $("<td></td>")
			.addClass("display")
			.appendTo($("#table_chat tr:last"));

		// Where the chat contents actually go
		this.div_chat = $("<div></div>")
			.appendTo(this.display)
			.addClass("chat");

		// Indicates status
		this.div_status = $("<div></div>")
			.text("Status: ")
			.appendTo(this.display)
			.addClass("status");

		// self=this is used to pass the current instance to external functions
		var self = this;
		// The form used to control manual input
		this.form_reply = $("<form></form>")
			.appendTo(this.display)
			.css("text-align","center")
			.append($('<input type="text" />')
				.attr("name","message")
				.css("width","70%")
			)
			.append($("<input type='submit'/>")
				.val("Send")
			)
			.append($("<input type='button'/>")
				.val("Leave")
				.click(function() {
					self.notifyDisconnect();
				})
			)
			.append($("<input type='button'/>")
				.val("Reset")
				.click(function() {
					self.connect();
				})
			)
			.submit(function() {
				self.send("You","black",this.message.value)
				this.reset();
				return false;
			})
				
		this.connect();
	
		//log("init");

	},

	outputTo: function(outgoingConnection) {
		// Tell this connection to send messages received to another connection

		this.outgoing[this.outgoing.length] = outgoingConnection;
	},

	connect: function() {
		// Form a connection with omegle (get an id)

		//log("connect")
		//log(this)
		this.div_chat.empty();
		if (this.id.length) {
			this.notifyDisconnect();
		}
		this.sendQuery('start',function(self,response) {
			self.id = response;
			//log(self);
			self.checkEvents();
			self.live = true;
		});

		$(this.form_reply.message).focus();
	},

	sendQuery: function(target,respFunc) {
		// Send a query to the omegle server
		//log('sending');
		var self = this;
		if (respFunc == null) {
			respFunc = function(self,data) {}
		}
		$.ajax({
			url: 'omegle.php?'+target,
			type: 'GET',
			dataType: 'json',
			success: function(data) {
				respFunc(self,data);
			}
		});
	},

	systemMessage: function(message) {	
		// Show a greyed message about the current status of things
		$(this.div_chat).append($("<div></div>")
			.addClass('system')
			.text(message)
		)
	},

	addToChat: function(speaker,color,message) {
		// Add a chat message to the current chat display
		$(this.div_chat)
			.append($("<span></span>")
				.addClass("speaker")
				.css("color",color)
				.text(speaker + ": ")
			)
			.append(message)
			.append("<br/>")
	},

	displayEvent: function(ev) {
		// Display an event in the table log
		$('#table_events tr:last').after(
			$(document.createElement("tr"))
				.append(
					$(document.createElement("td"))
						.text(this.id)
				)
				.append(
					$(document.createElement("td"))
						.text(ev[0])
				)
				.css({
					'color': this.color
				})
		);
	},

	handleEvents: function(self,events) {
		// Whenever the omegle server returns events, deal with them
		//log("handleEvents");
		//log(events);
		if (events !== null) {
			for (var i = 0; i < events.length; i++) {
				self.displayEvent(events[i]);
				self.div_status.text("Status: ");
				var evType = events[i][0];
				if (evType == "gotMessage") {
					if (events[i][1] == "Please reload the page for technical reasons.") {
						// Omegle is asking for a captcha
						$("<div></div>")
							.appendTo($(document.body))
							.addClass("overlay")
							.append("Omegle is requesting a captcha. Click on text, then respond to the recaptcha request<br/>")
							.append("<iframe src='http://www.omegle.com' />")
							.append("Once finished, click ")
							.append($("<input type='button'>")
								.val("close")
								.click(function() {
									location.reload();
								})
							);

					}

					self.addToChat("Stranger",self.color,events[i][1]);
					for (var i = 0; i < self.outgoing.length; i++) {
						if (self.outgoing[i].live) {
							self.outgoing[i].send('"You"', self.color, events[i][1]);
						}
					}
				} else if (evType == "waiting") {
					self.systemMessage("Looking for someone you can chat with. Hang on.");
				} else if (evType == "connected") {
					self.systemMessage("You're now chatting with a random stranger. Say hi!");
				} else if (evType == "strangerDisconnected") {
					self.live = false;
					self.systemMessage("Your conversational partner has disconnected.");
				} else if (evType == "typing") {
					self.div_status.text("Status: Stranger is typing...");
					for (var i = 0; i < self.outgoing.length; i++) {
						self.outgoing[i].notifyTyping();
					}
				} else if (evType == "stoppedTyping") {
					for (var i = 0; i < self.outgoing.length; i++) {
						self.outgoing[i].notifyStoppedTyping();
					}
				} else if (evType == "recaptchaRequired") {
					alert("Captcha Required!");
					return;
				}
			}
			if (self.live) {
				self.checkEvents();
			}
		}
	},

	checkEvents: function() {
		// Check to see if there are any new events to handle
		//log("checkEvents");
		this.sendQuery('events&id='+this.id, this.handleEvents);
	},

	send: function(speaker,color,message) {
		// Send a message to this connection
		this.addToChat(speaker,color,message)
		this.sendQuery('send&id='+this.id+'&msg='+message);
	},

	notifyTyping: function() {
		// Notify the user at the other end of the connection that "you" are typing
		this.sendQuery('typing&id='+this.id);
	},

	notifyStoppedTyping: function() {
		// Notify the user at the other end that "you" have stopped typing
		this.sendQuery('stoppedTyping&id='+this.id);
	},

	notifyDisconnect: function(self) {
		// Disconnect from the current connection
		if (self == null) {
			self = this;
		}
		self.systemMessage("You have disconnected.");
		self.sendQuery('disconnect&id='+self.id);
	}
});
			


