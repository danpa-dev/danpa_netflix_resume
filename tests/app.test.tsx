import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the hero and skip link', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /dan park - featured roles/i })).toBeInTheDocument();
  });

  it('renders carousels when data is available', async () => {
    render(<App />);
    expect(await screen.findByRole('heading', { name: /work experience/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /skills & technologies/i })).toBeInTheDocument();
  });
});
