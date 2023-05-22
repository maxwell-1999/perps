import React from 'react'

import { render, screen } from '@utils/testUtils'

import { Button, IconButton } from '../index'

const testId = 'test-btn'

describe('Button', () => {
  test('renders button with provided label', () => {
    const props = { label: 'Test Button', onClick: () => {} }
    render(<Button data-testid={testId} {...props} />)

    const button = screen.getByTestId(testId)
    expect(button).toBeInTheDocument()
  })

  test('displays left and right icons when provided', () => {
    const leftIconTestId = 'left-icon'
    const rightIconTestId = 'right-icon'
    const props = {
      label: 'Test Button',
      onClick: () => {},
      leftIcon: <span data-testid={leftIconTestId} />,
      rightIcon: <span data-testid={rightIconTestId} />,
    }
    render(<Button data-testid={testId} {...props} />)

    const leftIcon = screen.getByTestId(leftIconTestId)
    const rightIcon = screen.getByTestId(rightIconTestId)

    expect(leftIcon).toBeInTheDocument()
    expect(rightIcon).toBeInTheDocument()
  })

  test('disables the button when isDisabled is true', () => {
    const props = { label: 'Test Button', onClick: () => {}, isDisabled: true }
    render(<Button data-testid={testId} {...props} />)

    const button = screen.getByTestId(testId)
    expect(button).toBeDisabled()
  })

  test('shows loading spinner when isLoading is true', () => {
    const props = { label: 'Test Button', onClick: () => {}, isLoading: true }
    render(<Button data-testid={testId} {...props} />)

    const button = screen.getByTestId(testId)
    const spinner = button.querySelector('.chakra-button__spinner')
    expect(spinner).toBeInTheDocument()
  })

  test('renders IconButton', () => {
    const iconTestId = 'icon'

    render(<IconButton aria-label="test-icon" data-testid={testId} icon={<span data-testid={iconTestId} />} />)

    const icon = screen.getByTestId(iconTestId)
    expect(icon).toBeInTheDocument()
  })
})
