class Shooter {
    constructor(direction, sticks) {
        this.direction = direction
        this.sticks = sticks
        const offset = 40
        if (direction === DirectionEnum.Top) {
            this.pos = createVector(WIDTH_HALF, HEIGHT_HALF - RECT_HEIGHT_HALF - offset)
        } else if (direction === DirectionEnum.Bottom) {
            this.pos = createVector(WIDTH_HALF, HEIGHT_HALF + RECT_HEIGHT_HALF + offset)
        } else if (direction === DirectionEnum.Left) {
            this.pos = createVector(WIDTH_HALF - RECT_WIDTH_HALF - offset, HEIGHT_HALF)
        } else if (direction === DirectionEnum.Right) {
            this.pos = createVector(WIDTH_HALF + RECT_WIDTH_HALF + offset, HEIGHT_HALF)
        }
        this.prevTarget = this.pos.copy()
        this.target = this.getNewTarget()
        this.frame = 0
    }

    update() {
        if (FAST_SHOOT) {
            if (this.isHorizontal()) this.pos.x = this.target.x; else this.pos.y = this.target.y;
        }

        let origTargetGap = this.isHorizontal() ? this.prevTarget.x - this.pos.x : this.prevTarget.y - this.pos.y
        let targetGap = this.isHorizontal() ? this.target.x - this.pos.x : this.target.y - this.pos.y
        if (abs(targetGap) < 1) {
            if (this.isHorizontal()) this.pos.x = this.target.x; else this.pos.y = this.target.y;
            this.shoot()
            this.prevTarget = this.target.copy()
            this.target = this.getNewTarget()
            return
        }

        let speed = map(abs(targetGap), 0, abs(origTargetGap), 0.5, 10, true)
        let direction = 1
        if (targetGap < 0) direction = -1
        if (this.isHorizontal()) this.pos.x += speed * direction; else this.pos.y += speed * direction;

        this.frame = ++this.frame % 6
    }

    draw() {
        push()
            translate(this.pos.x, this.pos.y)
            rotate(180) // sprite rotation
            if (this.direction === DirectionEnum.Top) {
                rotate(180)
            } else if (this.direction === DirectionEnum.Bottom) {
                rotate(0)
            } else if (this.direction === DirectionEnum.Left) {
                rotate(90)
            } else if (this.direction === DirectionEnum.Right) {
                rotate(270)
            }
            image(images.SHOOTER[this.frame], 0, 0, 100, 100)
        pop()
    }

    shoot() {
        this.sticks.push(new Stick(this.pos, this.target, this.direction))
        let numSticksToFire = FAST_SHOOT ? 10000 : 20
        for (let i = 0; i < numSticksToFire; i++) {
            let newTarget = this.getNewTarget()
            if (this.direction === DirectionEnum.Top || this.direction === DirectionEnum.Bottom) {
                newTarget.x = this.target.x
            } else if (this.direction === DirectionEnum.Left || this.direction === DirectionEnum.Right) {
                newTarget.y = this.target.y
            }

            this.sticks.push(new Stick(this.pos, newTarget, this.direction))
        }
    }

    getNewTarget() {
        return createVector(
            random(WIDTH_HALF - RECT_WIDTH_HALF, WIDTH_HALF + RECT_WIDTH_HALF),
            random(HEIGHT_HALF - RECT_HEIGHT_HALF, HEIGHT_HALF + RECT_HEIGHT_HALF))
    }

    isHorizontal() {
        return this.direction === DirectionEnum.Top || this.direction === DirectionEnum.Bottom
    }      
}