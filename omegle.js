function omegle(targ,respfunc) {
	new Ajax.Request('omegle.php?'+targ, {
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
	var tr = $('table_events').insertRow(-1);
	tr.className = css_class;
	
	var td = tr.insertCell(-1);
	td.innerHTML = id;

	td = tr.insertCell(-1);
	td.innerHTML = omegle_event[0];

	td = tr.insertCell(-1);
	if (omegle_event[1]) {
		td.innerHTML = omegle_event[1];	
	} else {
		td.innerHTML = "&nbsp;";
	}
}

var OmegleConnection = Class.create({
	id: '',
	partner: '',
	css_class: '',
	initialize: function(css_class) {
		this.css_class = css_class;
		omegle('start',
			function (response) {
				this.id = response;
				this.checkevents();
			}.bind(this)
		);
	},
	checkevents: function() {
		omegle('events&id='+this.id,
			function(events) {
				for (var i = 0; i < events.length; i++) {
					display_event(this.id,events[i],this.css_class);
					if (events[i][0] == 'gotMessage') {
						this.partner.send(events[i][1]);
					}
				}
				this.checkevents();
			}.bind(this)
		);
	},
	send: function(message) {
		omegle('send&id='+this.id+'&msg='+message,
			function(response) {
				alert(response);
			}
		);
	}
});

var p1 = new OmegleConnection('red');
var p2 = new OmegleConnection('green');

p1.partner = p2;
p2.partner = p1;

