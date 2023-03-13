class Explosion {
    constructor(x, y) {
        this.frame = 0
        this.x = x
        this.y = y
        this.isDead = false
        this.displayRate = 3
        this.rotation = random(360)
        this.image = null
    }

    update() {
        if (this.frame >= (images.EXPLOSION.length) * this.displayRate) {
            this.isDead = true
        }
        this.image = images.EXPLOSION[Math.floor(this.frame/this.displayRate)]
        this.frame++
    }
    
    draw() {
        if (this.isDead) return
        push()
        translate(this.x, this.y)
        rotate(this.rotation)
        image(this.image, 0, 0, 60, 60)
        pop()
    }
}