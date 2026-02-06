import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  })),
}))

describe('App Component', () => {
  it('renders the header', () => {
    render(<App />)
    expect(screen.getByText('Gemini Web')).toBeInTheDocument()
  })

  it('renders the input placeholder', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('Ask Gemini anything...')).toBeInTheDocument()
  })
})
