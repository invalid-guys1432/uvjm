const chatEl = document.getElementById('chat');
const form = document.getElementById('form');
const nameInput = document.getElementById('name');
const msgInput = document.getElementById('msg');


// Connect to Pages Function websocket endpoint
const protocol = (location.protocol === 'https:') ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${location.host}/functions/chat`;
const ws = new WebSocket(wsUrl);


ws.addEventListener('open', () => {
addSystem('Connected to chat');
});


ws.addEventListener('message', (evt) => {
try {
const data = JSON.parse(evt.data);
if (data.type === 'history') {
data.messages.forEach(m => pushMessage(m));
} else if (data.type === 'message') {
pushMessage(data.message);
} else if (data.type === 'meta') {
// ignore for now
}
} catch (e) {
// if not JSON, just log
console.log('raw', evt.data);
}
});


ws.addEventListener('close', () => addSystem('Disconnected'));
ws.addEventListener('error', () => addSystem('Connection error'));


function pushMessage(m) {
const el = document.createElement('div');
el.className = 'message';
const t = new Date(m.ts);
el.innerHTML = `<div class="meta">${escapeHtml(m.author)} • ${t.toLocaleString()}</div><div>${escapeHtml(m.text)}</div>`;
chatEl.appendChild(el);
chatEl.scrollTop = chatEl.scrollHeight;
}


function addSystem(text) {
const el = document.createElement('div');
el.className = 'message';
el.style.background = '#fff3bf';
el.textContent = text;
chatEl.appendChild(el);
}


form.addEventListener('submit', (e) => {
e.preventDefault();
const name = nameInput.value.trim() || 'anon';
const text = msgInput.value.trim();
if (!text) return;
const payload = { type: 'message', author: name, text };
ws.send(JSON.stringify(payload));
msgInput.value = '';
});


function escapeHtml(str) {
return str.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]);
}
