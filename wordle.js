const base_url = window.location.host;
console.log(base_url);
var ws_url = 'ws://' + base_url + '/wordle/ws';
console.log(ws_url);
var ws = new WebSocket(ws_url);

let currentRow = 0;
let maxRows = 0;

const guessWord = async () => {
    const row = document.getElementById(`${currentRow}`);
    const guessedWord = Array.from(row.children)
        .map((element) => element.textContent)
        .join("");
    const guessedWordArray = guessedWord.split("");
    const keyboardButtons = document.querySelectorAll("button[data-key]");

    if (guessedWordArray.length === 0) return;
    if (guessedWord.length < maxRows) {
        for (let i = 0; i < row.children.length; i++)
            row.children[i].textContent = "";
        sendMessage("error", "Word must be 5 letters long");
        return;
    } else {
        ws.send(guessedWord)
        ws.onmessage = function (event) {
            const data = JSON.parse(event.data);
            const type = data.type;
            console.log(type)
            let message = data.message;
            if (type === "incorrect") {
                message = message.replace(/'/g, '"');
                message = JSON.parse(message)
                for (let i = 0; i < message.length; i++) {
                    console.log(message[i])
                    if (message[i] === 'red') {
                    row.getElementsByClassName(
                        `${i}`
                    )[0].className = `${i} element flipped wrong`;
                    keyboardButtons.forEach((button) =>
                        button.dataset.key === guessedWordArray[i]
                            ? (button.className = "key wrong")
                            : "key"
                    );} else if (message[i] === 'yellow') {
                        row.getElementsByClassName(
                            `${i}`
                        )[0].className = `${i} element flipped invalid`;
                        keyboardButtons.forEach((button) =>
                            button.dataset.key === guessedWordArray[i]
                                ? (button.className = "key invalid")
                                : "key"
                        );
                    } else if (message[i] === 'green') {
                        row.getElementsByClassName(
                            `${i}`
                        )[0].className = `${i} element flipped correct`;
                        keyboardButtons.forEach((button) =>
                            button.dataset.key === guessedWordArray[i]
                                ? (button.className = "key correct")
                                : "key"
                        );
                    }
                }
                currentRow++
            } else if (type === 'correct') {
                console.log("correct")
                for (let i = 0; i < 5; i++) {
                    row.getElementsByClassName(
                        `${i}`
                    )[0].className = `${i} element flipped correct`;
                    keyboardButtons.forEach((button) =>
                        button.dataset.key === guessedWordArray[i]
                            ? (button.className = "key correct")
                            : "key"
                    );
                }
                sendMessage("success", "Congratulations! You guessed the word!");
                ws.close()
            } else if (type === 'error') {
                sendMessage("error", message)
            }
        }
    }
};

const gameSetup = (dimentions) => {
    maxRows = dimentions;
    const HTMLcontainer = document.getElementById("grid");

    for (let i = 0; i < maxRows + 1; i++) {
        const row = document.createElement("div");
        row.id = i;
        row.className = "row";

        for (let j = 0; j < maxRows; j++) {
            const element = document.createElement("div");
            element.className = `${j} element`;
            row.appendChild(element);
        }

        HTMLcontainer.appendChild(row);
    }
};
const appendKeyboard = () => {
    const HTMLcontainer = document.getElementById("game");

    const keyboard = document.createElement("div");
    keyboard.id = "keyboard";

    const template = `
        <div class="keyboard-row">
            <button class="key" data-key="Q">Q</button>
            <button class="key" data-key="W">W</button>
            <button class="key" data-key="E">E</button>
            <button class="key" data-key="R">R</button>
            <button class="key" data-key="T">T</button>
            <button class="key" data-key="Y">Y</button>
            <button class="key" data-key="U">U</button>
            <button class="key" data-key="I">I</button>
            <button class="key" data-key="O">O</button>
            <button class="key" data-key="P">P</button>
        </div>

        <div class="keyboard-row">
            <div class="spacer half"></div>
            <button class="key" data-key="A">A</button>
            <button class="key" data-key="S">S</button>
            <button class="key" data-key="D">D</button>
            <button class="key" data-key="F">F</button>
            <button class="key" data-key="G">G</button>
            <button class="key" data-key="H">H</button>
            <button class="key" data-key="J">J</button>
            <button class="key" data-key="K">K</button>
            <button class="key" data-key="L">L</button>
        </div>

        <div class="keyboard-row">
            <button class="key enter" data-key="ENTER">ENTER</button>
            <button class="key" data-key="Z">Z</button>
            <button class="key" data-key="X">X</button>
            <button class="key" data-key="C">C</button>
            <button class="key" data-key="V">V</button>
            <button class="key" data-key="B">B</button>
            <button class="key" data-key="N">N</button>
            <button class="key" data-key="M">M</button>
            <button class="key del" data-key="DEL">DEL</button>
        </div>
    `;

    keyboard.innerHTML = template;
    HTMLcontainer.appendChild(keyboard);
};
const sendMessage = (type, message) => {
    const messageContainer = document.getElementById("message");
    messageContainer.textContent = message;
    messageContainer.className = `message ${type}`;

    if (message === "&nbsp;") messageContainer.innerHTML = "&nbsp;";
};
const showHide = () => {
    document.getElementById("load-container").style = "display: none";
    document.getElementById("game-container").style = "display: block";
};
setTimeout(() => {
    gameSetup(5);
    appendKeyboard();
}, 100);

let index = 0;
document.addEventListener("keydown", (event) => {
    if (event.keyCode > 64 && event.keyCode < 91) {
        if (index < maxRows) {
            const row = document.getElementById(`${currentRow}`);
            row.getElementsByClassName(
                `${index}`
            )[0].textContent = event.key.toUpperCase();
            row.getElementsByClassName(
                `${index}`
            )[0].className = `${index} element typed`;
            index++;
        }
    }

    if (event.keyCode === 8) {
        if (index > 0) {
            const row = document.getElementById(`${currentRow}`);
            row.getElementsByClassName(`${index - 1}`)[0].textContent = "";
            row.getElementsByClassName(`${index - 1}`)[0].className = `${
                index - 1
            } element`;
            index--;
        }
    }

    if (event.keyCode === 13) {
        guessWord();
        index = 0;
    }
});
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("key")) {
        if (
            !event.target.classList.contains("del") &&
            !event.target.classList.contains("enter")
        ) {
            if (index < maxRows) {
                const row = document.getElementById(`${currentRow}`);
                row.getElementsByClassName(`${index}`)[0].textContent =
                    event.target.textContent;
                row.getElementsByClassName(
                    `${index}`
                )[0].className = `${index} element typed`;
                index++;
            }
        }

        if (
            event.target.classList.contains("key") &&
            event.target.classList.contains("del")
        ) {
            if (index > 0) {
                const row = document.getElementById(`${currentRow}`);
                row.getElementsByClassName(`${index - 1}`)[0].textContent = "";
                row.getElementsByClassName(`${index - 1}`)[0].className = `${
                    index - 1
                } element`;
                index--;
            }
        }

        if (
            event.target.classList.contains("key") &&
            event.target.classList.contains("enter")
        ) {
            guessWord();
            index = 0;
        }
    }
});