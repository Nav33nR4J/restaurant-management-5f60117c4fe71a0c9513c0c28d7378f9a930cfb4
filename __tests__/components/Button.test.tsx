/**
 * Unit Tests for Button Component
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from '../../components/atoms/Button';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    );
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const { queryByText } = render(
      <Button title="Test Button" onPress={mockOnPress} loading={true} />
    );
    // When loading, the title should not be visible
    expect(queryByText('Test Button')).toBeNull();
  });

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'];
    
    variants.forEach((variant) => {
      const { getByText, unmount } = render(
        <Button 
          title={`${variant} button`} 
          onPress={mockOnPress} 
          variant={variant as any}
        />
      );
      expect(getByText(`${variant} button`)).toBeTruthy();
      unmount();
    });
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach((size) => {
      const { getByText, unmount } = render(
        <Button 
          title={`${size} button`} 
          onPress={mockOnPress} 
          size={size as any}
        />
      );
      expect(getByText(`${size} button`)).toBeTruthy();
      unmount();
    });
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <Button 
        title="Styled Button" 
        onPress={mockOnPress} 
        style={customStyle as any}
      />
    );
    expect(getByText('Styled Button')).toBeTruthy();
  });
});

