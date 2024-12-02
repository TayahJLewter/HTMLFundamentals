document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('theCanvas');
    const ctx = canvas.getContext('2d');
    const blockerSound = document.getElementById('blockerSound');
    const targetSound = document.getElementById('targetSound');
    const cannonSound = document.getElementById('cannonSound');
    const startButton = document.getElementById('startButton');

    let gameRunning = false;
    let score = 0;
    let cannonAngle = 0;
    let cannonballs = [];
    let targets = [];
    let blockers = [];

    const cannon = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        width: 40,
        height: 60
    };

    startButton.addEventListener('click', startGame);

    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            score = 0;
            cannonballs = [];
            targets = [];
            blockers = [];
            gameLoop();
        }
    }

    canvas.addEventListener('mousemove', (e) => {
        if (gameRunning) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            cannonAngle = Math.atan2(mouseY - cannon.y, mouseX - cannon.x);
        }
    });

    canvas.addEventListener('click', () => {
        if (gameRunning) {
            fireCannon();
        }
    });

    function fireCannon() {
        cannonSound.play();
        cannonballs.push({
            x: cannon.x,
            y: cannon.y,
            radius: 5,
            speed: 10,
            angle: cannonAngle
        });
    }

    function createTarget() {
        targets.push({
            x: Math.random() * canvas.width,
            y: 0,
            radius: 15,
            speed: 2 + Math.random() * 2
        });
    }

    function createBlocker() {
        blockers.push({
            x: Math.random() * canvas.width,
            y: 0,
            width: 40,
            height: 10,
            speed: 1 + Math.random() * 2
        });
    }

    function updateGame() {
        // Update cannonballs
        cannonballs.forEach((ball, index) => {
            ball.x += Math.cos(ball.angle) * ball.speed;
            ball.y += Math.sin(ball.angle) * ball.speed;
            if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) {
                cannonballs.splice(index, 1);
            }
        });

        // Update targets
        targets.forEach((target, index) => {
            target.y += target.speed;
            if (target.y > canvas.height) {
                targets.splice(index, 1);
            }
        });

        // Update blockers
        blockers.forEach((blocker, index) => {
            blocker.y += blocker.speed;
            if (blocker.y > canvas.height) {
                blockers.splice(index, 1);
            }
        });

        // Check collisions
        cannonballs.forEach((ball, ballIndex) => {
            targets.forEach((target, targetIndex) => {
                if (checkCollision(ball, target)) {
                    targetSound.play();
                    cannonballs.splice(ballIndex, 1);
                    targets.splice(targetIndex, 1);
                    score += 10;
                }
            });

            blockers.forEach((blocker, blockerIndex) => {
                if (checkBlockerCollision(ball, blocker)) {
                    blockerSound.play();
                    cannonballs.splice(ballIndex, 1);
                }
            });
        });

        // Create new targets and blockers
        if (Math.random() < 0.02) createTarget();
        if (Math.random() < 0.01) createBlocker();
    }

    function checkCollision(ball, target) {
        const dx = ball.x - target.x;
        const dy = ball.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball.radius + target.radius;
    }

    function checkBlockerCollision(ball, blocker) {
        return ball.x > blocker.x && 
               ball.x < blocker.x + blocker.width && 
               ball.y > blocker.y && 
               ball.y < blocker.y + blocker.height;
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw cannon
        ctx.save();
        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannonAngle);
        ctx.fillStyle = 'black';
        ctx.fillRect(-cannon.width / 2, -cannon.height / 2, cannon.width, cannon.height);
        ctx.restore();

        // Draw cannonballs
        ctx.fillStyle = 'black';
        cannonballs.forEach(ball => {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw targets
        ctx.fillStyle = 'green';
        targets.forEach(target => {
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw blockers
        ctx.fillStyle = 'red';
        blockers.forEach(blocker => {
            ctx.fillRect(blocker.x, blocker.y, blocker.width, blocker.height);
        });

        // Draw score
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText('Score: ' + score, 10, 30);
    }

    function gameLoop() {
        if (gameRunning) {
            updateGame();
            drawGame();
            requestAnimationFrame(gameLoop);
        }
    }
});