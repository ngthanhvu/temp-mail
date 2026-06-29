export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    try {
      // Read raw email as ArrayBuffer
      const rawBytes = new Uint8Array(await message.raw.arrayBuffer());

      // Convert to base64 for transmission
      let binary = '';
      for (let i = 0; i < rawBytes.length; i++) {
        binary += String.fromCharCode(rawBytes[i]);
      }
      const rawBase64 = btoa(binary);

      // Forward raw email + metadata to backend for parsing
      const payload = {
        from: message.from,
        to: message.to,
        raw: rawBase64,
      };

      const response = await fetch(env.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': env.WEBHOOK_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        console.error(
          `Webhook failed: ${response.status} ${response.statusText} — ${body}`
        );
      }
    } catch (err) {
      console.error('Error processing email:', err);
    }
  },
};

interface Env {
  WEBHOOK_URL: string;
  WEBHOOK_SECRET: string;
}
