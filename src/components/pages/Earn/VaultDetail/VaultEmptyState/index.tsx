import { useState } from 'react'

import { EarnWithVaults } from './components'
import Migration from './components/Migration'
import { EmptyStateView } from './constants'

export default function VaultEmptyState() {
  const [view, setView] = useState<EmptyStateView>(EmptyStateView.earnWithVaults)
  if (view === EmptyStateView.migrate) {
    return <Migration setView={setView} />
  }
  return <EarnWithVaults setView={setView} />
}
