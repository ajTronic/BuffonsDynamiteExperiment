const RECT_WIDTH = 350
const RECT_HEIGHT = 600
const RECT_WIDTH_HALF = RECT_WIDTH / 2
const RECT_HEIGHT_HALF = RECT_HEIGHT / 2
const STICK_LEN = 10
const TARGET_LINES_LOOP_MAX = 29 // must be odd

// Use to speed up the simulation. First update FAST_DRAW, then FAST_SHOOT
let FAST_SHOOT = false 
let FAST_DRAW = false

let HEIGHT_HALF, // will be set in setup
  WIDTH_HALF,
  RECT_BOTTOM_Y,
  RECT_TOP_Y,
  RECT_LEFT_X,
  RECT_RIGHT_X

let sticks = []
let targetLines = []
let shooters = []
let explosions = []

let numDeadSticks = 0
let numDeadSticksExploded = 0

let images = {
  SHOOTER: [],
  EXPLOSION: [],
  RIVER: null,
}

const DirectionEnum = Object.freeze({
  Top: 0,
  Bottom: 1,
  Left: 2,
  Right: 3,
});

// load images
function preload() {
  for (let i = 0; i < 6; i++) images.SHOOTER.push(loadImage(`../assets/helicopter/frame${i + 1}.png`))
  for (let i = 0; i < 21; i++) images.EXPLOSION.push(loadImage(`../assets/explosion/frame${i}.png`))
  images.BACKGROUND = loadImage("../assets/background.jpg")
}

function setup() {
  createCanvas(1080/2, 1920/2)
  rectMode("center")
  imageMode("center")
  angleMode("degrees")
  textAlign("center")
  textSize(35)
  textFont('monospace')
  noSmooth()

  // declare dynamic sizes
  HEIGHT_HALF = height / 2 + 50
  WIDTH_HALF = width / 2
  RECT_BOTTOM_Y = HEIGHT_HALF + RECT_HEIGHT_HALF
  RECT_TOP_Y = HEIGHT_HALF - RECT_HEIGHT_HALF
  RECT_LEFT_X = WIDTH_HALF - RECT_WIDTH_HALF
  RECT_RIGHT_X = WIDTH_HALF + RECT_WIDTH_HALF

  // adding target lines
  for (let i = 1; i <= TARGET_LINES_LOOP_MAX; i = i + 2) {
    targetLines.push(HEIGHT_HALF - STICK_LEN * i)
    targetLines.push(HEIGHT_HALF + STICK_LEN * i)
  }

  shooters.push(new Shooter(DirectionEnum.Top, sticks))
  shooters.push(new Shooter(DirectionEnum.Bottom, sticks))
  shooters.push(new Shooter(DirectionEnum.Left, sticks))
  shooters.push(new Shooter(DirectionEnum.Right, sticks))
}

function draw() {
  background('white')

  if (!FAST_DRAW) {
    push()
    tint(255, 55); // opacity
    image(images.BACKGROUND, WIDTH_HALF, HEIGHT_HALF, RECT_WIDTH, RECT_HEIGHT)
    pop()
  }

  // draw lines
  stroke('black')
  strokeWeight(2)

  for (const targetLine of targetLines) {
    line(WIDTH_HALF - RECT_WIDTH_HALF, targetLine, WIDTH_HALF + RECT_WIDTH_HALF, targetLine)
  }
  
  let deadSticks = []
  for (let i = sticks.length-1; i >= 0; i--) {
    const stick = sticks[i];
    stick.update()
    if (!FAST_DRAW) stick.draw()
    if (stick.isDead()) {
      deadSticks.push(stick)
      sticks.splice(i, 1)
    }
  }

  for (const shooter of shooters) {
    shooter.update()
    if (!FAST_DRAW) shooter.draw()
  }

  for (let i = explosions.length-1; i >= 0; i--) {
      const explosion = explosions[i];
      explosion.update()
      explosion.draw()
      if (explosion.isDead) {
        explosions.splice(i, 1)
      }
  }

  // draw pi
  numDeadSticks += deadSticks.length
  numDeadSticksExploded += deadSticks.filter(m => m.isIntersect).length
  if (numDeadSticksExploded > 0) {
    push()
    let fractionRight = 300
    let charWidth = 39/2
    line(fractionRight - numDeadSticks.toLocaleString().length * charWidth, 65, fractionRight, 65) // vinculum
    fill('black')
    noStroke()
    textAlign(RIGHT);
    text(`${numDeadSticks.toLocaleString()}`, fractionRight, 50) // numerator
    text(`${numDeadSticksExploded.toLocaleString()}`, fractionRight, 100) // denominator
    textAlign(CENTER);
    text(`=`, fractionRight + 23, 75);
    textAlign(LEFT);
    let piApprox = (numDeadSticks / numDeadSticksExploded).toFixed(5).toString()
    let piDigitParams = {success: true, fractionRight: fractionRight, charWidth: charWidth, piApprox: piApprox}
    drawPiDigit(piDigitParams, 0, '3')
    drawPiDigit(piDigitParams, 1, '.')
    drawPiDigit(piDigitParams, 2, '1')
    drawPiDigit(piDigitParams, 3, '4')
    drawPiDigit(piDigitParams, 4, '1')
    drawPiDigit(piDigitParams, 5, '5')
    drawPiDigit(piDigitParams, 6, '9')
    pop()
  }
}

function drawPiDigit(params, index, expectedValue) {
  let printMe = params.piApprox[index]
  if (printMe !== expectedValue) params.success = false
  textStyle(params.success ? BOLD : NORMAL);
  fill(params.success ? 'green' : 'lightgrey')
  text(`${printMe}`, params.fractionRight + 42 + params.charWidth*index, 75)
}

function constrainAngle(angle) {
  let result = angle
  while (result < 0) result += 360
  while (result > 360) result -= 360
  return result
}
