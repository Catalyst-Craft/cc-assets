const base_url = window.location.host;
console.log(base_url);
var ws_url = 'ws://' + base_url + '/trivia/ws';
console.log(ws_url);
var ws = new WebSocket(ws_url);

const guess = () => {
    const answer = document.getElementById('answer').value
    ws.send(answer)
    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        const type = data.type;
        const message = data.message
        console.log(type)
        if (type === "failed") {
            console.log(message);
            const s = document.getElementById('message');
            s.className = 'failed'
            s.innerText = message;
        }
        else if (type === "correct") {
            console.log(message);
            const s = document.getElementById('message');
            s.className = 'correct';
            s.innerText = message;
            ws.close()
        }
    }
}