/**
 * Unit tests for SearchBar component
 * Tests the search functionality for filtering drugs
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SearchBar } from '../../components/ui/SearchBar';

describe('SearchBar Component', () => {
  const mockOnChangeText = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    expect(getByPlaceholderText('جستجو در کد کالا یا نام دارو...')).toBeTruthy();
  });

  it('should render with custom placeholder', () => {
    const customPlaceholder = 'جستجوی سفارشی';
    const { getByPlaceholderText } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText}
        placeholder={customPlaceholder}
      />
    );

    expect(getByPlaceholderText(customPlaceholder)).toBeTruthy();
  });

  it('should display current value', () => {
    const testValue = 'استامینوفن';
    const { getByDisplayValue } = render(
      <SearchBar 
        value={testValue} 
        onChangeText={mockOnChangeText} 
      />
    );

    expect(getByDisplayValue(testValue)).toBeTruthy();
  });

  it('should call onChangeText when text changes', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'آسپرین');

    expect(mockOnChangeText).toHaveBeenCalledWith('آسپرین');
  });

  it('should show clear button when there is text', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="test" 
        onChangeText={mockOnChangeText} 
        onClear={mockOnClear}
      />
    );

    expect(getByTestId('clear-button')).toBeTruthy();
  });

  it('should not show clear button when there is no text', () => {
    const { queryByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
        onClear={mockOnClear}
      />
    );

    expect(queryByTestId('clear-button')).toBeNull();
  });

  it('should call onClear when clear button is pressed', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="test" 
        onChangeText={mockOnChangeText} 
        onClear={mockOnClear}
      />
    );

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('should handle empty string input', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="test" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, '');

    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('should handle special characters in search', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'ABC-123_456');

    expect(mockOnChangeText).toHaveBeenCalledWith('ABC-123_456');
  });

  it('should handle Persian text input', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'استامینوفن');

    expect(mockOnChangeText).toHaveBeenCalledWith('استامینوفن');
  });

  it('should handle long text input', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const longText = 'این یک متن بسیار طولانی برای تست جستجو است که باید به درستی پردازش شود';
    const input = getByTestId('search-input');
    fireEvent.changeText(input, longText);

    expect(mockOnChangeText).toHaveBeenCalledWith(longText);
  });

  it('should handle numeric input', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, '123456');

    expect(mockOnChangeText).toHaveBeenCalledWith('123456');
  });

  it('should handle mixed input (numbers and text)', () => {
    const { getByTestId } = render(
      <SearchBar 
        value="" 
        onChangeText={mockOnChangeText} 
      />
    );

    const input = getByTestId('search-input');
    fireEvent.changeText(input, 'ABC123');

    expect(mockOnChangeText).toHaveBeenCalledWith('ABC123');
  });
});
