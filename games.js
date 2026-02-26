// ==========================================
// SNAKE GAME ENGINE
// ==========================================
function initSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 10;
    const width = canvas.width / gridSize;
    const height = canvas.height / gridSize;

    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    let food = spawnFood();
    let score = 0;

    window.snakeDir = 'R';
    window.snakeNextDir = 'R';
    window.snakeEngineActive = true;
    document.getElementById('snake-gameover').style.display = 'none';
    document.getElementById('snake-score').innerText = 'SCORE: 0';

    if (window.snakeInterval) clearInterval(window.snakeInterval);

    function spawnFood() {
        let newFood;
        while (true) {
            newFood = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height)
            };
            // Ensure food is not on snake
            let onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
            if (!onSnake) break;
        }
        return newFood;
    }

    function gameLoop() {
        window.snakeDir = window.snakeNextDir;

        let head = { x: snake[0].x, y: snake[0].y };

        if (window.snakeDir === 'U') head.y -= 1;
        if (window.snakeDir === 'D') head.y += 1;
        if (window.snakeDir === 'L') head.x -= 1;
        if (window.snakeDir === 'R') head.x += 1;

        // Wall Collision
        if (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height) {
            return gameOver();
        }

        // Self Collision
        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            return gameOver();
        }

        snake.unshift(head);

        // Food Collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('snake-score').innerText = `SCORE: ${score}`;
            food = spawnFood();
            playSound('select');
        } else {
            snake.pop(); // Remove tail if no food eaten
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Food
        ctx.fillStyle = '#f00';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);

        // Draw Snake
        ctx.fillStyle = '#0f0';
        snake.forEach((seg, i) => {
            if (i === 0) ctx.fillStyle = '#cfc'; // Head lighter
            else ctx.fillStyle = '#0a0'; // Body darker
            ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 1, gridSize - 1);
        });
    }

    function gameOver() {
        clearInterval(window.snakeInterval);
        document.getElementById('snake-gameover').style.display = 'block';
        playSound('cancel');
    }

    window.snakeInterval = setInterval(gameLoop, 100);
}

// ==========================================
// TOWER STACKER ENGINE
// ==========================================
function initStackGame() {
    const canvas = document.getElementById('stack-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const boxH = 20;

    window.stackEngineActive = true;
    document.getElementById('stack-gameover').style.display = 'none';
    document.getElementById('stack-score').innerText = 'SCORE: 0';
    if (window.stackRAF) cancelAnimationFrame(window.stackRAF);

    let score = 0;
    let speed = 3;
    let dir = 1;
    let scrollY = 0;

    // Base platform
    let boxes = [
        { x: W / 2 - 60, y: H - boxH, w: 120, h: boxH, color: '#444' }
    ];

    let activeBox = { x: 0, y: H - boxH * 2, w: 120, h: boxH, color: `hsl(${Math.random() * 360}, 80%, 50%)` };

    function gameLoop() {
        if (!window.stackEngineActive) return;

        // Update logic
        activeBox.x += speed * dir;
        if (activeBox.x <= 0) {
            activeBox.x = 0;
            dir = 1;
        } else if (activeBox.x + activeBox.w >= W) {
            activeBox.x = W - activeBox.w;
            dir = -1;
        }

        // Camera Logic
        let targetScrollY = (H - boxH * 4) - activeBox.y;
        if (targetScrollY < 0) targetScrollY = 0;
        scrollY += (targetScrollY - scrollY) * 0.1;

        // Draw logic
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        // Draw settled boxes
        boxes.forEach(b => {
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y + scrollY, b.w, b.h);
        });

        // Draw active box
        ctx.fillStyle = activeBox.color;
        ctx.fillRect(activeBox.x, activeBox.y + scrollY, activeBox.w, activeBox.h);

        window.stackRAF = requestAnimationFrame(gameLoop);
    }

    window.stackDropBox = function () {
        if (!window.stackEngineActive) return;

        const prev = boxes[boxes.length - 1];
        let overlap = 0;

        // Calculate Overlap limits
        const activeL = activeBox.x;
        const activeR = activeBox.x + activeBox.w;
        const prevL = prev.x;
        const prevR = prev.x + prev.w;

        if (activeL > prevR || activeR < prevL) {
            // Complete Miss
            return gameOver();
        }

        // Calculate slice
        let newX, newW;
        if (activeL < prevL) {
            // Overhang left
            newX = prevL;
            newW = activeR - prevL;
        } else if (activeR > prevR) {
            // Overhang right
            newX = activeL;
            newW = prevR - activeL;
        } else {
            // Perfect Drop
            newX = activeL;
            newW = activeBox.w;
            playSound('select'); // Bonus sound for perfect hit
        }

        // Push truncated box
        boxes.push({ x: newX, y: activeBox.y, w: newW, h: boxH, color: activeBox.color });

        score++;
        document.getElementById('stack-score').innerText = `SCORE: ${score}`;
        speed += 0.2;
        playSound('nav'); // Standard drop sound

        // Spawn next level
        activeBox = {
            x: (dir === 1 ? 0 : W - newW),
            y: activeBox.y - boxH,
            w: newW,
            h: boxH,
            color: `hsl(${(score * 15) % 360}, 80%, 50%)`
        };
        dir = dir * -1; // Switch spawn side
    };

    function gameOver() {
        document.getElementById('stack-gameover').style.display = 'block';
        window.stackEngineActive = false;
        playSound('cancel');
    }

    gameLoop();
}

// ==========================================
// PINBALL GAME ENGINE
// ==========================================
function initPinballGame() {
    const canvas = document.getElementById('pinball-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    window.pinballEngineActive = true;
    document.getElementById('pinball-gameover').style.display = 'none';
    document.getElementById('pinball-score').innerText = 'SCORE: 0';
    if (window.pinballRAF) cancelAnimationFrame(window.pinballRAF);

    let score = 0;
    const gravity = 0.15;
    const bounce = 0.6; // Wall bounce restitution
    const bumperForce = 1.3; // Bumper repulsive multiplier

    // Input States
    window.pinballFlippers = {
        left: { up: false, angle: 0.5, maxAngle: -0.2, length: 50, x: 100, y: H - 30 },
        right: { up: false, angle: Math.PI - 0.5, maxAngle: Math.PI + 0.2, length: 50, x: W - 100, y: H - 30 }
    };

    // Physics Ball
    let ball = {
        x: W - 15, // Start in launch tube
        y: H - 15,
        vx: 0,
        vy: 0,
        radius: 5,
        active: false
    };

    window.pinballLaunch = function () {
        if (!ball.active && ball.y > H - 50 && ball.x > W - 30) {
            ball.vy = -(10 + Math.random() * 5); // Launch upward
            ball.vx = -1; // Slight left push into playfield
            ball.active = true;
            playSound('select');
        }
    };

    // Table Objects
    const bumpers = [
        { x: W / 2, y: 50, r: 15, color: '#f0f', hitTimer: 0 },
        { x: W / 2 - 50, y: 80, r: 15, color: '#f0f', hitTimer: 0 },
        { x: W / 2 + 50, y: 80, r: 15, color: '#f0f', hitTimer: 0 }
    ];

    const walls = [
        // Launch Tube
        { x1: W - 30, y1: H, x2: W - 30, y2: 40 },
        // Outer Bounds
        { x1: 0, y1: H, x2: 0, y2: 0 },
        { x1: 0, y1: 0, x2: W, y2: 0 },
        { x1: W, y1: 0, x2: W, y2: H },
        // Corner Slants
        { x1: 0, y1: 40, x2: 40, y2: 0 },
        { x1: W, y1: 40, x2: W - 40, y2: 0 },
        // Gutter Slants
        { x1: 0, y1: H - 80, x2: 80, y2: H - 20 },
        { x1: W - 40, y1: H - 80, x2: W - 120, y2: H - 20 }
    ];

    function checkLineCollision(l) {
        // Vector math for line segments
        let dx = l.x2 - l.x1;
        let dy = l.y2 - l.y1;
        let length = Math.sqrt(dx * dx + dy * dy);
        let nx = dy / length; // Normal x
        let ny = -dx / length; // Normal y

        // Vector from line start to ball
        let bx = ball.x - l.x1;
        let by = ball.y - l.y1;

        // Distance to line
        let dist = bx * nx + by * ny;

        // Projection on line segment
        let proj = (bx * dx + by * dy) / length;

        if (proj > 0 && proj < length && Math.abs(dist) < ball.radius) {
            // Resolve penetration
            ball.x -= nx * (dist > 0 ? (dist - ball.radius) : (dist + ball.radius));
            ball.y -= ny * (dist > 0 ? (dist - ball.radius) : (dist + ball.radius));

            // Reflect velocity
            let dot = ball.vx * nx + ball.vy * ny;
            ball.vx = (ball.vx - 2 * dot * nx) * bounce;
            ball.vy = (ball.vy - 2 * dot * ny) * bounce;
            return true;
        }
        return false;
    }

    function gameLoop() {
        if (!window.pinballEngineActive) return;

        // Physics Step
        if (ball.active) {
            ball.vy += gravity;
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Friction
            ball.vx *= 0.99;
            ball.vy *= 0.99;
        } else {
            // Ball sits in launcher
            ball.x = W - 15;
            ball.y = H - 15;
        }

        // Game Over Check (Fell below screen)
        if (ball.y > H + ball.radius && ball.x < W - 30) {
            document.getElementById('pinball-gameover').style.display = 'block';
            window.pinballEngineActive = false;
            playSound('cancel');
            return;
        }

        // Flipper Physics
        const flipSpeed = 0.3;
        const flipRestore = 0.1;

        // Left Flipper
        if (window.pinballFlippers.left.up) {
            window.pinballFlippers.left.angle -= flipSpeed;
            if (window.pinballFlippers.left.angle < window.pinballFlippers.left.maxAngle) window.pinballFlippers.left.angle = window.pinballFlippers.left.maxAngle;
        } else {
            window.pinballFlippers.left.angle += flipRestore;
            if (window.pinballFlippers.left.angle > 0.5) window.pinballFlippers.left.angle = 0.5;
        }

        // Right Flipper
        if (window.pinballFlippers.right.up) {
            window.pinballFlippers.right.angle += flipSpeed;
            if (window.pinballFlippers.right.angle > window.pinballFlippers.right.maxAngle) window.pinballFlippers.right.angle = window.pinballFlippers.right.maxAngle;
        } else {
            window.pinballFlippers.right.angle -= flipRestore;
            if (window.pinballFlippers.right.angle < Math.PI - 0.5) window.pinballFlippers.right.angle = Math.PI - 0.5;
        }

        // Constrain Ball with Static Walls
        walls.forEach(checkLineCollision);

        // Check Flipper Lines (Basic segment collision, simplified flip force addition)
        let lFlipX2 = window.pinballFlippers.left.x + Math.cos(window.pinballFlippers.left.angle) * window.pinballFlippers.left.length;
        let lFlipY2 = window.pinballFlippers.left.y + Math.sin(window.pinballFlippers.left.angle) * window.pinballFlippers.left.length;
        if (checkLineCollision({ x1: window.pinballFlippers.left.x, y1: window.pinballFlippers.left.y, x2: lFlipX2, y2: lFlipY2 })) {
            if (window.pinballFlippers.left.up) ball.vy -= 8; // Flip boost
        }

        let rFlipX2 = window.pinballFlippers.right.x + Math.cos(window.pinballFlippers.right.angle) * window.pinballFlippers.right.length;
        let rFlipY2 = window.pinballFlippers.right.y + Math.sin(window.pinballFlippers.right.angle) * window.pinballFlippers.right.length;
        if (checkLineCollision({ x1: rFlipX2, y1: rFlipY2, x2: window.pinballFlippers.right.x, y2: window.pinballFlippers.right.y })) {
            if (window.pinballFlippers.right.up) ball.vy -= 8; // Flip boost
        }

        // Check Circular Bumpers
        bumpers.forEach(b => {
            let dx = ball.x - b.x;
            let dy = ball.y - b.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ball.radius + b.r) {
                // Resolve
                let nx = dx / dist;
                let ny = dy / dist;
                ball.x = b.x + nx * (ball.radius + b.r);
                ball.y = b.y + ny * (ball.radius + b.r);

                // Bounce with bumper force
                let dot = ball.vx * nx + ball.vy * ny;
                ball.vx = (ball.vx - 2 * dot * nx) * bumperForce;
                ball.vy = (ball.vy - 2 * dot * ny) * bumperForce;

                // Scoring & FX
                score += 50;
                document.getElementById('pinball-score').innerText = `SCORE: ${score}`;
                b.hitTimer = 10;
                playSound('select');
            }
            if (b.hitTimer > 0) b.hitTimer--;
        });

        // Rendering
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, W, H);

        // Draw Walls
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        walls.forEach(w => {
            ctx.beginPath();
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
            ctx.stroke();
        });

        // Draw Bumpers
        bumpers.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = b.hitTimer > 0 ? '#fff' : b.color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        });

        // Draw Flippers
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(window.pinballFlippers.left.x, window.pinballFlippers.left.y);
        ctx.lineTo(lFlipX2, lFlipY2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(window.pinballFlippers.right.x, window.pinballFlippers.right.y);
        ctx.lineTo(rFlipX2, rFlipY2);
        ctx.stroke();

        // Draw Ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        window.pinballRAF = requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

// ==========================================
// CLICK SPEED GAME ENGINE
// ==========================================
function initClickGame() {
    window.clickEngineActive = true;
    let score = 0;
    let timeRemaining = 10;
    let isPlaying = false;

    const displayScore = document.getElementById('click-score-display');
    const displayTime = document.getElementById('click-time');
    const instruction = document.getElementById('click-instruction');
    const app = document.getElementById('click-app');

    displayScore.innerText = '0';
    displayTime.innerText = 'TIME: 10s';
    instruction.innerHTML = 'Click wildly! <br>(Press ✕ or Click here to begin)';
    if (window.clickTimer) clearInterval(window.clickTimer);

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        score = 0;
        timeRemaining = 10;
        displayScore.innerText = '0';
        instruction.innerHTML = '';
        playSound('nav');

        window.clickTimer = setInterval(() => {
            timeRemaining--;
            displayTime.innerText = `TIME: ${timeRemaining}s`;
            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    let clickGameOver = false;

    function endGame() {
        isPlaying = false;
        clickGameOver = true;
        clearInterval(window.clickTimer);
        playSound('cancel');
        instruction.innerHTML = 'TIME UP! <br>(Press △ for next game)';
    }

    window.clickAction = function () {
        if (clickGameOver) return; // Must press triangle to restart

        if (!isPlaying && timeRemaining === 10) {
            startGame();
        } else if (isPlaying) {
            score++;
            displayScore.innerText = score;
            // Optional visual pop:
            displayScore.style.transform = 'scale(1.2)';
            setTimeout(() => displayScore.style.transform = 'scale(1)', 50);
            playSound('select'); // little bit of feedback can be fun, but maybe too loud. Commenting out to preserve hearing.
        }
    };

    window.clickTriangle = function () {
        if (clickGameOver) {
            clickGameOver = false;
            timeRemaining = 10;
            displayTime.innerText = 'TIME: 10s';
            displayScore.innerText = '0';
            instruction.innerHTML = 'Click wildly! <br>(Press ✕ or Click here to begin)';
            playSound('nav');
        }
    };

    // Allow mouse clicking anywhere on the app div
    app.onclick = function (e) {
        // Prevent bubbling to scene drag
        e.stopPropagation();
        window.clickAction();
    };
}

// ==========================================
// TYPING TEST GAME ENGINE
// ==========================================
function initTypingGame() {
    window.typingEngineActive = true;
    let wordsTyped = 0;
    let timeRemaining = 30; // 30 second timer requested
    let isPlaying = false;
    let typingGameOver = false;

    const wordsBank = [
        "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog",
        "coding", "in", "javascript", "is", "fun", "challenging", "and",
        "welcome", "modern", "portable", "gaming", "simulator", "web",
        "practice", "typing", "speed", "horizontally", "continuous", "flow",
        "every", "word", "per", "minute", "counts", "towards", "score",
        "psp", "interface", "built", "completely", "with", "html", "css",
        "accuracy", "both", "important", "parameters", "for", "success",
        "function", "variable", "const", "let", "return", "true", "false",
        "array", "object", "string", "number", "boolean", "undefined",
        "window", "document", "element", "style", "color", "background"
    ];

    let currentStream = "";
    let currentIndex = 0;

    const displayScore = document.getElementById('typing-score-display');
    const displayTime = document.getElementById('typing-time');
    const instruction = document.getElementById('typing-instruction');
    const track = document.getElementById('typing-track');
    const spanDone = document.getElementById('typing-done');
    const spanCursor = document.getElementById('typing-cursor');
    const spanTodo = document.getElementById('typing-todo');

    // Reset UI
    displayScore.innerText = 'WPM: 0';
    displayTime.innerText = 'TIME: 30s';
    instruction.innerHTML = 'Type the words! <br>(Press ✕ (s key) to begin, Esc to quit)';
    spanDone.innerText = '';
    spanCursor.innerText = '';
    spanTodo.innerText = '';
    track.style.transform = `translateX(0px)`;
    track.style.color = '#888';

    if (window.typingTimer) clearInterval(window.typingTimer);

    function generateWords(count) {
        let chunk = "";
        for (let i = 0; i < count; i++) {
            chunk += wordsBank[Math.floor(Math.random() * wordsBank.length)] + " ";
        }
        return chunk;
    }

    function initStream() {
        currentStream = generateWords(15);
        currentIndex = 0;
        updateTrackUI();
    }

    function updateTrackUI() {
        // To keep performance smooth and DOM small, only render a slice of completed stuff
        let visiblePre = currentStream.substring(Math.max(0, currentIndex - 20), currentIndex);
        spanDone.innerText = visiblePre;

        if (currentIndex < currentStream.length) {
            spanCursor.innerText = currentStream.charAt(currentIndex);
            spanTodo.innerText = currentStream.substring(currentIndex + 1, currentIndex + 40); // 40 chars lookahead
        } else {
            spanCursor.innerText = "";
            spanTodo.innerText = "";
        }
        // approximate character width ~ 12px for 20px courier new
        // Since we only show ~20 chars of completed text, we track shift by static amount to keep cursor center
        track.style.transform = `translateX(-${visiblePre.length * 12}px)`;
    }

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        typingGameOver = false;
        wordsTyped = 0;
        timeRemaining = 30; // 30s test
        displayScore.innerText = 'WPM: 0';
        instruction.innerHTML = '';
        playSound('nav');
        initStream();

        window.typingTimer = setInterval(() => {
            timeRemaining--;
            displayTime.innerText = `TIME: ${timeRemaining}s`;

            // Simple approximation: 5 characters = 1 word
            let minutesElapsed = (30 - timeRemaining) / 60;
            if (minutesElapsed > 0) {
                let totalWords = (wordsTyped * 5) / 5; // using spaces/words metric
                let wpmCalc = Math.round(totalWords / minutesElapsed);
                displayScore.innerText = `WPM: ${wpmCalc}`;
            }

            if (timeRemaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        isPlaying = false;
        typingGameOver = true;
        clearInterval(window.typingTimer);
        playSound('cancel');
        instruction.innerHTML = 'TIME UP! <br>(Press △ to restart, Esc to quit)';
    }

    window.typingTriangle = function () {
        if (typingGameOver) {
            initTypingGame();
            startGame();
        }
    };

    window.typingKeyPress = function (key) {
        if (typingGameOver) return;

        if (!isPlaying) {
            if (key.toLowerCase() === 's') { // X button maps to 's'
                startGame();
            }
            return;
        }

        // Match keystroke against sentence
        if (key.length === 1) {
            let expected = currentStream.charAt(currentIndex);
            if (key.toLowerCase() === expected.toLowerCase()) {
                currentIndex++;

                // Count completed words (approx by spaces)
                if (expected === ' ') {
                    wordsTyped++;

                    // Append more logic smoothly to the stream if running low (less than 15 chars ahead)
                    if (currentStream.length - currentIndex < 15) {
                        currentStream += generateWords(5);
                    }
                }

                updateTrackUI();
            } else {
                // Wrong key -> brief red flash
                track.style.color = '#f00';
                setTimeout(() => track.style.color = '#888', 100);
            }
        }
    };
}

// ==========================================
// SIMON SAYS GAME ENGINE
// ==========================================
function initSimonGame() {
    window.simonEngineActive = true;
    let sequence = [];
    let playerSequence = [];
    let isPlaying = false;
    let level = 0;
    let showingPattern = false;

    const scoreDisplay = document.getElementById('simon-score');
    const instruction = document.getElementById('simon-instruction');
    const btns = {
        'triangle': { id: 'simon-btn-triangle', color: '#8af', activeBg: 'rgba(136,170,255,0.8)' },
        'circle': { id: 'simon-btn-circle', color: '#f88', activeBg: 'rgba(255,136,136,0.8)' },
        'cross': { id: 'simon-btn-cross', color: '#8fc', activeBg: 'rgba(136,255,204,0.8)' },
        'square': { id: 'simon-btn-square', color: '#f8a', activeBg: 'rgba(255,136,255,0.8)' }
    };
    const btnKeys = Object.keys(btns);

    // Reset UI
    scoreDisplay.innerText = 'SCORE: 0';
    instruction.innerHTML = 'Watch the pattern! <br>(Press ✕ to start)';

    function highlightButton(btnKey, duration = 300) {
        const el = document.getElementById(btns[btnKey].id);
        el.style.background = btns[btnKey].activeBg;
        playSound('nav'); // subtle feedback
        setTimeout(() => {
            el.style.background = `rgba(${btns[btnKey].activeBg.match(/\d+,\d+,\d+/)[0]},0.2)`;
        }, duration);
    }

    function playPattern() {
        showingPattern = true;
        playerSequence = [];
        instruction.innerHTML = 'Watch...';

        let i = 0;
        function nextTone() {
            if (i < sequence.length) {
                highlightButton(sequence[i], 400);
                i++;
                window.simonTimeout = setTimeout(nextTone, 600);
            } else {
                showingPattern = false;
                instruction.innerHTML = 'Your turn!';
            }
        }
        window.simonTimeout = setTimeout(nextTone, 800);
    }

    function nextLevel() {
        level++;
        scoreDisplay.innerText = `SCORE: ${level - 1}`;

        // Ensure randomness is diverse, avoid too many repeats of recent buttons
        let nextBtn = btnKeys[Math.floor(Math.random() * btnKeys.length)];
        if (sequence.length > 2) {
            const lastBtn = sequence[sequence.length - 1];
            const prevBtn = sequence[sequence.length - 2];
            if (nextBtn === lastBtn && nextBtn === prevBtn) {
                // Prevent 3 in a row, reroll once
                nextBtn = btnKeys[Math.floor(Math.random() * btnKeys.length)];
            }
        }

        sequence.push(nextBtn);
        playPattern();
    }

    function startGame() {
        if (isPlaying) return;
        isPlaying = true;
        sequence = [];
        level = 0;
        nextLevel();
    }

    window.simonBtnPress = function (btnKey) {
        if (!isPlaying && btnKey === 'cross') {
            startGame();
            return;
        }

        if (!isPlaying || showingPattern) return;

        // Player made a move
        highlightButton(btnKey, 200);
        playerSequence.push(btnKey);

        const currentMoveIdx = playerSequence.length - 1;

        if (playerSequence[currentMoveIdx] !== sequence[currentMoveIdx]) {
            // Wrong move - Game Over
            playSound('cancel');
            instruction.innerHTML = 'GAME OVER! <br>(Press ✕ or click right side to restart)';
            isPlaying = false;
            scoreDisplay.innerText = `FINAL: ${level - 1}`;
        } else if (playerSequence.length === sequence.length) {
            // Completed sequence successfully
            instruction.innerHTML = 'Perfect!';
            window.simonTimeout = setTimeout(nextLevel, 1000);
        }
    };

    // Mapping mouse clicks for Simon Says
    const app = document.getElementById('simon-app');
    app.onclick = function (e) {
        e.stopPropagation();
        if (!isPlaying) {
            window.simonBtnPress('cross'); // Any click starts/restarts
            return;
        }
    };

    // Bind explicitly to the grid squares
    btnKeys.forEach(key => {
        const el = document.getElementById(btns[key].id);
        el.onclick = function (e) {
            e.stopPropagation();
            window.simonBtnPress(key);
        };
    });
}

// ==========================================
// REACTION TEST GAME ENGINE
// ==========================================
function initReactGame() {
    window.reactEngineActive = true;
    let state = 'idle'; // idle, waiting, ready, over
    let startTime = 0;

    const app = document.getElementById('react-app');
    const icon = document.getElementById('react-icon');
    const textTime = document.getElementById('react-time');
    const instruction = document.getElementById('react-instruction');

    // Reset UI
    app.style.background = '#222';
    icon.innerText = '⏱️';
    textTime.innerText = 'Reaction Test';
    instruction.innerHTML = 'Press ✕ to start';

    function triggerReady() {
        if (state !== 'waiting') return;
        state = 'ready';
        app.style.background = '#2a2'; // Green
        icon.innerText = '⚡';
        textTime.innerText = 'PRESS ✕ NOW!';
        startTime = performance.now();
    }

    window.reactKeyPress = function () {
        if (state === 'idle' || state === 'over') {
            // Start game
            state = 'waiting';
            app.style.background = '#a22'; // Red
            icon.innerText = '⏳';
            textTime.innerText = 'Wait for Green...';
            instruction.innerHTML = 'Pressing too early fails!';

            // Random delay between 2 and 6 seconds
            const delay = 2000 + Math.random() * 4000;
            if (window.reactTimeout) clearTimeout(window.reactTimeout);
            window.reactTimeout = setTimeout(triggerReady, delay);
        } else if (state === 'waiting') {
            // Too early!
            clearTimeout(window.reactTimeout);
            state = 'over';
            app.style.background = '#222';
            icon.innerText = '❌';
            textTime.innerText = 'Too Early!';
            instruction.innerHTML = 'Press ✕ to try again';
            playSound('cancel');
        } else if (state === 'ready') {
            // Success!
            const reactionTime = Math.round(performance.now() - startTime);
            state = 'over';
            app.style.background = '#222';
            icon.innerText = '🏆';
            textTime.innerText = `${reactionTime} ms`;
            instruction.innerHTML = 'Press ✕ to go again';
            playSound('select');
        }
    };

    // Map clicks anywhere on app to the keypress
    app.onclick = function (e) {
        e.stopPropagation();
        window.reactKeyPress();
    };
}

// ==========================================
// FLAPPY BIRD GAME ENGINE
// ==========================================
function initFlappyGame() {
    window.flappyEngineActive = true;
    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDoc = document.getElementById('flappy-score');
    const gameOverDoc = document.getElementById('flappy-gameover');
    const instruction = document.getElementById('flappy-instruction');
    const app = document.getElementById('flappy-app');

    let isPlaying = false;
    let frames = 0;
    let score = 0;
    let pipes = [];

    const bird = {
        x: 50,
        y: 100,
        radius: 8,
        velocity: 0,
        gravity: 0.25,
        jump: -4.5,
        draw: function () {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffcc00';
            ctx.fill();
            ctx.strokeText(">", this.x - 4, this.y + 4);
            ctx.closePath();

            // Eye
            ctx.beginPath();
            ctx.arc(this.x + 3, this.y - 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.closePath();
        },
        update: function () {
            this.velocity += this.gravity;
            this.y += this.velocity;

            if (this.y + this.radius >= canvas.height) {
                this.y = canvas.height - this.radius;
                endGame();
            }
            if (this.y - this.radius <= 0) {
                this.y = this.radius;
                this.velocity = 0;
            }
        },
        flap: function () {
            this.velocity = this.jump;
            playSound('nav');
        }
    };

    function createPipe() {
        const gap = 60;
        const minHeight = 20;
        const maxHeight = canvas.height - gap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

        pipes.push({
            x: canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            width: 30,
            passed: false
        });
    }

    function drawPipes() {
        ctx.fillStyle = '#2d2';
        ctx.strokeStyle = '#050';
        ctx.lineWidth = 2;

        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];

            // Top pipe
            ctx.fillRect(p.x, 0, p.width, p.topHeight);
            ctx.strokeRect(p.x, 0, p.width, p.topHeight);

            // Bottom pipe
            ctx.fillRect(p.x, p.bottomY, p.width, canvas.height - p.bottomY);
            ctx.strokeRect(p.x, p.bottomY, p.width, canvas.height - p.bottomY);
        }
    }

    function updatePipes() {
        if (frames % 100 === 0) createPipe();

        for (let i = 0; i < pipes.length; i++) {
            let p = pipes[i];
            p.x -= 1.5;

            // Collision
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + p.width) {
                if (bird.y - bird.radius < p.topHeight || bird.y + bird.radius > p.bottomY) {
                    endGame();
                }
            }

            // Score
            if (p.x + p.width < bird.x && !p.passed) {
                score++;
                scoreDoc.innerText = `SCORE: ${score}`;
                p.passed = true;
                playSound('select');
            }

            if (p.x + p.width < 0) {
                pipes.shift();
                i--;
            }
        }
    }

    function resetGame() {
        bird.y = 100;
        bird.velocity = 0;
        pipes = [];
        score = 0;
        frames = 0;
        scoreDoc.innerText = 'SCORE: 0';
        gameOverDoc.style.display = 'none';
        instruction.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        bird.draw(); // Draw initial state
    }

    function loop() {
        if (!isPlaying || !window.flappyEngineActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        bird.update();
        bird.draw();

        updatePipes();
        drawPipes();

        frames++;
        window.flappyRAF = requestAnimationFrame(loop);
    }

    function startGame() {
        if (isPlaying) return;
        resetGame();
        isPlaying = true;
        instruction.style.display = 'none';
        loop();
    }

    function endGame() {
        if (!isPlaying) return;
        isPlaying = false;
        playSound('cancel');
        gameOverDoc.style.display = 'block';
    }

    window.flappyAction = function () { // mapped to 'X' (s key)
        if (!isPlaying) {
            startGame();
        }
        bird.flap();
    };

    // Allow clicking to flap
    app.onclick = function (e) {
        e.stopPropagation();
        window.flappyAction();
    };

    resetGame();
}

// ==========================================
// BRICK BREAKER GAME ENGINE
// ==========================================
function initBrickGame() {
    window.brickEngineActive = true;
    const canvas = document.getElementById('brick-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDoc = document.getElementById('brick-score');
    const gameOverDoc = document.getElementById('brick-gameover');
    const app = document.getElementById('brick-app');

    let isPlaying = false;
    let score = 0;
    let lives = 3;
    window.brickKeys = { left: false, right: false };

    const paddle = {
        w: 50, h: 5, x: canvas.width / 2 - 25, y: canvas.height - 15, speed: 4, dx: 0
    };

    const ball = {
        x: canvas.width / 2, y: canvas.height / 2, radius: 4, speed: 3, dx: 3, dy: -3
    };

    const brickInfo = {
        w: 36, h: 10, padding: 4, offsetX: 5, offsetY: 25, rows: 4, cols: 8
    };

    let bricks = [];

    function createBricks() {
        bricks = [];
        const colors = ['#f22', '#f82', '#ff2', '#2f2'];
        for (let r = 0; r < brickInfo.rows; r++) {
            bricks[r] = [];
            for (let c = 0; c < brickInfo.cols; c++) {
                bricks[r][c] = { x: 0, y: 0, status: 1, color: colors[r] };
            }
        }
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
        ctx.fillStyle = '#0cf';
        ctx.fill();
        ctx.closePath();
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let r = 0; r < brickInfo.rows; r++) {
            for (let c = 0; c < brickInfo.cols; c++) {
                let b = bricks[r][c];
                if (b.status === 1) {
                    let bX = (c * (brickInfo.w + brickInfo.padding)) + brickInfo.offsetX;
                    let bY = (r * (brickInfo.h + brickInfo.padding)) + brickInfo.offsetY;
                    b.x = bX;
                    b.y = bY;
                    ctx.beginPath();
                    ctx.rect(b.x, b.y, brickInfo.w, brickInfo.h);
                    ctx.fillStyle = b.color;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function movePaddle() {
        paddle.dx = 0;
        if (window.brickKeys.right) paddle.dx = paddle.speed;
        if (window.brickKeys.left) paddle.dx = -paddle.speed;

        paddle.x += paddle.dx;

        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > canvas.width) paddle.x = canvas.width - paddle.w;
    }

    function moveBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            ball.dx *= -1;
            playSound('nav');
        }
        // Ceiling collision
        if (ball.y - ball.radius < 0) {
            ball.dy *= -1;
            playSound('nav');
        }

        // Paddle collision
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.w && ball.y + ball.radius > paddle.y) {
            ball.dy = -ball.speed;
            // Add slight angle variance based on where it hit paddle
            let hitPoint = ball.x - (paddle.x + paddle.w / 2);
            ball.dx = hitPoint * 0.15;
            playSound('nav');
        }

        // Bottom collision
        if (ball.y + ball.radius > canvas.height) {
            lives--;
            playSound('cancel');
            if (lives <= 0) {
                endGame();
            } else {
                // Reset ball
                ball.x = canvas.width / 2;
                ball.y = canvas.height / 2;
                ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
                ball.dy = -3;
                paddle.x = canvas.width / 2 - paddle.w / 2;
            }
        }
    }

    function collisionDetection() {
        for (let r = 0; r < brickInfo.rows; r++) {
            for (let c = 0; c < brickInfo.cols; c++) {
                let b = bricks[r][c];
                if (b.status === 1) {
                    if (ball.x > b.x && ball.x < b.x + brickInfo.w && ball.y > b.y && ball.y < b.y + brickInfo.h) {
                        ball.dy *= -1;
                        b.status = 0;
                        score++;
                        scoreDoc.innerText = `SCORE: ${score}`;
                        playSound('select');

                        if (score === brickInfo.rows * brickInfo.cols) {
                            // You Win! For simplicity, just reset bricks
                            createBricks();
                            ball.speed += 0.5; // harder
                        }
                    }
                }
            }
        }
    }

    function resetGame() {
        score = 0;
        lives = 3;
        scoreDoc.innerText = 'SCORE: 0';
        gameOverDoc.style.display = 'none';
        createBricks();
        paddle.x = canvas.width / 2 - paddle.w / 2;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2 + 20;
        ball.dx = 0;
        ball.dy = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle();
        drawBricks();
        drawBall();
        // Draw title
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Press ✕ to Start", canvas.width / 2, canvas.height / 2 + 50);
    }

    function loop() {
        if (!isPlaying || !window.brickEngineActive) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBricks();
        drawPaddle();
        drawBall();

        movePaddle();
        moveBall();
        collisionDetection();

        window.brickRAF = requestAnimationFrame(loop);
    }

    window.brickAction = function () {
        if (!isPlaying) {
            isPlaying = true;
            gameOverDoc.style.display = 'none';
            if (lives <= 0 || score === brickInfo.rows * brickInfo.cols) {
                resetGame();
                isPlaying = true;
            }
            ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -ball.speed;
            loop();
        } else {
            // Start screen hack to relaunch
            if (lives <= 0) {
                resetGame();
                isPlaying = true;
                ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
                ball.dy = -ball.speed;
                loop();
            }
        }
    };

    // Map clicks (right click/tap could technically move paddle if we tracked pos, but simple left/right tap is better)
    app.onclick = function (e) {
        e.stopPropagation();
        window.brickAction(); // Start
    };

    // For simple mouse support: click left half to go left, right half to go right
    app.onmousedown = function (e) {
        const rect = app.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width / 2) window.brickKeys.left = true;
        else window.brickKeys.right = true;
    };
    app.onmouseup = function () {
        window.brickKeys.left = false;
        window.brickKeys.right = false;
    };

    resetGame();
}
