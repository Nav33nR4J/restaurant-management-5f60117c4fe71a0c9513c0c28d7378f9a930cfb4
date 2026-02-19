/**
 * Unit Tests for Input Component
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Input from '../../components/atoms/Input';

describe('Input Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with label', () => {
    const { getByText } = render(
      <Input label="Test Label" onChangeText={mockOnChangeText} />
    );
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders without label', () => {
    const { queryByText } = render(
      <Input onChangeText={mockOnChangeText} />
    );
    // No label should be rendered
    expect(queryByText('Test Label')).toBeNull();
  });

  it('displays error message when error prop is provided', () => {
    const { getByText } = render(
      <Input error="This is an error" onChangeText={mockOnChangeText} />
    );
    expect(getByText('This is an error')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={mockOnChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'new text');
    expect(mockOnChangeText).toHaveBeenCalledWith('new text');
  });

  it('handles focus and blur events', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter text" onChangeText={mockOnChangeText} />
    );
    const input = getByPlaceholderText('Enter text');
    
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    // Should not throw errors
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <Input placeholder="Custom placeholder" onChangeText={mockOnChangeText} />
    );
    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('renders with custom container style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Input 
        onChangeText={mockOnChangeText} 
        containerStyle={customStyle as any}
        testID="input"
      />
    );
    expect(getByTestId('input')).toBeTruthy();
  });
});

