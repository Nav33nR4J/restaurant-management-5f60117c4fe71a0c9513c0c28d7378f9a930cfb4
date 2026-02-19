/**
 * Unit Tests for Text Component
 */
import { render } from '@testing-library/react-native';
import React from 'react';
import Text from '../../components/atoms/Text';

describe('Text Component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Text>Hello World</Text>
    );
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const variants = ['h1', 'h2', 'h3', 'body', 'caption', 'label'] as const;
    
    variants.forEach((variant) => {
      const { getByText, unmount } = render(
        <Text variant={variant}>{variant} text</Text>
      );
      expect(getByText(`${variant} text`)).toBeTruthy();
      unmount();
    });
  });

  it('renders with custom color', () => {
    const { getByText } = render(
      <Text color="red">Colored Text</Text>
    );
    expect(getByText('Colored Text')).toBeTruthy();
  });

  it('renders with custom weight', () => {
    const weights = ['light', 'regular', 'medium', 'semibold', 'bold'] as const;
    
    weights.forEach((weight) => {
      const { getByText, unmount } = render(
        <Text weight={weight}>{weight} text</Text>
      );
      expect(getByText(`${weight} text`)).toBeTruthy();
      unmount();
    });
  });

  it('renders with custom alignment', () => {
    const alignments = ['left', 'center', 'right'] as const;
    
    alignments.forEach((align) => {
      const { getByText, unmount } = render(
        <Text align={align}>{align} text</Text>
      );
      expect(getByText(`${align} text`)).toBeTruthy();
      unmount();
    });
  });

  it('respects numberOfLines prop', () => {
    const { getByText } = render(
      <Text numberOfLines={2}>Limited Text</Text>
    );
    expect(getByText('Limited Text')).toBeTruthy();
  });
});

