import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorScreen } from '@/components/shared/ErrorScreen'

import { EarnWithVaults } from './components'
import Migration from './components/Migration'
import { EmptyStateView } from './constants'

export default function VaultEmptyState() {
  const [view, setView] = useState<EmptyStateView>(EmptyStateView.earnWithVaults)
  if (view === EmptyStateView.migrate) {
    return (
      <ErrorBoundary fallback={<ErrorScreen />}>
        <Migration setView={setView} />
      </ErrorBoundary>
    )
  }
  return <EarnWithVaults setView={setView} />
}
