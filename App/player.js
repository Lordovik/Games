/* global game */
class Player extends Creature {
	constructor(y, x) {
		super(y,x);
		this.alive = true;
		this.face = "PF";

		this.score = 0;

		this.destroyBlock = 0;		
	}
	can_fall() {
		if (this.y>=game.map.length-1) return false;
		for (let i = 0; i < game.objects.length; i++) {
			if (game.objects[i].y==this.y+1 && game.objects[i].x==this.x) {
				return false;
			}
		} 
		if (
			((!game.map[this.y][this.x].match(/^[#_]$/)) || ((game.map[this.y][this.x].match(/^[_]$/)) && (!this.directionX))) && // Мы не на лестнице и не на веревке
			!game.map[this.y+1][this.x].match(/^[BU#0|/,.]$/)   							// Под нами нет блока или лестницы
		)  return true;
		return false;
	}
	// ANIMATION	
	switch_face(){ 
		if (this.directionY && !this.can_fall() && game.map[this.y][this.x]=='#') {				 	// stairs animation
			this.face = "PS";
		} else if ((this.directionY && this.can_fall()) ||								// staying or falling	 
		 (!this.directionY && !this.directionX)){
			this.face = "PF";
		} else if (this.directionX && !this.can_fall() && game.map[this.y+1][this.x] != " ") {	  			// running
			if (this.directionX == 1) {
				this.face = "PR";										// right
			} else if (this.directionX == -1){									// left
				this.face = "PL";
			}
		} else if (!this.can_fall()){
			if (this.directionX == 1) {										// rope right
				this.face = "PRR"
			} else if (this.directionX == -1) {									// rope left
				this.face = "PRL";
			}
		}
	}
	tick (){
		if (game.map[this.y][this.x] === '$'){
			game.map[this.y][this.x] = ' ';
			game.takeTreasureSound.play();
			this.score++;
		}
		if (this.destroyBlock && game.map.length>this.y+1 && game.map[this.y+1][[this.x]]=="B") {
			game.destroySound.play();
			game.destroyBlock(this.x,this.y+1);
		}
		game.removeBlock();
		if (game.map[this.y][this.x].match(/^[BU]$/)) {
			this.alive = false;
		}
	}
	keydown(key) {
		switch (key.keyCode) {
			case 37:
				// left
				this.directionX = -1;
				this.directionY = 0;
				break;
			case 38:
				// up
				this.directionY = -1;
				break;
			case 39:
				// right
				this.directionX = 1;
				this.directionY = 0;
				break;
			case 40:
				// down
				this.directionY = 1;
				break;
			case 32:
				// destroy block
				this.destroyBlock = 1;
				break;
		
			case 27:
				// esc to pause
				game.onPause();
				break;

		}

	}
}
