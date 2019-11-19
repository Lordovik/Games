class Draw extends Creature {
	constructor(y,x){
		super(y,x);
		this.x = x;
		this.y = y;
		this.value = ' ';
		this.face = ' ';
		this.tileno = 0;
	}
	can_fall(){return false};
	can_move_to(){return true};
//	small_move(){};
	move(){};
	switch_face(){};


	moveBorder(){
		if (this.y==game.map.length-2) {
			game.map[game.map.length-1].push("U");
			for (let i=1;i<game.map[this.y].length;i++){
				game.map[game.map.length-1].push(" ");
			}
			game.map.push([]);
		}
		if (this.x==game.map[0].length-1) {
			game.map[0].push("U");
			for (let i=1;i<game.map.length;i++){
				game.map[i].push(" ");
			} 
		} 
	}
	
	tick(){
		(game.globalTimer % 75 > 36) ? this.face=' ' : this.face=this.value;
	}
	
	keydown(key) {
	switch (key.keyCode) {
		case 37:
			// left
			if (this.x > 1 && !game.pause) this.x--;
			break;
		case 38:
			// up
			if (this.y > 1 && !game.pause) this.y--;
			break;
		case 39:
			// right
			if (!game.pause) this.x++;
			break;
		case 40:
			// down
			if (!game.pause) this.y++;
			break;
		case 32:
			// draw block
			game.map[this.y][this.x]=this.value;
			break;
		case 48:	// key 0
			this.value=' ';
			this.face=' ';
			break;
		case 49:	// key 1
			this.value='U';
			this.face='U';
			break;
		case 50:	// key 2
			this.value='B';
			this.face='B';
			break;
		case 51:	// key 3
			this.value='#';
			this.face='#';
			break;
		case 52:	// key 4
			this.value='$';
			this.face='$';
			break;
		case 53:	// key 5
			this.value='_';
			this.face='_';
			break;
		case 77:	// key M
			this.value='M';
			this.face='M';
			break;
		case 72:	// key H
			this.value='H';
			this.face='H';
			break;
		case 27:	// esc to pause
			game.onPause();
			break;
		}
	}

}
