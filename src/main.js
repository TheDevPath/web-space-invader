import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false, // Set to true if you want to see physics boundaries
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

let ship;
let cursors;
let bullets;
let aliens;
let alienVelocity = 250; // Horizontal velocity of the aliens
let alienDirection = 1; // 1 for right, -1 for left

function preload() {
  // Preload the player ship and alien images
  this.load.image('playerShip', '/assets/playerShip.png');
  this.load.image('alien', '/assets/alien.png');
}

function create() {
  // Create the player's ship as a physics-enabled sprite using the preloaded texture
  ship = this.physics.add.sprite(
    this.sys.game.config.width / 2, // Center horizontally
    this.sys.game.config.height - 30, // Position near the bottom
    'playerShip' // Use the preloaded texture
  );

  // Enable collision with world bounds
  ship.body.setCollideWorldBounds(true);

  // Enable keyboard input for arrow keys
  cursors = this.input.keyboard.createCursorKeys();

  // Create a group for bullets
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10, // Limit the number of bullets
  });

  // Add a key listener for shooting
  this.input.keyboard.on('keydown-SPACE', shootBullet, this);

  // Create a group for aliens
  aliens = this.physics.add.group();

  // Arrange aliens in a grid using the preloaded texture
  const rows = 3; // Number of rows
  const cols = 8; // Number of columns
  const alienWidth = 40; // Width of each alien
  const alienHeight = 40; // Height of each alien
  const spacingX = 20; // Horizontal spacing between aliens
  const spacingY = 20; // Vertical spacing between rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = 100 + col * (alienWidth + spacingX); // Calculate x position
      const y = 50 + row * (alienHeight + spacingY); // Calculate y position
      const alien = aliens.create(x, y, 'alien'); // Use the preloaded texture
      alien.setSize(alienWidth, alienHeight); // Set size for collision detection
      alien.setActive(true);
      alien.setVisible(true);
    }
  }

  // Add collision detection between bullets and aliens
  this.physics.add.overlap(
    bullets,
    aliens,
    handleBulletAlienCollision,
    null,
    this
  );

  // Add collision detection between aliens and the player's ship
  this.physics.add.overlap(aliens, ship, handleAlienShipCollision, null, this);
}

function resetAliens() {
  // Reset the alien group to start from the top
  const rows = 3; // Number of rows
  const cols = 8; // Number of columns
  const alienWidth = 40; // Width of each alien
  const alienHeight = 40; // Height of each alien
  const spacingX = 20; // Horizontal spacing between aliens
  const spacingY = 20; // Vertical spacing between rows

  aliens.clear(true, true); // Remove all existing aliens

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = 100 + col * (alienWidth + spacingX); // Calculate x position
      const y = 50 + row * (alienHeight + spacingY); // Calculate y position
      const alien = aliens.create(x, y, 'alien');
      alien.setSize(alienWidth, alienHeight); // Set size for collision detection
      alien.setActive(true);
      alien.setVisible(true);
    }
  }
}

function update() {
  // Move the ship left or right based on arrow key input
  const speed = 5;

  if (cursors.left.isDown) {
    ship.x = Math.max(20, ship.x - speed); // Adjusted left boundary to 5
  } else if (cursors.right.isDown) {
    ship.x = Math.min(
      this.sys.game.config.width - ship.displayWidth + 20,
      ship.x + speed
    ); // Adjusted right boundary to account for ship width and added a 5px margin
  }

  // Update bullets
  bullets.children.each((bullet) => {
    if (bullet.active && bullet.y < 0) {
      bullet.setSize(5, 5);
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // Move aliens
  let hitEdge = false;
  aliens.children.each((alien) => {
    if (alien.active) {
      alien.x += alienDirection * alienVelocity * 0.016; // Move horizontally (0.016 is ~60fps delta time)

      // Check if an alien hits the edge of the canvas
      if (alien.x < 30 || alien.x + alien.width > this.sys.game.config.width) {
        hitEdge = true;
      }
    }
  });

  // Reverse direction and move down if an edge is hit
  if (hitEdge) {
    alienDirection *= -1; // Reverse direction
    aliens.children.each((alien) => {
      if (alien.active) {
        alien.y += 20; // Move down
      }
    });
  }

  // Check if any alien has passed the bottom of the canvas
  let aliensPassedBottom = false;
  aliens.children.each((alien) => {
    if (alien.active && alien.y > this.sys.game.config.height) {
      aliensPassedBottom = true;
    }
  });

  // Check if all aliens are inactive
  const allAliensDestroyed = aliens.countActive() === 0;

  // Reset aliens if they pass the bottom or all are destroyed
  if (aliensPassedBottom || allAliensDestroyed) {
    resetAliens();
  }
}

function shootBullet() {
  // Get a bullet from the group
  const bullet = bullets.get(ship.x + ship.width / 2 - 2.5, ship.y - 10);

  if (bullet) {
    // Set bullet properties
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.velocity.y = -300; // Move bullet upward
  }
}

function handleBulletAlienCollision(bullet, alien) {
  // Deactivate and hide the bullet
  bullet.setActive(false);
  bullet.setVisible(false);

  // Deactivate and hide the alien
  alien.setActive(false);
  alien.setVisible(false);
}

function handleAlienShipCollision(alien, ship) {
  // Stop the game
  this.physics.pause();

  // Disable shooting by removing the spacebar listener
  this.input.keyboard.off('keydown-SPACE', shootBullet, this);

  // Display a Game Over message
  const gameOverText = this.add.text(
    this.sys.game.config.width / 2,
    this.sys.game.config.height / 2,
    'Game Over',
    { fontSize: '48px', fill: '#fff' }
  );
  gameOverText.setOrigin(0.5);
}
