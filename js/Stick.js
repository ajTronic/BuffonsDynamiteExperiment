class Stick {
    constructor(front, targetFront, shooterDirection) {
        this.shooterDirection = shooterDirection

        this.front = front.copy()
        this.angle = 90
        this.back = createVector(cos(this.angle), sin(this.angle)).mult(STICK_LEN).add(this.front)

        this.origFront = this.front.copy()
        this.origBack = this.back.copy()
        this.origAngle = this.angle

        this.targetFront = targetFront.copy()
        this.targetAngle = random(0, 360)
        this.targetBack = createVector(cos(this.targetAngle), sin(this.targetAngle)).mult(STICK_LEN).add(this.targetFront)

        this.isIntersect = false
        this.speed = null
    }

    update() {
        if (FAST_SHOOT) {
            this.front = this.targetFront.copy()
            this.back = this.targetBack.copy()
        }

        let origTargetGap = this.getOrigTargetGap()
        let targetGap = this.getTargetGap()
        if (abs(targetGap) < 1) { // we reached our destination
            this.front = this.targetFront.copy()
            this.back = this.targetBack.copy()
            this.speed = 0

            let intersectPos = null
            for (const line of targetLines) {
                if (this.front.y > line && this.back.y < line) {
                    let frontYGap = this.front.y - line
                    let backYGap = line - this.back.y
                    let intersectDist = STICK_LEN*frontYGap/(frontYGap+backYGap)
                    intersectPos = createVector(
                        this.front.x + cos(this.angle)*intersectDist, 
                        this.front.y + sin(this.angle)*intersectDist)
                    this.isIntersect = true
                }
                else if (this.front.y < line && this.back.y > line) {
                    let frontYGap = line - this.front.y
                    let backYGap = this.back.y - line
                    let intersectDist = STICK_LEN*frontYGap/(frontYGap+backYGap)
                    intersectPos = createVector(
                        this.front.x + cos(this.angle)*intersectDist, 
                        this.front.y + sin(this.angle)*intersectDist)
                    this.isIntersect = true
                }
            }

            if (this.isIntersect) {
                if (!FAST_DRAW) {
                    explosions.push(new Explosion(intersectPos.x, intersectPos.y))
                }
            }
        } else {
            this.speed = map(abs(targetGap), abs(origTargetGap), 0, 10, 1, true)
        }

        let direction = 1
        if (targetGap > 0) direction = -1
        if (this.isHorizontal()) this.front.y += this.speed * direction; else this.front.x += this.speed * direction;
        
        this.angle = map(targetGap, origTargetGap, 0, 90, this.targetAngle)
        this.back = createVector(cos(this.angle), sin(this.angle)).mult(STICK_LEN).add(this.front)
    }

    draw() {
        let origTargetGap = this.getOrigTargetGap()
        let targetGap = this.getTargetGap()

        let stickWidth = map(targetGap, origTargetGap, 0, 10, 1)
        push()
        stroke('red')
        strokeWeight(stickWidth)
        line(
            this.front.x + cos(this.angle + 180) * stickWidth, 
            this.front.y + sin(this.angle + 180) * stickWidth, 
            this.back.x + cos(this.angle) * stickWidth, 
            this.back.y + sin(this.angle) * stickWidth)
        pop()

        push()
        fill(219, 20, 30)
        noStroke()
        circle(this.front.x + cos(this.angle + 180) * stickWidth, this.front.y + sin(this.angle + 180) * stickWidth, stickWidth)
        stroke('grey')
        line(
            this.front.x + cos(this.angle + 180) * stickWidth, this.front.y + sin(this.angle + 180) * stickWidth,
            this.front.x + cos(this.angle + 180) * stickWidth*2,  this.front.y + sin(this.angle + 180) * stickWidth*2, 1)
        pop()
    }

    getOrigTargetGap() { return this.isHorizontal() ? this.origFront.y - this.targetFront.y : this.origFront.x - this.targetFront.x; }
    getTargetGap() { return this.isHorizontal() ? this.front.y - this.targetFront.y : this.front.x - this.targetFront.x; }

    isHorizontal() {
        return this.shooterDirection === DirectionEnum.Top || this.shooterDirection === DirectionEnum.Bottom
    }

    isDead() {
        return this.speed === 0
    }
}