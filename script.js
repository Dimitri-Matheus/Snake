const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const body = document.body;
const icon = document.querySelector("#music");
const splash = document.querySelector(".splash");
const start = document.getElementById("start");
const popup = document.querySelector("dialog");
const popupElement = document.getElementById("message");

let gameOver = false;
let foodX, foodY;
let upgradeX, upgradeY, upgradeActive = false;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

document.addEventListener("DOMContentLoaded", (e) => {
    if (document.cookie.indexOf("visited=true") === -1) {
        start.addEventListener("click", () => {
            splash.classList.add('none');
            start.classList.add('none');
            document.cookie = "visited=true; expires=Fri, 31 Dec 9999 23:59:59 GMT";
        });
    } else {
        splash.remove();
        start.remove();
    }
});


// "Block" access to the source code
document.addEventListener('contextmenu', function (event) {
    alert(
        'This project is fully available on my GitHub profile. I would be very grateful if you could give it a star to show your support'
    )
    event.preventDefault();
});

// Sounds
var sfx = {
    eat: new Howl({
        src: [
            'assets/sound/eat.mp3',
        ],
        loop: false,
        volume: 0.2,
    }),
    hit: new Howl({
        src: [
            'assets/sound/hit.mp3',
        ],
        loop: false,
        volume: 0.2,
    }),
    upgrade: new Howl({
        src: [
            'assets/sound/upgrade.wav',
        ],
        loop: false,
        volume: 0.2,
        onend: function() {
            console.log("playing sfx!")
        }
    }),
}

var music = {
    background: new Howl({
        src: [
            'assets/sound/02.mp3'
        ],
        autoplay: false,
        loop: true,
        volume: 0.4,
        rate: 1.0, // speed
    }),
}

// Music button and icons

window.addEventListener("load", () => {
    if (localStorage.getItem("musicPlaying") === "true") {
        playBackgroundMusic();
    }
})

document.querySelector("#music").addEventListener("click", () => {
    playBackgroundMusic();
});

function playBackgroundMusic() {
    if (!music.background.playing()) {
        music.background.fade(0, 1, 1500);
        music.background.play();
        localStorage.setItem("musicPlaying", "true");
        changeIcon(icon, true);
    } else {
        music.background.pause();
        localStorage.setItem("musicPlaying", "false");
        changeIcon(icon, false);
    }
}
  
function changeIcon(icon, isPlaying) {
    if (isPlaying) {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-stop");
    } else {
        icon.classList.remove("fa-stop");
        icon.classList.add("fa-play");
    }
}

// Themes

document.addEventListener('DOMContentLoaded', function () {
    function initThemeToggler() {
        const themeToggler = document.getElementById("themeToggler");
        const themeStylesheetLink = document.getElementById("themeStylesheetLink");
        let currentTheme = localStorage.getItem("theme") || "light";

        function toggleTheme() {
            if (currentTheme === "light") {
                currentTheme = "dark";
            } else if (currentTheme === "dark") {
                currentTheme = "winter";
            } else {
                currentTheme = "light";
            }

            themeStylesheetLink.setAttribute("href", `css/themes/${currentTheme}.css`);
            localStorage.setItem("theme", currentTheme);
        }

        themeToggler.addEventListener("click", toggleTheme);
        activateTheme(currentTheme);
    }

    function activateTheme(themeName) {
        const themeStylesheetLink = document.getElementById("themeStylesheetLink");
        themeStylesheetLink.setAttribute("href", `css/themes/${themeName}.css`);
    }
    initThemeToggler();
});

// High Score

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// Random 1 and 30 as food position

const updateFoodPosition = () =>{
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

// Random upgrade position

const updateUpgradePosition = () => {
    upgradeX = Math.floor(Math.random() * 30) + 1;
    upgradeY = Math.floor(Math.random() * 30) + 1;
}

// Logic upgrades

const DoubleSpeedEffect = () => {
    velocityX *= 2;
    velocityY *= 2;
    popupElement.innerText = "Velocity doubled!";
    popup.showModal();
};

const TeleportEffect = () => {
    snakeX = Math.floor(Math.random() * 30) + 1;
    snakeY = Math.floor(Math.random() * 30) + 1;
    popupElement.innerHTML = "Teleported!";
    popup.showModal();
};

const MoreFoodEffect = () => {
    score+=2;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;

    popupElement.innerHTML = "Double points!";
    popup.showModal();
};

const checkUpgradeCollision = () => {
    if (snakeX === upgradeX && snakeY === upgradeY) {
        sfx.upgrade.play();
        updateFoodPosition();
        updateUpgradePosition();

        // Upgradeable random
        const randomEffect = Math.floor(Math.random() * 3);

        switch (randomEffect) {
            case 0:
                DoubleSpeedEffect();
                break;
            case 1:
                TeleportEffect();
                break;
            case 2:
                MoreFoodEffect();
                break;
        }
        setTimeout(() => {
            popup.classList.remove("message-out");
            popup.close();
        }, 2200)
    }
}


// Game Over

const handleGameOver = () => {
    sfx.hit.play();
    popup.close();
    music.background.stop();
    clearInterval(setIntervalId);
    const modal = document.getElementById("gameOverModal");
    modal.style.display = "block";
    
    // Animations and buttons

    const foodElement = document.querySelector(".food")
    foodElement.classList.add("wiggle")

    const snakeBodyElements = document.querySelectorAll(".head");
    snakeBodyElements.forEach(element => {
        element.classList.add("disintegrate");
    });

    const replayButton = document.getElementById("replay");
    replayButton.addEventListener("click", () => {
    location.reload();
  });
};

// Change velocity value

const changeDirection = e =>{
    if(e.key === "ArrowUp" && velocityY != 1){
        velocityX = 0;
        velocityY = -1;
    }else if(e.key === "ArrowDown" && velocityY != -1){
        velocityX = 0;
        velocityY = 1;
    }else if(e.key === "ArrowLeft" && velocityX != 1){
        velocityX = -1;
        velocityY = 0;
    }else if(e.key === "ArrowRight" && velocityX != -1){
        velocityX = 1;
        velocityY = 0;
    }
}

// Change directions

controls.forEach(button => button.addEventListener("click", () => changeDirection({key: button.dataset.key })));

const initGame = () =>{
    if (gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    checkUpgradeCollision();

    html += `<div class="upgrade" style="grid-area: ${upgradeY} / ${upgradeX}"></div>`;

    // Snake eat food
    if (snakeX === foodX && snakeY === foodY){
        sfx.eat.play();
        updateFoodPosition();
        updateUpgradePosition();
        snakeBody.push([foodY, foodX]); // add food to snake body
        score++;
        highScore = score >= highScore ? score : highScore;

        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;

        // cell phone vibration
        /* if ("vibrate" in navigator) {
            navigator.vibrate(100);
            console.log("Vibration!!!")
        } */
    }

    // Update Snake Head
    snakeX += velocityX;
    snakeY += velocityY;

    // Forward values of element

    for (let i = snakeBody.length - 1; i > 0; i--){
        snakeBody[i] = snakeBody[i -1];
    }

    snakeBody[0] = [snakeX, snakeY];

    // Check snake body
    
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30){
        return gameOver = true;
    }

    // Add div for snake body

    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Check snake head hit body or no
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    
    playBoard.innerHTML = html;
}
updateUpgradePosition();
updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);
