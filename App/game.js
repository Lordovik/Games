/* global game, LEVELS, Player, SMALL, mapTilesLegend, charactersTilesLegend, ctx, TILESET, SPRITESET */

class Game {
	constructor() {
		//this.menuSelect = 0;

		this.level = 1;
		this.globalTimer = 0;
		this.player;
		this.totalMoney = 0;
		this.winGame = false;
		this.bgmusic = new Audio("music/hotline_miami_04.M.O.O.N-Crystals.mp3");
		this.takeTreasureSound = new Audio("sounds/coin.ogg");
		this.destroySound = new Audio("sounds/413665__ironcross32__weapon.wav");
		this.monsterSound = new Audio("sounds/163439__under7dude__zombie-2.wav");
		this.runningSound = new Audio("sounds/446827__mateozugi19__running.wav");

	}
	loadParticularLevel(lvl,is_editor) {
		console.log("loadParticularLevel("+lvl+","+is_editor+")");
		this.totalMoney = 0;
		this.bgmusic.loop = true;
		this.takeTreasureSound.volume = 0.3;
		this.runningSound.volume = 0.5;
		this.destroySound.volume = 0.5;


		var tmp = LEVELS[lvl].map.split('\n');		   // makes array of strings from 'level1' (for example)
		this.current_level=LEVELS[lvl];
		this.map = [];
		this.holes = [];
		for (let i = 0; i < tmp.length; i++) {
			this.map.push(tmp[i].split(""));						// stores level as array of arrays  
		}														   // this one won't change
		this.objects = [];
		this.widgets=JSON.parse(JSON.stringify(LEVELS[lvl].widgets||[]));
		this.player = undefined;
		this.draw = undefined;

		// set creatures and count total money on this level
		for (let y = 0; y < this.map.length; y++) {
			for (let x = 0; x < this.map[y].length; x++) {
				switch (this.map[y][x]) {
					case "H":
						if (!is_editor) {
							this.map[y][x] = " ";
							this.player = new Player(y, x);
							this.objects.push(this.player);
						}
						break;
					case "M":
						if (!is_editor) {
							this.map[y][x] = " ";
							this.objects.push(new Monster(y, x));
						}
						break;
					case "$":
						this.totalMoney++;
						break;
				}
			}
		}
		switch (LEVELS[lvl].generator) {
			case "campaign":
				let counter = 0;
				this.widgets.push({
					'type':'button',
                			'x': 0.08,
			                'y': 0.1,
			                'width': 0.3,
			                'height': 0.08,
			                'font': 'VT323',
			                'value': "BACK TO MENU",
					'selected':0,
					'onclick':'menu'
        				    });
				for (var k in LEVELS) {
					if (!k.match(/^level(\d+)$/)) continue;
					this.widgets.push(
						{
							'type': 'level',
							'x': (Math.floor(counter % 5) * 0.172) + 0.08,
							'y': (Math.floor(counter / 5) * 0.2) + 0.2,
							'width': 0.15,
							'height': 0.23,
							'selected': counter?0:1,
							'level': k,
							'onclick': 'level',
							'enabled': 1
						}
					);
					counter++;
				}
				break;
		}
	}

	random_player() {
		return {
			x:Math.floor(Math.random()*this.map[0].length),
			y:Math.floor((Math.random()*this.map.length)/2),

		};
	}

	// NEW LEVEL LOGIC
	check_go_new_level() {
		if (this.player && this.player.score == this.totalMoney) {
			this.level++;
			if (this.level == LEVELS.length) {
				this.winGame = true;
				return;
			}
			this.totalMoney = 0;
			this.loadParticularLevel('level' + this.level);
		}
	}
	destroyBlock(x, y) {
		this.holes.push({ x: x, y: y, startTick: this.globalTimer, endTick: this.globalTimer + 200 });
		this.player.destroyBlock = 0;
	}

	render_widgets(ctx,tileSize,w,h) {
		for (let i=0;i<this.widgets.length;i++) {
			let item=this.widgets[i];
			if (item.type=="button") {
				ctx.lineWidth = 3;
				ctx.fillStyle = '#333333';
				ctx.strokeStyle=(!item.selected)?"#333333":"#40ff40";
				ctx.fillRect(
					Math.round(w * item.x),
					Math.round(h * item.y),
					Math.round(w * item.width),
					Math.round(h * item.height)
				);
				ctx.strokeRect(
					Math.round(w * item.x),
					Math.round(h * item.y),
					Math.round(w * item.width),
					Math.round(h * item.height)
				);
			}
			if (item.type=="text" || item.type=="button") {
				ctx.fillStyle = '#ccc';
				let font_size = Math.round(h * item.height);
				ctx.font=font_size+"px "+item.font;
				ctx.fillText(item.value, Math.round(w * item.x),Math.round(h * item.y)+Math.round(font_size*0.9));
			
			}
			if (item.type=="level") {
				let tmp = LEVELS[item.level].map.split('\n');	
				for (let y=0;y<Math.floor(item.height*h/4);y++) {

					if (!tmp) continue;
					if (!tmp[y]) continue;
					for (let x=0;x<Math.floor(item.width*w/4);x++) {
						switch (tmp[y][x]){
							case ' ':
								ctx.strokeStyle='black';
								break;
							case 'U':
								ctx.strokeStyle='red';
								break;
							case 'B':
								ctx.strokeStyle='green';
								break;
							case '#':
								ctx.strokeStyle='white';
								break;
						}
						ctx.lineWidth = 0.5;
						ctx.strokeRect(
							Math.round(w * item.x+x*4),
							Math.round(h * item.y+y* Math.floor((item.height*h)/tmp.length)),
							3,
							Math.floor(((item.height*h)/tmp.length) / 2)
						);
	
					}
					
				}
				ctx.lineWidth = 3;
				ctx.fillStyle = '#333333';
				ctx.strokeStyle=(!item.selected)?"#333333":"#40ff40";
				ctx.strokeRect(
					Math.round(w * item.x),
					Math.round(h * item.y),
					Math.round(w * item.width),
					Math.round(h * item.height)
				);
			}
		}
	}

	onPause() {
		this.pause ? this.pause=false : this.pause=true;
		if (this.pause) {

			if (game.draw) {
				this.widgets.push(
				{
				'type':'button',
       	        	 	'x': 0.1,
       		         	'y': 0.6,
               	 		'width': 0.8,
               		 	'height': 0.1,
                		'font': 'VT323',
                		'value': "EXIT",
				'selected':1,
				'onclick':'menu'
				},
				{
				'type':'button',
       	        	 	'x': 0.1,
       		         	'y': 0.75,
               	 		'width': 0.8,
               		 	'height': 0.1,
                		'font': 'VT323',
                		'value': "SAVE AND EXIT",
				'selected':0,
				'onclick':'menu'
				});
			} else {
				this.widgets.push(            
				{
				'type':'button',
       	        	 	'x': 0.1,
       		         	'y': 0.7,
               	 		'width': 0.8,
               		 	'height': 0.1,
                		'font': 'VT323',
                		'value': "BACK TO MENU",
				'selected':1,
				'onclick':'menu'
				});
           	 	}
		} else {
			if (game.draw) this.widgets.pop();
			this.widgets.pop();
		} 
	}
    gamepadHandleKeys(){
        if (!navigator.getGamepads) return;
        let gamepads=navigator.getGamepads();
        for (let gp=0;gp<gamepads.length;gp++) {
			let gamepad = gamepads[gp];
			if (!gamepad) continue;
			if (!gamepad.buttons) continue;
			for(let i = 0; i < gamepad.buttons.length; i++){
				if(!gamepad.buttons[i].pressed) continue;
				let keyCode;
				console.log("Pressed button i="+i);
				switch(i) {
					case 12:
						keyCode = 38;
						break;
					case 13:
						keyCode = 40;
						break;
					case 14:
						keyCode=37;
						break;
					case 15:
						keyCode=39;
						break;
					case 0:
						keyCode=32;
						break;
				}
				let key = { keyCode };
				handleKeys(key);
				//this.widgets_keydown(key);
			}
		}
    }
	tick(ctx,tileSize,w,h) {
		if (game.pause) return;
		this.globalTimer++;
        
        this.gamepadHandleKeys();

		var player;
		for (let i = 0; i < game.objects.length; i++) {
			game.objects[i].tick();
			game.objects[i].move();
			game.objects[i].switch_face();
			if (game.objects[i] instanceof Player) {
				player = game.objects[i];
			}
			if (game.objects[i] instanceof Draw) {
				game.draw = game.objects[i];
			}
		}
	}
	
	render(ctx,tileSize,w,h) {	
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, w, h);

		var cameraX = 0, cameraY = 0;
		if (this.player) {
			var plX = tileSize * (this.player.x + this.player.smallX / SMALL);
			var plY = tileSize * (this.player.y + this.player.smallY / SMALL);
			cameraX = Math.round(plX - w / 2);
			cameraY = Math.round(plY - h / 2);
			if (cameraX < 0) {
				cameraX = 0;
			}
			if (cameraY < 0) {
				cameraY = 0;
			}
		}
		if (this.draw) {
			var plX = tileSize * this.draw.x ;
			var plY = tileSize * this.draw.y;
			cameraX = Math.round(plX - w / 2);
			cameraY = Math.round(plY - h / 2);
			if (cameraX < 0) {
				cameraX = 0;
			}
			if (cameraY < 0) {
				cameraY = 0;
			}

		}

		for (let y = 0; y < game.map.length; y++) {
			for (let x = 0; x < game.map[y].length; x++) {
				let tile = mapTilesLegend[game.map[y][x]];
				if (!tile) {
					continue;
				}
				ctx.drawImage(TILESET,										  // from this PNG
					tile[0], tile[1] * game.level,
					128, 128,												  // look into symbols map and return it's coordinates from TILES LEGEND
					tileSize * x - cameraX, tileSize * y - cameraY,									 // set SCREEN POSITION of the block 
					tileSize, tileSize										  // set SIZE of each block 
				);
			}
		}

		if (this.pause) {		
			ctx.fillStyle = "rgba(0,0,0,0.6)";
			ctx.fillRect(0,0,w,h);

		}


		this.render_widgets(ctx,tileSize,w,h);

		for (let i = 0; i < game.objects.length; i++) {
			let object = game.objects[i];
			let tile;
			if (object instanceof Draw ) {
				tile = mapTilesLegend[object.face];
				//
				ctx.lineWidth = 3;
				ctx.fillStyle = '#333333';
				ctx.strokeStyle="#40ff40";
				ctx.strokeRect(tileSize*object.x-cameraX,tileSize*object.y-cameraY,tileSize,tileSize);

				ctx.drawImage(TILESET,
					tile[0], tile[1],
					128, 128,
					tileSize * (object.x) - cameraX, tileSize * (object.y) - cameraY,
					tileSize, tileSize
				);


			} else {
				tile = charactersTilesLegend[object.face];
				if (object.tileno >= tile.length) object.tileno = 0;
				tile = tile[object.tileno];
				ctx.drawImage(SPRITESET,
					tile[0], tile[1],
					128, 128,
					tileSize * (object.x + object.smallX / SMALL) - cameraX, tileSize * (object.y + object.smallY / SMALL) - cameraY,
					tileSize, tileSize
				);
			}
		}
		
		if (this.player) {
			// SHOW SCORE
			ctx.fillRect(0, 0.9 * h, w, h);
			ctx.font = "90px VT323";
			ctx.fillStyle = "#DC9F70";
			ctx.fillText(`LEVEL: ${game.level} | TREASURE LEFT: ${game.totalMoney - this.player.score} | YOUR SCORE: ${this.player.score}`, 0.04 * w, 0.98 * h);
			ctx.fillStyle = 'black';
		}
	}
	removeBlock() {
		for (var i = 0; i < this.holes.length; i++) {
			var hole = this.holes[i];
			// если это 1 2 3 4 5 тики то выставлять в карте 0 | / , .
			if (hole.y != this.player.y && hole.x != this.player.x) {
				this.map[hole.y][hole.x] = ':';
			}
			switch (this.globalTimer - hole.startTick) {
				case 1:
					this.map[hole.y][hole.x] = '0';
					break;
				case 2:
					this.map[hole.y][hole.x] = '|';
					break;
				case 3:
					this.map[hole.y][hole.x] = '/';
					break;
				case 4:
					this.map[hole.y][hole.x] = ',';
					break;
				case 5:
					this.map[hole.y][hole.x] = '.';
					break;
			}
			// если это -1 -2 -3 -4 -5 тики до конца то выставлять в обратном порядке
			switch (hole.endTick - this.globalTimer) {
				case 5:
					this.map[hole.y][hole.x] = '.';
					break;
				case 4:
					this.map[hole.y][hole.x] = ',';
					break;
				case 3:
					this.map[hole.y][hole.x] = '/';
					break;
				case 2:
					this.map[hole.y][hole.x] = '|';
					break;
				case 1:
					this.map[hole.y][hole.x] = '0';
					break;
			}
			// если это последний тик удалить из массива и сделать i--;
			if (hole.endTick === this.globalTimer) {
				this.map[hole.y][hole.x] = 'B';
				this.holes.splice(i, 1);
				i--;
			}
		}
	}

	widgets_select_prevnext_button(no,direction) {
		let i=no+direction;
		while (i>-1 && i<this.widgets.length) {
			if (this.widgets[i].type=="button" || this.widgets[i].type=="level") return i;
			i+=direction;
		}
		return -1;
	}

	widgets_keydown(key) {
		if (!this.widgets.length) return;
		let selected_no=-1;
		for (let i=0;i<this.widgets.length;i++) {
			if (this.widgets[i].selected) selected_no=i;
		}
		if (selected_no==-1) return;
		var to_select=-1;
		switch (key.keyCode) {
			case 38:// UP
				to_select=this.widgets_select_prevnext_button(selected_no,-1);
				break;
			case 40:// DOWN
				to_select=this.widgets_select_prevnext_button(selected_no,+1);
				break;
			case 32:// SPACE
				this.widgets_run(this.widgets[selected_no]);
				break;
		}
		if (to_select!=-1) {
			this.widgets[to_select].selected=1;
			this.widgets[selected_no].selected=0;
		}
	}
	widgets_run(widget) {
		switch (widget.onclick) {
			case "campaign":
				game.loadParticularLevel("campaignPreview");	
				break;		
			case "level":
				game.level=widget.level.replace(/level/,"")*1;
				game.loadParticularLevel("level"+game.level);
				break;
			case "menu":
				game.loadParticularLevel("start");
				game.pause=false;
				game.level=1;
				break;
			case "restart":
				game.loadParticularLevel("level"+game.level);
				break;
			case "highscores":
				break;
			case "levelEditor":
				game.loadParticularLevel("levelEditor",true);
				game.level = 1;
				game.objects.push(new Draw(1,1));
				break;
		}
	}
}

// KEYPRESS EVENTS
function handleKeys (key) {
	if (!game.bgmusic_played) {
		game.bgmusic_played = true;
		game.bgmusic.play();
	}
	if (game.player) game.player.keydown(key);
	game.widgets_keydown(key);
	if (game.draw) {
		game.draw.keydown(key);
		game.draw.moveBorder();
	}
	
};

document.onkeydown = handleKeys;
