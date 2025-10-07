/**
 * Unit tests for PhysicalCountInput component
 * Tests the form component for entering physical count
 */

import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { PhysicalCountInput } from '../../components/forms/PhysicalCountInput';
import { Drug } from '../../models/Drug';

describe('PhysicalCountInput Component', () => {
  const mockDrug: Drug = {
    id: 'test-1',
    code: 'ABC123',
    name: 'استامینوفن 500mg',
    systemQty: 100,
    physicalQty: 0,
    difference: 0,
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render drug information correctly', () => {
    const { getByText } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    expect(getByText('استامینوفن 500mg')).toBeTruthy();
    expect(getByText('کد کالا: ABC123')).toBeTruthy();
    expect(getByText('موجودی سیستم: 100')).toBeTruthy();
  });

  it('should display current physical quantity', () => {
    const drugWithPhysicalQty: Drug = {
      ...mockDrug,
      physicalQty: 80,
    };

    const { getByDisplayValue } = render(
      <PhysicalCountInput 
        drug={drugWithPhysicalQty} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    expect(getByDisplayValue('80')).toBeTruthy();
  });

  it('should calculate and display difference correctly for shortage', async () => {
    const { getByTestId, getByText } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '80');

    await waitFor(() => {
      expect(getByText('کمبود: 20')).toBeTruthy();
    });
  });

  it('should calculate and display difference correctly for surplus', async () => {
    const { getByTestId, getByText } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '120');

    await waitFor(() => {
      expect(getByText('مازاد: 20')).toBeTruthy();
    });
  });

  it('should calculate and display difference correctly for exact match', async () => {
    const { getByTestId, getByText } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '100');

    await waitFor(() => {
      expect(getByText('مطابق با سیستم')).toBeTruthy();
    });
  });

  it('should call onSave with correct values when save button is pressed', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '120');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('test-1', 120);
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onCancel when X button is pressed', () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const xButton = getByTestId('x-button');
    fireEvent.press(xButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should handle invalid input (negative number)', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '-10');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    // Should not call onSave for invalid input
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle invalid input (non-numeric)', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, 'abc');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    // Should not call onSave for invalid input
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should handle zero input', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '0');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('test-1', 0);
  });

  it('should handle large numbers', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '999999');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('test-1', 999999);
  });

  it('should handle decimal input', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '100.5');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('test-1', 100.5);
  });

  it('should handle empty input', async () => {
    const { getByTestId } = render(
      <PhysicalCountInput 
        drug={mockDrug} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    const input = getByTestId('physical-count-input');
    fireEvent.changeText(input, '');

    const saveButton = getByTestId('save-button');
    fireEvent.press(saveButton);

    // Should not call onSave for empty input
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});