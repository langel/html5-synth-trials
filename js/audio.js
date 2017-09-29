
var twopi = Math.PI * 2;

var master_out = (function() {

	var node = new (window.AudioContext || window.webkitAudioContext)();
	var amp = node.createGain();
	amp.connect(node.destination);
	
	return {
		amp: amp,
		buffer_size: 1024,
		node: node,
		set_volume: function(volume) {
			amp.gain.value = volume;
		}
		
	}

})();

console.log(master_out);
