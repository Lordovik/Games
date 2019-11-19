var SMALL=8;
// ANY CREATURES PARENT CLASS
class Creature {
    constructor(y, x) {
        this.y = y;
        this.x = x;
        this.alive = true;
        this.directionX = 0;
        this.directionY = 0;
        this.face = "";
        this.smallX=0;
        this.smallY=0;


        this.tileno = 0;
    }

    tick() {

    }
    can_fall() {
        if (this.y>=game.map.length-1) return false;

        if (
            !game.map[this.y][this.x].match(/^[#_]$/) && // Мы не на лестнице и не на веревке
            !game.map[this.y+1][this.x].match(/^[BU#0|/,.]$/)  // Под нами нет блока или лестницы
        ) return true;
        return false;
    }
    small_move(dx,dy) {
        this.tileno++;
        this.smallX+=dx;
        this.smallY+=dy;
        if (this.smallX>=SMALL) {
            this.smallX-=SMALL;
            this.x++;
        }
        if (this.smallX<=-SMALL) {
            this.smallX+=SMALL;
            this.x--;
        }
        if (this.smallY>=SMALL) {
            this.smallY-=SMALL;
            this.y++;
        }
        if (this.smallY<=-SMALL) {
            this.smallY+=SMALL;
            this.y--;
        }
    }
    can_move_to(newx,newy) {
        if (newx<0) return false;
        if (newx>=game.map[0].length) return false;
        if (newy<0) return false;
        if (newy>=game.map.length) return false;
        if (game.map[newy][newx].match(/^[BU]$/)) {
            this.directionX = 0, this.directionY = 0;
            return false;
        } 
        return true;
    }
    move() {
        if (this.can_fall()) {
            this.small_move(0,1);
            return;
        }
        if (
            !this.smallX &&
            this.directionY && this.can_move_to(this.x,this.y+this.directionY) &&
            (game.map[this.y][this.x]=="#" || (game.map[this.y][this.x]=="_" && this.directionY==1) ||
            ((game.map[this.y+1][this.x]=="#") && (this.directionY >= 0)))
            ) {
            this.small_move(0,this.directionY);
            return;
        }
        if (
            this.smallY
        ) {
            this.small_move(0, this.smallY/Math.abs(this.smallY));
        }

        if (this.directionX && this.can_move_to(this.x+this.directionX,this.y)) {
            this.small_move(this.directionX,0);
            return;
        }
        if (this.directionY && this.smallX) {
            this.smallX = 0;
        }
    }
}
