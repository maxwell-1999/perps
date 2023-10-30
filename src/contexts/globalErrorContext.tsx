import { createContext, useContext, useState } from 'react'

export enum ErrorTypes {
  pyth = 'pyth',
}

type GlobalErrorContextType = {
  error: ErrorTypes | undefined
  setError: (error?: ErrorTypes) => void
  onPythError: () => void
  resetPythError: () => void
}

const GlobalErrorContext = createContext<GlobalErrorContextType>({
  error: undefined,
  setError: (error?: ErrorTypes) => {
    error
  },
  onPythError: () => {},
  resetPythError: () => {},
})

export const GlobalErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = useState<ErrorTypes | undefined>()

  const onPythError = () => {
    if (error !== ErrorTypes.pyth) {
      setError(ErrorTypes.pyth)
    }
  }

  const resetPythError = () => {
    if (error === ErrorTypes.pyth) {
      setError(undefined)
    }
  }

  return (
    <GlobalErrorContext.Provider value={{ error, setError, onPythError, resetPythError }}>
      {children}
    </GlobalErrorContext.Provider>
  )
}

export const useGlobalErrorContext = () => {
  const context = useContext(GlobalErrorContext)
  if (!context) {
    throw new Error('useGlobalErrorContext must be used within a GlobalErrorProvider')
  }
  return context
}
