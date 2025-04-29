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

function preload() {
  // Load assets here
}

function create() {
  // Initialize game objects here
}

function update() {
  // Game loop logic here
}
