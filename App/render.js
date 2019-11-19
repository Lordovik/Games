/* global game, LEVELS, Player, SMALL, mapTilesLegend, charactersTilesLegend */
// ALL CANVAS CODE GOES HERE
var w = window.innerWidth;
var h = window.innerHeight;
var scale = window.devicePixelRatio;
scale = 1;
var w2 = w / 2;
var h2 = h / 2;

var canvas = document.getElementById('canvas');
canvas.width = w * scale;
canvas.height = h * scale;
canvas.style.width = w;
canvas.style.height = h;

const TILESET = new Image();
TILESET.src = "images/tileset.png";

const SPRITESET = new Image();
SPRITESET.src = "images/sprite_animation.png";

var ctx = canvas.getContext('2d');
ctx.scale(scale, scale);

let tile;
let tileSize = ((w / 40));

let game = new Game();
game.loadParticularLevel("start");
let animate = function () {
	game.check_go_new_level();

	game.render(ctx,tileSize,w,h);
	game.tick(ctx,tileSize,w,h);
	if (game.player && !game.player.alive) game.loadParticularLevel('gameover');

};

// DRAW BLACK BACKGROUND	
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, w, h);

ctx.globalAlpha = 1;//0.05;
ctx.lineWidth = 2;
setInterval(() => {
	animate();
}, 16);
