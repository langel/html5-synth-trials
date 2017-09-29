

var oscillator = function(target_node) {

	this.counter = 0;
	this.wave_length = 0;
	this.old_wave_length = 0;
	this.freq = 110;

	this.buffer_gen = (e) => {
		var buffer = e.outputBuffer.getChannelData(0);
		for (var x = 0; x < buffer.length; x++) {
			this.counter++;
			buffer[x] = Math.sin((this.counter / this.wave_length) * twopi);
			/*
			// triangle (bad)
			buffer[x] = ((counter < wave_length/2) ? counter/wave_length : (wave_length-counter)/wave_length) * 2 - 0.5;
			// inverted farts
			buffer[x] = (counter - wave_length/4) / counter; 
			// fucked triangle
			buffer[x] = wave_length/(wave_length - Math.abs(counter % (2 * wave_length) - wave_length));
			// fucked saw
			buffer[x] = (wave_length - Math.abs(counter % (2 * wave_length) - wave_length))/(wave_length*2);
			// fucked triangle
			buffer[x] = Math.abs((counter % wave_length)) - 0.5;
			// saw
			buffer[x] += (counter / wave_length - 0.5) * 0.5;
			// sqaure
			buffer[x] += ((counter < wave_length/2) ? 1 : -1) * 0.5;
			*/
			if (this.counter >= this.wave_length) {
				this.old_wave_length = this.wave_length;
				this.wave_length = master_out.node.sampleRate / this.freq;
				this.counter = (this.wave_length == this.old_wave_length) ? this.counter - this.wave_length : 0;
			}
		}
	}

	this.set_frequency = function(freq) {
		this.freq = freq;
	}

	node = master_out.node.createScriptProcessor(master_out.buffer_size, 1, 1);
	node.onaudioprocess = this.buffer_gen;
	node.connect(target_node);

	this.node = node;
};

