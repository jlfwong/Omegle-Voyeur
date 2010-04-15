var connections = [];
$(document).ready(function() {
	console.log("ready");
	connections[0] = new OmegleConnection('red');
});

OmegleConnection = $.klass({
	initialize: function(color) {
		this.id = '';
		this.outgoing = [];
		this.color = color;
		this.display = $(document.createElement("td"))
			.text("Testing");

		$(document.createElement("tr"))
			.append(this.display)
			.appendTo($("#table_chat"))
	
		console.log("init");

		this.sendQuery('start',function(self,response) {
			self.id = response;
			console.log(self);
			self.checkEvents();
		});
	},
	sendQuery: function(target,respFunc) {
		console.log('sending');
		var self = this;
		$.ajax({
			url: 'omegle.php?'+target,
			type: 'GET',
			dataType: 'json',
			success: function(data) {
				respFunc(self,data);
			}
		});
	},
	checkEvents: function() {
		console.log("checkEvents");
		this.sendQuery('events&id='+this.id, this.handleEvents);
	},
	displayEvent: function(ev) {
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
		console.log("handleEvents");
		for (var i = 0; i < events.length; i++) {
			console.log("appending");
			self.displayEvent(events[i]);
			console.log("appended");
		}
		self.checkEvents();
	}
});
			


