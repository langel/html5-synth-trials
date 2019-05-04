

var oscillator = function(target_node) {

	this.counter = 0;
	this.wave_length = 1;
	this.old_wave_length = 0;
	this.freq = 110;

	this.buffer_gen = (e) => {
		var buffer = e.outputBuffer.getChannelData(0);
		for (var x = 0; x < buffer.length; x++) {
			this.counter++;
			buffer[x] = 0;
			this.waveforms.forEach((waveform) => {
				var sample = waveform.sample();
				if (sample < waveform.min) waveform.min = sample;
				if (sample > waveform.max) waveform.max = sample;
				buffer[x] += sample;
			});
			/*
			// fucked triangle
			buffer[x] = wave_length/(wave_length - Math.abs(counter % (2 * wave_length) - wave_length));
			// fucked saw
			buffer[x] = (wave_length - Math.abs(counter % (2 * wave_length) - wave_length))/(wave_length*2);
			// fucked triangle
			buffer[x] = Math.abs((counter % wave_length)) - 0.5;
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

	this.set_waveform_volume = (wave, vol) => {
		this.waveforms[wave].volume = vol;
		console.log(this.waveforms[wave].shape + ' ' + vol);
	}

	this.waveforms = [
		{
			shape: 'Sine',
			sample: () => {
				return Math.sin((this.counter / this.wave_length) * twopi) * this.waveforms[0].volume;
			},
			volume: 0.25,
			min: 0,
			max: 0,
		},
		{
			shape: 'Square',
			sample: () => {
				return ((this.counter < this.wave_length/2) ? 1 : -1) * this.waveforms[1].volume;
			},
			volume: 0.25,
			min: 0,
			max: 0,
		},
		{
			shape: 'Triangle',
			sample: () => {
				return ((((this.counter < this.wave_length/2) ? this.counter/this.wave_length : (this.wave_length-this.counter)/this.wave_length) * 4) - 1) * this.waveforms[2].volume;
			},
			volume: 0.25,
			min: 0,
			max: 0,
		},
		{
			shape: 'Saw',
			sample: () => {
				return ((this.counter / this.wave_length) * 2 - 1) * this.waveforms[3].volume;
			},
			volume: 0.25,
			min: 0,
			max: 0,
		},
		{
			shape: 'InvFart',
			sample: () => {
				var sample = ((this.counter - this.wave_length/4) / this.counter) * this.waveforms[4].volume; 
				if (sample > 1) sample = 1;
				if (sample < -1) sample = 1;
				return sample;
			},
			volume: 0,
			min: 0,
			max: 0,
		},
		{
			shape: 'Fukt',
			sample: () => {
				return (Math.abs((this.counter % this.wave_length)) - 0.5) * this.waveforms[5].volume;
			},
			volume: 0,
			min: 0,
			max: 0,
		}
	]

	node = master_out.node.createScriptProcessor(master_out.buffer_size, 1, 1);
	node.onaudioprocess = this.buffer_gen;
	node.connect(target_node);

	this.node = node;
};

