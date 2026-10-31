const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');

// Load Assets
const birdImg = new Image();
birdImg.src = 'face.png'; // Make sure this file exists in your folder!

const bgMusic = new Audio('music.mp3'); // Make sure this file exists!
bgMusic.loop = true;

// Game Variables
let gameStarted = false;
let gameOver = false;
let score = 0;

// Bird Object
const bird = {
    x: 50,
    y: 150,
    width: 50,
    height: 50,
    gravity: 0.3,
    velocity: 0,
    jump: -6.5,
    reset() {
        this.y = 150;
        this.velocity = 0;
    }
};

// Pipes Array
let pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 2.5;

function spawnPipe() {
    let minHeight = 50;
    let maxHeight = canvas.height - pipeGap - 100;
    let height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({
        x: canvas.width,
        top: height,
        bottom: canvas.height - height - pipeGap,
        passed: false
    });
}

// Controls
function handleStartOrJump() {
    if (!gameStarted) {
        gameStarted = true;
        startScreen.style.display = 'none';
        bgMusic.play().catch(e => console.log("Audio play blocked by browser until interaction."));
    }
    if (gameOver) {
        resetGame();
    } else {
        bird.velocity = bird.jump;
    }
}

// Input Listeners (PC & Mobile)
window.addEventListener('keydown', (e) => { if (e.code === 'Space') handleStartOrJump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleStartOrJump(); }, { passive: false });
canvas.addEventListener('mousedown', (e) => { handleStartOrJump(); });

function resetGame() {
    bird.reset();
    pipes = [];
    score = 0;
    gameOver = false;
    spawnPipe();
}

// Main Game Loop
function update() {
    if (gameStarted && !gameOver) {
        // Bird logic
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Floor/Ceiling collision
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            gameOver = true;
        }

        // Pipe logic
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
            spawnPipe();
        }

        pipes.forEach((pipe, index) => {
            pipe.x -= pipeSpeed;

            // Collision detection
            if (bird.x < pipe.x + pipeWidth &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
                gameOver = true;
            }

            // Score updating
            if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
                pipe.passed = true;
                score++;
            }

            // Remove off-screen pipes
            if (pipe.x + pipeWidth < 0) {
                pipes.splice(index, 1);
            }
        });
    }

    draw();
    requestAnimationFrame(update);
}

// Render Function
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background placeholder (Sky color defaults from CSS)
    
    // Draw Pipes
    ctx.fillStyle = '#73bf2e';
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });

    // Draw Bird (Friend's Face)
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Draw Score
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.font = 'bold 35px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(score, canvas.width / 2, 60);
    ctx.fillText(score, canvas.width / 2, 60);

    // Draw Game Over Screen
    if (gameOver) {
        ctx.strokeText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = '20px sans-serif';
        ctx.strokeText("Tap / Space to restart", canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText("Tap / Space to restart", canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Start Game Loop
spawnPipe();
update();
