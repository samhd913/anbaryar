/**
 * Unit tests for DrugCard component
 * Tests the UI component for displaying drug information
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { DrugCard } from '../../components/ui/DrugCard';
import { Drug } from '../../models/Drug';

describe('DrugCard Component', () => {
  const mockDrug: Drug = {
    id: 'test-1',
    code: 'ABC123',
    name: 'استامینوفن 500mg',
    systemQty: 100,
    physicalQty: 80,
    difference: -20,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render drug information correctly', () => {
    const { getByText } = render(
      <DrugCard drug={mockDrug} onPress={mockOnPress} />
    );

    expect(getByText('ABC123')).toBeTruthy();
    expect(getByText('استامینوفن 500mg')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
    expect(getByText('80')).toBeTruthy();
  });

  it('should display correct status for shortage', () => {
    const { getByText } = render(
      <DrugCard drug={mockDrug} onPress={mockOnPress} />
    );

    expect(getByText('کمبود 20')).toBeTruthy();
  });

  it('should display correct status for surplus', () => {
    const surplusDrug: Drug = {
      ...mockDrug,
      physicalQty: 120,
      difference: 20,
    };

    const { getByText } = render(
      <DrugCard drug={surplusDrug} onPress={mockOnPress} />
    );

    expect(getByText('مازاد 20')).toBeTruthy();
  });

  it('should display correct status for exact match', () => {
    const exactDrug: Drug = {
      ...mockDrug,
      physicalQty: 100,
      difference: 0,
    };

    const { getByText } = render(
      <DrugCard drug={exactDrug} onPress={mockOnPress} />
    );

    expect(getByText('مطابق')).toBeTruthy();
  });

  it('should display correct status for uncounted', () => {
    const uncountedDrug: Drug = {
      ...mockDrug,
      physicalQty: 0,
      difference: 0,
    };

    const { getByText } = render(
      <DrugCard drug={uncountedDrug} onPress={mockOnPress} />
    );

    expect(getByText('شمارش نشده')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByTestId } = render(
      <DrugCard drug={mockDrug} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('drug-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockDrug);
  });

  it('should show selected state when isSelected is true', () => {
    const { getByTestId } = render(
      <DrugCard 
        drug={mockDrug} 
        onPress={mockOnPress} 
        isSelected={true} 
      />
    );

    const card = getByTestId('drug-card');
    expect(card.props.style).toContainEqual(
      expect.objectContaining({ borderColor: expect.any(String) })
    );
  });

  it('should handle long drug names correctly', () => {
    const longNameDrug: Drug = {
      ...mockDrug,
      name: 'این یک نام بسیار طولانی برای دارو است که باید به درستی نمایش داده شود',
    };

    const { getByText } = render(
      <DrugCard drug={longNameDrug} onPress={mockOnPress} />
    );

    expect(getByText(longNameDrug.name)).toBeTruthy();
  });

  it('should handle special characters in drug code', () => {
    const specialCodeDrug: Drug = {
      ...mockDrug,
      code: 'ABC-123_456',
    };

    const { getByText } = render(
      <DrugCard drug={specialCodeDrug} onPress={mockOnPress} />
    );

    expect(getByText('ABC-123_456')).toBeTruthy();
  });

  it('should display zero quantities correctly', () => {
    const zeroQtyDrug: Drug = {
      ...mockDrug,
      systemQty: 0,
      physicalQty: 0,
      difference: 0,
    };

    const { getByText } = render(
      <DrugCard drug={zeroQtyDrug} onPress={mockOnPress} />
    );

    expect(getByText('0')).toBeTruthy();
  });
});
