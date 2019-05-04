/*
	bash conversion
	ffmpeg -i {song}.mp3 -f u8 -ac 1 -ar 22050 {song}.raw
*/
var play_state=0; // 0=paused, 1=playing
var song_data;
var song_sample_rate=22050;
var grain_data=[];
var grain_counter=0;
var grain_size=10476;
// whiplash 158bpm 167474, 83737, 41863, 20931, 10476, 5238
// trapped under ice 140bpm 32392, 16196, 8098, 4049, 4400, 44000
var grain_agrandom = grain_size * 8;
var grain_agoffset = grain_size * 4;

/*
var req = new XMLHttpRequest()
req.open("GET", "trapped under ice.raw", true);
req.responseType = "arraybuffer";
var load_buffer = req.response;
if (load_buffer) {
	var song_data = new Uin8Array(load_buffer);
	for (var i=0; i<song_data.length; i++) {
		var val = song_data[i];
		grain_data[val].push(i);
	}
}
else alert('file not loaded');
*/

var song = {
	// move all the song shit (data) in here?!?!
	play: function() {
		play_state = 1;
		ui.song_counter.update(0);
		ui.song_duration.start_counter();
	},
	pause: function() {
		play_state = 0;
	}
};

var master_out;

function init_audio() {

	var node = new (window.AudioContext || window.webkitAudioContext)();
	var amp = node.createGain();
	amp.connect(node.destination);
	
	master_out = {
		amp: amp,
		buffer_size: 1024,
		buffer_rate: 0,
		node: node,
		set_volume: function(volume) {
			amp.gain.value = volume;
		},
		set_buffer_rate: function() {
			// XXX need a check here that the sample rate does
			// not exceed the node rate
			this.buffer_rate = song_sample_rate/this.node.sampleRate;
			ui.song_length.value = song_data.length;
		}
	}
	master_out.set_buffer_rate();	
	node = master_out.node.createScriptProcessor(master_out.buffer_size, 1, 1);
	node.onaudioprocess = buffer_gen;
	node.connect(master_out.amp);
	song.play();
}


var buffer_count=0, sample=0;

function buffer_gen(e) {
	var buffer = e.outputBuffer.getChannelData(0);
	if (ui.song_length.value > 0 && ui.song_counter.value < ui.song_length.value) {
		// XXX major issue here :(
		//song.pause();
	}
	if (play_state == 1) {
		for (var i=0; i<buffer.length; i++) {
			buffer[i] = sample/128-1;
			if (buffer_count>1) {
				buffer_count-=1;
				sample = song_data[ui.song_counter.value];
				if (grain_counter > grain_size) {
					grain_counter = 0;
					var grain_array = grain_data[sample].filter(function(e){ return e !== ui.song_counter.value });
					ui.song_counter.value = closest(grain_array, ui.song_counter.value + Math.random()*grain_agrandom - grain_agoffset);
					ui.grain_start_pos.value = ui.song_counter.value;
				}
				grain_counter++;
				ui.song_counter.inc();
			}
			buffer_count += master_out.buffer_rate;
			ui.song_counter.value = ui.song_counter.value;
//			ui.song_duration.update();
		}
	}
	else {
		ui.song_counter.value = 'EOF';
		song.pause();
	}
}

var randa = function(a) {
	return a[Math.floor(Math.random()*a.length)];
}

var closest = function(a, goal) {
	return a.reduce(function(prev, curr) {
		return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
	});
}

function load_audio(e) {
	file = e.target.files[0];
	if (!file) return alert('audio not loaded');
	var reader = new FileReader();
	reader.onload = function(e) {
		song_data = new Uint8Array(e.target.result);
		grain_data = new Array(255);
		for (var i=0; i<song_data.length; i++) {
			var val = song_data[i];
			if (typeof grain_data[val] == 'undefined') grain_data[val] = [];
			grain_data[val].push(i);
		}
		init_audio();
	}
	reader.readAsArrayBuffer(file);
}

function s_to_time(duration) {
	var milliseconds = parseInt((duration*1000)%1000).toString().padStart(3,'0'), 
		seconds = parseInt(duration%60).toString().padStart(2,'0'), 
		minutes = parseInt((duration/60)%60).toString().padStart(2,'0');
	return minutes + ":" + seconds + "." + milliseconds;
}

var idget = function(id) { return document.getElementById(id); };

var ui = {
	// this object contains all interactive entities/variables
	// for both the engine and user
	// id: element selector by id
	// value: default starting value
	// update: function called on engine updates
	// change: function called on change event
	// click: function called on click event
	song_counter: {
		id: 'song_loc',
		value: '0',
		inc: function() { this.value++; },
		update: function() {
			var display = (this.value == 'EOF') ? 'EOF' : s_to_time(this.value/song_sample_rate);
			this.el.innerHTML = display;
		}
	},
	song_length: {
		id: 'song_length',
		value: 'NaN',
		update: function() {
			this.el.innerHTML = s_to_time(this.value/song_sample_rate);
		}
	},
	song_duration: {
		id: 'song_dur',
		value: 0,
		start_time: 0,
		start_counter: function() { this.start_time = Date.now(); },
		update: function() { 
			this.value = Date.now() - this.start_time;
			this.el.innerHTML = s_to_time(this.value/1000); 
		}
	},
	grain_start_pos: {
		id: 'grain_start_pos',
		value: '0',
		update: function() {
			this.el.innerHTML = s_to_time(this.value/song_sample_rate);
		}
	},
	file: {
		id: 'audio-input',
		change: function(e) { load_audio(e); }
	},
	sample_rate: {
		id: 'samplerate_import',
		change: function() {
			song_sample_rate = ui.sample_rate.el.value;
			if (typeof master_out !== 'undefined') master_out.set_buffer_rate();
		}
	},
	grain_size: {
		id: 'grain_size',
		value: grain_size,
		change: function() {
			grain_size = this.value;
		}
	},
	grain_size_double: {
		id: 'grain_double',
		click: function() {
			ui.grain_size.el.value = grain_size *= 2;
		}
	},
	grain_size_halve: {
		id: 'grain_halve',
		click: function() {
			ui.grain_size.el.value = grain_size = Math.round(grain_size/2);
		}
	},
};


// init the ui objects
(function() {
	Object.keys(ui).forEach(function(key) {
		ui[key].el = document.getElementById(ui[key].id);
		if (ui[key].el.nodeName == 'INPUT' && typeof ui[key].value != 'undefined') {
			ui[key].el.value = ui[key].value;
		}
		if (typeof ui[key].update !== 'undefined') ui[key].update(ui[key].value);
		if (typeof ui[key].change !== 'undefined') ui[key].el.addEventListener('change', ui[key].change);
		if (typeof ui[key].click !== 'undefined') ui[key].el.addEventListener('click', function() {
			ui[key].click();
		});
	});
}());

// XXX this is setup so slow just for slow ass Date.now()
// maybe give a curr_time update seperately
var display_clock = function() {
	Object.keys(ui).forEach(function(key) {
		if (typeof ui[key].update !== 'undefined') ui[key].update();
	});
	setTimeout(display_clock, 171);
};
display_clock();


// XXX these are almost done being transferred/refactored
// to the new ui object! :D/

var inputs = {
	grain_agrandom: idget('grain_agrandom'),
	grain_agoffset: idget('grain_agoffset'),
	grain_update: idget('grain_update'),
}

inputs.grain_agrandom.value=grain_agrandom;
inputs.grain_agrandom.addEventListener('change', function(){
	grain_agrandom=inputs.grain_agrandom.value;
});

inputs.grain_agoffset.value=grain_agoffset;
inputs.grain_agoffset.addEventListener('change', function(){
	grain_agoffset=inputs.grain_agoffset.value;
});

inputs.grain_update.addEventListener('click', function(){
	grain_agoffset = Math.round(grain_agrandom/2);
	inputs.grain_agoffset.value = grain_agoffset;
});

