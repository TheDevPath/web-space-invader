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
let graphics;
let bullets;
let aliens;
let alienVelocity = 50; // Horizontal velocity of the aliens
let alienDirection = 1; // 1 for right, -1 for left

function preload() {
  // Load assets here
}

function create() {
  // Use the existing `graphics` variable declared at the top
  graphics = this.add.graphics();

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

  // Arrange aliens in a grid
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
      const alien = aliens.create(x, y, 'alien');
      alien.setSize(alienWidth, alienHeight); // Set size for collision detection
      alien.setActive(true);
      alien.setVisible(true);
    }
  }

  // Add collision detection between bullets and aliens
  this.physics.add.overlap(bullets, aliens, handleBulletAlienCollision, null, this);
}

function update() {
  // Clear the graphics object to remove previous drawings
  graphics.clear();

  // Move the ship left or right based on arrow key input
  const speed = 5;

  if (cursors.left.isDown) {
    ship.x = Math.max(0, ship.x - speed); // Move left, stay within bounds
  } else if (cursors.right.isDown) {
    ship.x = Math.min(this.sys.game.config.width - ship.width, ship.x + speed); // Move right, stay within bounds
  }

  // Redraw the ship at its new position
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(ship.x, ship.y, ship.width, ship.height);
  graphics.fillRect(ship.x + ship.width / 2 - 5, ship.y - 10, 10, 10); // Cannon

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
