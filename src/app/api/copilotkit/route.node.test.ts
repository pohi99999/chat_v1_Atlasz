import { test } from 'node:test';
import assert from 'node:assert';
import { POST } from './route.ts';

test('POST returns 500 when OPENAI_API_KEY is missing', async () => {
  // Save original env
  const originalKey = process.env.OPENAI_API_KEY;

  try {
    // Ensure API key is missing
    delete process.env.OPENAI_API_KEY;

    // Mock Request object
    const mockReq = new Request('http://localhost/api/copilotkit', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });

    // Call the handler
    const response = await POST(mockReq);

    // Assertions
    assert.strictEqual(response.status, 500);
    const body = await response.json();
    assert.strictEqual(body.error, 'Configuration Error: Missing API Key');

  } finally {
    // Restore original env
    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }
});
