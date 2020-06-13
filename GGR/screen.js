

// wow its the browser window elemental canvas info guy
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

