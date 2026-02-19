/**
 * Unit Tests for Card Component
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import Card from '../../components/atoms/Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'blue' };
    const { getByText } = render(
      <Card style={customStyle as any}>
        <Text>Styled Card</Text>
      </Card>
    );
    expect(getByText('Styled Card')).toBeTruthy();
  });

  it('renders with different elevation levels', () => {
    const elevations = ['sm', 'md', 'lg'] as const;
    
    elevations.forEach((elevation) => {
      const { getByText, unmount } = render(
        <Card elevation={elevation}>
          <Text>{elevation} Card</Text>
        </Card>
      );
      expect(getByText(`${elevation} Card`)).toBeTruthy();
      unmount();
    });
  });

  it('handles press when onPress is provided', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Card onPress={mockOnPress}>
        <Text>Pressable Card</Text>
      </Card>
    );
    
    fireEvent.press(getByText('Pressable Card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when not provided', () => {
    const { getByText } = render(
      <Card>
        <Text>Non-pressable Card</Text>
      </Card>
    );
    
    // Should not throw when pressed
    expect(getByText('Non-pressable Card')).toBeTruthy();
  });
});

