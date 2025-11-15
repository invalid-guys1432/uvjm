export async function onRequest(context) {
// This forwards the request to the Durable Object instance which handles the WebSocket
const id = context.env.CHAT_ROOM.idFromName('main-room');
const room = context.env.CHAT_ROOM.get(id);
return await room.fetch(context.request);
}
