import { describe, it, expect } from 'vitest';
import fs from 'fs';

describe('Backend Server', () => {
  it('should have a server.js file', () => {
    expect(fs.existsSync('./server.js')).toBe(true);
  });

  it('should contain socket.io initialization', () => {
    const content = fs.readFileSync('./server.js', 'utf8');
    expect(content).toContain("new Server(server");
  });

  it('should integrate with Gemini Core', () => {
    const content = fs.readFileSync('./server.js', 'utf8');
    expect(content).toContain("@google/gemini-cli-core");
    expect(content).toContain("GeneralistAgent(config)");
  });
});
