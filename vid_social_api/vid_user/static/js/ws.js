// static/js/ws.js
const ws = new WebSocket('ws://192.168.1.94:8000//ws/status_update/');

ws.onopen = () => {
        console.log('WebSocket connected');
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    addMessage(data.message);
};

ws.onclose = () => {
    console.log('WebSocket disconnected');
};

function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesElement.appendChild(messageElement);
}
