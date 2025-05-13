const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = new WebSocket('wss://chat-test-a1e7.onrender.com');

const chat = document.getElementById('chat');
const input = document.getElementById('messageInput');
const nameInput = document.getElementById('nameInput');
const roomInput = document.getElementById('roomInput');

const username = localStorage.getItem('chat_username') || prompt("Введите ваше имя:") || "Аноним";
nameInput.value = username;
localStorage.setItem('chat_username', username);

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    const currentRoom = roomInput.value || 'default';
    if (data.room !== currentRoom && !data.private) return;

    const msg = document.createElement('div');
    msg.classList.add('message');

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.style.backgroundColor = stringToColor(data.name);

    const content = document.createElement('div');
    content.classList.add('content');

    const name = document.createElement('div');
    name.classList.add('username');
    name.textContent = data.name;

    const text = document.createElement('div');
    text.classList.add('text');
    text.innerHTML = formatMessage(data.message);

    content.appendChild(name);
    content.appendChild(text);
    msg.appendChild(avatar);
    msg.appendChild(content);

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
};

function sendMessage() {
    const name = nameInput.value.trim() || "Аноним";
    const message = input.value.trim();
    const room = roomInput.value || "default";

    if (message) {
        let privateMsg = false;
        const privateTo = message.startsWith("@") ? message.split(" ")[0].substring(1) : null;
        if (privateTo && privateTo !== name) privateMsg = true;

        socket.send(JSON.stringify({ name, message, room, private: privateMsg, to: privateTo }));
        input.value = '';
    }
}

function formatMessage(msg) {
    let text = msg
        .replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>')  // Links
        .replace(/:([a-z_]+):/g, (m, p1) => emojis[p1] || m); // Emojis
    return text;
}

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
    return color.slice(0, 7);
}

const emojis = {
    smile: "😄",
    wink: "😉",
    heart: "❤️",
    fire: "🔥",
    thumbs_up: "👍",
    cry: "😢",
    clap: "👏",
    grin: "😁",
    angry: "😠",
    star: "⭐",
};
