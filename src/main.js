import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let ship;

function preload() {
  // Load assets here
}

function create() {
  // Create a graphics object
  const graphics = this.add.graphics();

  // Set the fill color to white
  graphics.fillStyle(0xffffff, 1);

  // Draw the ship's body (a rectangle)
  const shipWidth = 50;
  const shipHeight = 20;
  const cannonHeight = 10;
  const canvasWidth = this.sys.game.config.width;
  const canvasHeight = this.sys.game.config.height;

  // Center the ship horizontally on the canvas
  const shipX = canvasWidth / 2 - shipWidth / 2;
  const shipY = canvasHeight - shipHeight - 10; // 10px above the bottom

  graphics.fillRect(shipX, shipY, shipWidth, shipHeight);

  // Draw the ship's cannon (a smaller rectangle on top)
  const cannonX = shipX + shipWidth / 2 - 5;
  const cannonY = shipY - cannonHeight;
  graphics.fillRect(cannonX, cannonY, 10, cannonHeight);

  // Store the ship's position for movement
  ship = { x: shipX, y: shipY, width: shipWidth, height: shipHeight };
}

function update() {
  // Game loop logic here
}
