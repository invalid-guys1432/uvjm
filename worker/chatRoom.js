export class ChatRoom {
constructor(state, env) {
this.state = state;
this.env = env;
this.sockets = new Map(); // clientId -> WebSocket
this.nextClientId = 1;
}


async fetch(request) {
// Accept WebSocket upgrade
const upgradeHeader = request.headers.get('Upgrade') || '';
if (upgradeHeader.toLowerCase() !== 'websocket') {
return new Response('expected websocket', { status: 400 });
}


const pair = new WebSocketPair();
const client = pair[0];
const server = pair[1];
server.accept();


const clientId = (this.nextClientId++).toString();
this.sockets.set(clientId, server);


// Send recent history from DO storage (stored as array under key "history")
server.send(JSON.stringify({ type: 'meta', now: Date.now() }));
const raw = await this.state.storage.get('history');
const history = raw ? JSON.parse(raw) : [];
server.send(JSON.stringify({ type: 'history', messages: history }));


server.addEventListener('message', async (evt) => {
let message = evt.data;
// Expect JSON from clients
try {
const parsed = JSON.parse(message);
if (parsed?.type === 'message') {
const item = {
id: Date.now().toString() + '-' + Math.random().toString(36).slice(2,8),
author: parsed.author || 'anonymous',
text: parsed.text || '',
ts: Date.now()
};


// Save to DO short-term history (keep last 200 messages)
const rawHistory = await this.state.storage.get('history');
const h = rawHistory ? JSON.parse(rawHistory) : [];
h.push(item);
while (h.length > 200) h.shift();
await this.state.storage.put('history', JSON.stringify(h));
};
