
let rnd_bool = () => {return Math.random() < 0.5};
let rnd_dec = (max) => {return Math.random() * max};
let rnd_int = (max) => {return Math.round(Math.random() * max)};
let quad_in_out = (t) => {return t<.5 ? 2*t*t : -1+(4-2*t)*t};

let icon_create = (icon_type, target) => {
	let temp = document.createElement('template');
	temp.innerHTML = '<div class="botb-icon icons-' + icon_type + '"></div>';
	let el = temp.content.firstChild;
	target.appendChild(el);
	return el;
}


let screen = {
	update: () => {
		screen.x = document.body.scrollWidth;
		screen.y = document.body.scrollHeight;
	},
	x: 0,
	y: 0
};
screen.update();
window.addEventListener('resize', screen.update);

let gg_space = document.getElementById('gg_space');

let golden_gloves = [];
let golden_glove_count = 65;
for (let i = 0; i < golden_glove_count; i++) {
	golden_gloves.push({
		el: icon_create(icons[Math.floor(Math.random() * icons.length)], gg_space),
		lateral: rnd_bool(),
		lineal: rnd_bool(),
		speed: 2 + rnd_dec(8),
		rot_pace: rnd_dec(15)-7,
		rot_pos: rnd_int(720),
		pulse_pace: rnd_dec(0.6),
		pulse_pos: rnd_int(1000),
		x: rnd_int(screen.x),
		y: rnd_int(screen.y)
	});
}


setInterval(() => {
	golden_gloves.forEach(gg => {
		// scale
		gg.pulse_pos += gg.pulse_pace;
		let side = 7 + (Math.sin(gg.pulse_pos)/2+0.5) * 2;
		let transform = "scale(" + side + ") ";
		// rotate
		gg.rot_pos += gg.rot_pace;
		gg.el.style.transform = transform + "rotate(" + gg.rot_pos + "deg)";
		// translate
		if (gg.x >= screen.x) gg.lateral = 0;
		if (gg.x < 0) gg.lateral = 1;
		gg.x += (gg.lateral) ? gg.speed : -gg.speed;
		gg.el.style.left = gg.x + "px";
		if (gg.y >= screen.y) gg.lineal = 0;
		if (gg.y < 0) gg.lineal = 1;
		gg.y += (gg.lineal) ? gg.speed : -gg.speed;
		gg.el.style.top = gg.y + "px";
	});
}, 30);



