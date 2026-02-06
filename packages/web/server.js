/* eslint-env node */
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Config, GeneralistAgent, LocalAgentExecutor } from '@google/gemini-cli-core';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Initialize Gemini Config
// Note: In a real app, you'd pass proper paths and settings
const config = new Config({
  apiKey: process.env.API_KEY_GOOGLE,
  // Minimal config for web usage
});

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('chat', async (message) => {
    console.log('Message received:', message);
    
    try {
      const agentDef = GeneralistAgent(config);
      const executor = new LocalAgentExecutor(agentDef, {
        config,
        onActivity: (activity) => {
          // Send tool usage and thoughts to the frontend
          if (activity.kind === 'tool-start') {
            socket.emit('stream', `\n> Running tool: ${activity.toolName}...\n`);
          }
        }
      });

      // Run the agent
      const result = await executor.run({ request: message });
      
      socket.emit('message', { 
        role: 'assistant', 
        content: result.response 
      });
    } catch (error) {
      console.error('Agent error:', error);
      socket.emit('message', { 
        role: 'assistant', 
        content: "Error: " + error.message 
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
