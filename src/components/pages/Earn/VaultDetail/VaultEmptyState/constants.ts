import { ObjectEntry } from 'type-fest/source/entry'

import { VaultUserSnapshot } from '@/hooks/vaults'

export enum EmptyStateView {
  earnWithVaults = 'earnWithVaults',
  migrate = 'migrate',
}

export type SharesAllowance = {
  alpha?: bigint | undefined
  bravo?: bigint | undefined
}

export type VaultUserSnapshotEntry = ObjectEntry<{ alpha?: VaultUserSnapshot; bravo?: VaultUserSnapshot }>
