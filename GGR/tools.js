// UTILZ BRAH



let rnd_bool = () => {return Math.random() < 0.5};
let rnd_dec = (max) => {return Math.random() * max};
let rnd_int = (max) => {return Math.round(Math.random() * max)};
let quad_in_out = (t) => {return t<.5 ? 2*t*t : -1+(4-2*t)*t};

