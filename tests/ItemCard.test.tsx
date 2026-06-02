import { fireEvent, render, screen } from '@testing-library/react';
import ItemCard from '../src/components/ItemCard';

describe('ItemCard', () => {
  it('opens a season-based detail modal', async () => {
    render(
      <ItemCard
        title="Technical Knowledge"
        description="Core systems concepts and agentic coding workflows."
        thumbnailUrl="/galaxy.jpeg"
        seasons={[
          {
            id: 'core-concepts',
            title: 'Core Concepts',
            description: 'Distributed systems',
            videoUrl: '/danpardy.mp4',
          },
          {
            id: 'agentic-coding',
            title: 'Agentic Coding',
            description: 'Codex, Claude, Cursor',
            videoUrl: '/spar.mp4',
          },
        ]}
        modalConfig={{
          heading: 'Details',
          fields: [{ key: 'technologies', label: 'Skills' }],
        }}
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'View details for Technical Knowledge',
      })
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Core Concepts' })
    ).toBeInTheDocument();
  });
});
