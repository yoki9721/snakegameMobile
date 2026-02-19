// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverDiv = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Set canvas size based on screen size
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 40, 500);
    const maxHeight = Math.min(window.innerHeight - 400, 500);
    const size = Math.min(maxWidth, maxHeight);
    canvas.width = size;
    canvas.height = size;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop = null;

// Initialize high score display
highScoreElement.textContent = highScore;

// Generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// Draw functions
function drawGame() {
    clearCanvas();
    drawSnake();
    drawFood();
}

function clearCanvas() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = '#4CAF50';
    for (let segment of snake) {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    }
    
    // Draw snake head differently
    ctx.fillStyle = '#66BB6A';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
}

function drawFood() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

// Game logic
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
        
        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverDiv.classList.remove('hidden');
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOverDiv.classList.add('hidden');
    generateFood();
    gameRunning = true;
    gameLoop = setInterval(update, 100);
}

function update() {
    if (gameRunning) {
        moveSnake();
        drawGame();
    }
}

// Direction control
function changeDirection(newDx, newDy) {
    // Prevent reversing into itself
    if ((dx !== 0 && newDx === -dx) || (dy !== 0 && newDy === -dy)) {
        return;
    }
    
    if (!gameRunning && (dx === 0 && dy === 0)) {
        resetGame();
        return;
    }
    
    dx = newDx;
    dy = newDy;
    
    if (!gameRunning) {
        resetGame();
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
            e.preventDefault();
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            changeDirection(1, 0);
            break;
    }
});

// Button controls
document.getElementById('btnUp').addEventListener('click', () => changeDirection(0, -1));
document.getElementById('btnDown').addEventListener('click', () => changeDirection(0, 1));
document.getElementById('btnLeft').addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('btnRight').addEventListener('click', () => changeDirection(1, 0));

// Touch/Swipe controls for mobile
let touchStartX = null;
let touchStartY = null;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (touchStartX === null || touchStartY === null) return;
    
    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                changeDirection(1, 0); // Right
            } else {
                changeDirection(-1, 0); // Left
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                changeDirection(0, 1); // Down
            } else {
                changeDirection(0, -1); // Up
            }
        }
    }
    
    touchStartX = null;
    touchStartY = null;
}, { passive: false });

// Prevent scrolling on touch
document.addEventListener('touchmove', (e) => {
    if (e.target === canvas || e.target.closest('.control-btn')) {
        e.preventDefault();
    }
}, { passive: false });

// Restart button
restartBtn.addEventListener('click', resetGame);

// Prevent context menu on long press
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Initialize game
generateFood();
drawGame();

// Start game on first move
canvas.addEventListener('click', () => {
    if (!gameRunning && dx === 0 && dy === 0) {
        // Don't start automatically, wait for first direction input
    }
});
