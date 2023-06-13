import React from 'react'
import { useForm } from 'react-hook-form'

import { fireEvent, render, screen } from '@utils/testUtils'

import { Input } from '../index'

// Mock Form Hook for providing 'control'
const MockForm: React.FC<{ children: (methods: any) => JSX.Element }> = ({ children }) => {
  const methods = useForm()
  return children({ ...methods })
}

const testId = 'test-input'

describe('Input Component', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'test-input',
    labelText: 'Test Label',
    errorMessage: '',
    helperText: 'Test Helper Text',
    isRequired: false,
    pattern: '',
    ['data-testid']: testId,
  }

  it('renders the component without crashing', () => {
    render(<MockForm>{(methods) => <Input {...defaultProps} control={methods.control} />}</MockForm>)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('renders the label text correctly', () => {
    render(<MockForm>{(methods) => <Input {...defaultProps} control={methods.control} />}</MockForm>)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('sets the input as required when isRequired is true', () => {
    render(<MockForm>{(methods) => <Input {...defaultProps} control={methods.control} isRequired />}</MockForm>)
    expect(screen.getByTestId(testId)).toBeRequired()
  })

  it('sets the pattern attribute when provided', () => {
    const pattern = '\\d+'
    render(<MockForm>{(methods) => <Input {...defaultProps} control={methods.control} pattern={pattern} />}</MockForm>)
    expect(screen.getByTestId(testId)).toHaveAttribute('pattern', pattern)
  })

  it('updates the input value on change', () => {
    render(<MockForm>{(methods) => <Input {...defaultProps} control={methods.control} />}</MockForm>)
    fireEvent.change(screen.getByTestId(testId), { target: { value: 'New Value' } })
    expect(screen.getByTestId(testId)).toHaveValue('New Value')
  })
})
