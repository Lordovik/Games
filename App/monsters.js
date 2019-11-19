/* global game */
class Monster extends Creature {
	constructor(y, x) {
		super(y, x);
		this.face = 'MF';

		this.tempX;
		this.tempY;
	}
	can_move_to(newx, newy) {
		// if (game.map[this.y][this.x] == ':') return false;
		if (newx < 0) return false;
		if (newx >= game.map[0].length) return false;
		if (newy < 0) return false;
		if (newy >= game.map.length) return false;
		if (game.map[newy][newx].match(/^[BU:]$/)) {
			return false;
		}
		return true;
	}
	can_fall() {
	//	if (game.pause)return false;
		var player=game.player || game.random_player();
		if (this.y >= game.map.length - 1 || this.smallX) return false;
		for (let i = 0; i < game.objects.length; i++) {
			if (game.objects[i].y == this.y + 1 && game.objects[i].x == this.x) {
				return false;
			}
		}
		if (
			(
				(!game.map[this.y][this.x].match(/^[#_,./|0:]$/) ||
					(
						(game.map[this.y][this.x].match(/^[_]$/)) &&
						(this.x == player.x) && this.pldY >= 0)) && // Мы не на лестнице и не на веревке
				!game.map[this.y + 1][this.x].match(/^[BU#]$/)) ||  // Под нами нет блока или лестницы
			(this.x == player.x && this.y + 1 == player.y)
		) return true;
		return false;
	}
	switch_face() {
		if (this.directionY && !this.can_fall() && game.map[this.y][this.x] == '#') {				 			// stairs animation
			this.face = "MS";
		} else if ((this.directionY && this.can_fall()) ||										// staying or falling	 
			(!this.directionY && !this.directionX)) {
			this.face = "MF";
		} else if (this.directionX && !this.can_fall() && game.map[this.y + 1][this.x] != " ") {	  				// running
			if (this.directionX == 1) {
				this.face = "MR";												// right
			} else if (this.directionX == -1) {											// left
				this.face = "ML";
			}
		} else if (!this.can_fall()) {
			if (this.directionX == 1) {												// rope right
				this.face = "MRR"
			} else if (this.directionX == -1) {											// rope left
				this.face = "MRL";
			}
		}
	}
	move() {
		if (this.can_fall()) {
			this.small_move(0, 1);
			this.directionX = 0, this.directionY = 0;
			return;
		}
		if (
			!this.smallX &&
			this.directionY && this.can_move_to(this.x, this.y + this.directionY) &&
			(game.map[this.y][this.x] == "#" || (game.map[this.y][this.x] == "_" && this.directionY == 1) ||
				((game.map[this.y + 1][this.x] == "#") && (this.directionY >= 0)))
		) {
			this.small_move(0, this.directionY);
			return;
		}
		if (
			this.smallY
		) {
			this.small_move(0, this.smallY / Math.abs(this.smallY));
		}

		if (this.directionX && this.can_move_to(this.x + this.directionX, this.y)) {
			this.small_move(this.directionX, 0);
			return;
		}
		if (this.directionY && this.smallX) {
			this.smallX = 0;
		}
	}
	tick() {
		var player=game.player || game.random_player();
		if (game.map[this.y][this.x] == ':') {
			this.directionX = 0;
			return;
		}
		if (game.map[this.y][this.x].match(/^[BU]$/)) this.y = this.y - 1;

		if (!player) return;
		if (this.x == player.x && (this.y == player.y || (this.y + 1 == player.y && game.map[this.y][this.x] != ':'))) {
			game.monsterSound.play();
			player.alive = false;			  // if catch player
		}
		if ((this.x == player.x && this.y == player.y - 1) &&
			(game.map[this.y][this.x] != '_')) {
			this.y++;
		}

		this.pldX = player.x - this.x;
		if (this.pldX) this.pldX = this.pldX / Math.abs(this.pldX);

		if (Math.hypot((this.x - player.x), (this.y - player.y)) < 5) {
			game.runningSound.play();
		}

		this.pldY = player.y - this.y;
		if (this.pldY) this.pldY = this.pldY / Math.abs(this.pldY);

		if (this.smallX || this.smallY) {
			return;

		} else if (!this.directionX && !this.directionY) {				  // if stay
			this.directionX = this.pldX;									// move to player

		}

		else if (this.directionX &&
			(game.map[this.y][this.x] == '#' ||					   // move X and found stairs
				game.map[this.y - 1][this.x] == '#')) {					  // and there is stairs to the player
			this.directionX = 0;
			if (this.pldY) {
				this.directionY = this.pldY;
			} else {
				this.directionY = -1;								 // go UPstairs
			}

		} else if (this.directionX &&									   // if move away from the player
			(game.map[this.y][this.x] == '#' ||						// and found stairs
				game.map[this.y + 1][this.x] == '#')) {					  // and can go DOWNstairs
			this.directionX = 0;
			this.directionY = 1;								  // go DOWNstairs

		} else if (this.directionX &&									   // if move away from the player
			game.map[this.y][this.x] == '#' &&						// and found stairs
			game.map[this.y - 1][this.x] == '#') {					  // and can go UPstais
			this.directionX = 0;
			if (this.pldY) {
				this.directionY = this.pldY;
			} else {
				this.directionY = -1;								 // go UPstairs
			}

		} else if (this.directionX &&
			!this.can_move_to(this.x + this.directionX, this.y)) {	  // go X and met the barrier
			this.directionX = -this.directionX;

		} else if (this.directionY &&									   // go Y
			this.can_move_to(this.x + this.pldX, this.y) &&			// and can go to the player
			((!this.can_move_to(this.x + this.pldX, this.y + 1)) ||	  // and there is a ground to step on it
				(game.map[this.y][this.x + this.pldX] == "_"))) {		  // or there is a rope
			this.directionX = this.pldX;
			this.directionY = 0;								  // go there

		} else if (this.directionY &&									   // go Y
			(!this.can_move_to(this.x, this.y + 1) || (game.map[this.y][this.x] == ' ')) &&	   // met the barrier
			this.can_move_to(this.x + this.pldX, this.y)) {			  // can jump off to the player
			this.directionX = this.pldX;							  // jump off
			this.directionY = 0;

		} else if (this.directionY &&									   // go Y
			!this.can_move_to(this.x, this.y + this.directionY)) {	   // met the barrier		
			this.directionY = -this.directionY;
		}
	}
}
