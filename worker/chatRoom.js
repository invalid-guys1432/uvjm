export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    // Store messages in durable object storage
    this.state.storage.get("messages").then((msgs) => {
      this.messages = msgs || [];
    });
  }

  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname === "/send") {
      const data = await request.json();
      const { user, message } = data;

      const newMsg = {
        user,
        message,
        timestamp: Date.now(),
      };

      this.messages.push(newMsg);
      await this.state.storage.put("messages", this.messages);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "GET" && pathname === "/messages") {
      return new Response(JSON.stringify(this.messages), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }
}
