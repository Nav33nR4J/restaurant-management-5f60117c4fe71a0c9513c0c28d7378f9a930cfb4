/**
 * Unit Tests for QuantitySelector Component
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import QuantitySelector from '../../components/molecules/QuantitySelector';

describe('QuantitySelector Component', () => {
  const mockOnIncrement = jest.fn();
  const mockOnDecrement = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial quantity', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={5} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
      />
    );
    expect(getByText('5')).toBeTruthy();
  });

  it('calls onIncrement when + button is pressed', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={1} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
      />
    );
    
    fireEvent.press(getByText('+'));
    expect(mockOnIncrement).toHaveBeenCalledTimes(1);
  });

  it('calls onDecrement when - button is pressed', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={5} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
      />
    );
    
    fireEvent.press(getByText('−'));
    expect(mockOnDecrement).toHaveBeenCalledTimes(1);
  });

  it('does not call onDecrement when quantity is at minimum', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={1} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
        min={1}
      />
    );
    
    fireEvent.press(getByText('−'));
    expect(mockOnDecrement).not.toHaveBeenCalled();
  });

  it('does not call onIncrement when quantity is at maximum', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={10} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
        max={10}
      />
    );
    
    fireEvent.press(getByText('+'));
    expect(mockOnIncrement).not.toHaveBeenCalled();
  });

  it('respects custom min and max values', () => {
    const { getByText } = render(
      <QuantitySelector 
        quantity={5} 
        onIncrement={mockOnIncrement} 
        onDecrement={mockOnDecrement} 
        min={2}
        max={8}
      />
    );
    
    expect(getByText('5')).toBeTruthy();
  });
});

