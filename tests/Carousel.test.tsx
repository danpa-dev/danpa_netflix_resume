import { render, screen } from '@testing-library/react';
import Carousel from '../src/components/Carousel';

const items = [
  { id: '1', title: 'Item One', description: 'First item' },
  { id: '2', title: 'Item Two', description: 'Second item' },
  { id: '3', title: 'Item Three', description: 'Third item' },
];

describe('Carousel', () => {
  it('renders with a title', () => {
    render(<Carousel title="Test Section" items={items} />);
    expect(screen.getByRole('heading', { name: 'Test Section' })).toBeInTheDocument();
  });

  it('renders the correct number of list items', () => {
    render(<Carousel title="Test Section" items={items} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(items.length);
  });

  it('has region role with aria-labelledby', () => {
    render(<Carousel title="Work Experience" items={items} />);
    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-labelledby', 'carousel-work-experience');
  });

  it('renders with empty items array', () => {
    render(<Carousel title="Empty" items={[]} />);
    expect(screen.getByRole('heading', { name: 'Empty' })).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('applies custom className', () => {
    const { container } = render(<Carousel title="Test" items={items} className="custom-class" />);
    expect(container.querySelector('.carousel.custom-class')).toBeInTheDocument();
  });
});
