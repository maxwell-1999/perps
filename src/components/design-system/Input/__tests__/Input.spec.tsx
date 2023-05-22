import React from 'react'

import { fireEvent, render, screen } from '@utils/testUtils'

import { Input } from '../index'

const testId = 'test-input'

describe('Input Component', () => {
  const defaultProps = {
    id: 'test-input',
    labelText: 'Test Label',
    errorMessage: '',
    helperText: 'Test Helper Text',
    isRequired: false,
    pattern: '',
    ['data-testid']: testId,
  }

  it('renders the component without crashing', () => {
    render(<Input {...defaultProps} />)
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('renders the label text correctly', () => {
    render(<Input {...defaultProps} />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders the helper text correctly', () => {
    render(<Input {...defaultProps} />)
    expect(screen.getByText('Test Helper Text')).toBeInTheDocument()
  })

  it('renders the error message when provided', () => {
    const errorMessage = 'Test Error Message'
    render(<Input {...defaultProps} errorMessage={errorMessage} />)
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('sets the input as required when isRequired is true', () => {
    render(<Input {...defaultProps} isRequired />)
    expect(screen.getByTestId(testId)).toBeRequired()
  })

  it('sets the pattern attribute when provided', () => {
    const pattern = '\\d+'
    render(<Input {...defaultProps} pattern={pattern} />)
    expect(screen.getByTestId(testId)).toHaveAttribute('pattern', pattern)
  })

  it('updates the input value on change', () => {
    render(<Input {...defaultProps} />)
    fireEvent.change(screen.getByTestId(testId), { target: { value: 'New Value' } })
    expect(screen.getByTestId(testId)).toHaveValue('New Value')
  })
})
