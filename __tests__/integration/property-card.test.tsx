/**
 * Example integration test
 * This demonstrates how to test multiple components working together
 */

import { render, screen, waitFor } from '../test-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import userEvent from '@testing-library/user-event';

// Mock component that uses multiple UI elements
function PropertyCard({ title, price, onContact }: { title: string; price: number; onContact: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p data-testid="price">${price.toLocaleString()}</p>
        <Button onClick={onContact}>Contact Owner</Button>
      </CardContent>
    </Card>
  );
}

describe('PropertyCard Integration', () => {
  it('displays property information correctly', () => {
    const mockContact = jest.fn();
    
    render(
      <PropertyCard 
        title="Beautiful Apartment" 
        price={1500} 
        onContact={mockContact}
      />
    );

    expect(screen.getByText('Beautiful Apartment')).toBeInTheDocument();
    expect(screen.getByTestId('price')).toHaveTextContent('$1,500');
    expect(screen.getByRole('button', { name: /contact owner/i })).toBeInTheDocument();
  });

  it('calls onContact when button is clicked', async () => {
    const user = userEvent.setup();
    const mockContact = jest.fn();
    
    render(
      <PropertyCard 
        title="Test Property" 
        price={2000} 
        onContact={mockContact}
      />
    );

    const contactButton = screen.getByRole('button', { name: /contact owner/i });
    await user.click(contactButton);

    await waitFor(() => {
      expect(mockContact).toHaveBeenCalledTimes(1);
    });
  });

  it('renders multiple property cards', () => {
    const mockContact = jest.fn();
    
    render(
      <div>
        <PropertyCard title="Property 1" price={1000} onContact={mockContact} />
        <PropertyCard title="Property 2" price={2000} onContact={mockContact} />
        <PropertyCard title="Property 3" price={3000} onContact={mockContact} />
      </div>
    );

    expect(screen.getByText('Property 1')).toBeInTheDocument();
    expect(screen.getByText('Property 2')).toBeInTheDocument();
    expect(screen.getByText('Property 3')).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button', { name: /contact owner/i });
    expect(buttons).toHaveLength(3);
  });
});
