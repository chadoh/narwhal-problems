import {
  CurrentEpochValidatorInfo, NextEpochValidatorInfo, ValidatorStakeView
} from 'near-api-js'
import near from './near'

export type ValidatorStatus = 'active' | 'next' | 'proposed' | 'inactive'

interface Cache {
  current: { [key: string]: CurrentEpochValidatorInfo; };
  next: { [key: string]: NextEpochValidatorInfo; };
  proposals: { [key: string]: ValidatorStakeView; };
}

let cache: Cache | null = null

async function fetchValidators(): Promise<Cache> {
  if (cache) return cache

  const res = await near.connection.provider.sendJsonRpc('validators', 'latest')

  cache = {
    current: res.current_validators.reduce(
      (acc: {}, v: CurrentEpochValidatorInfo) => {
        acc[v.account_id] = v
        return acc
      },
      {}
    ),
    next: res.next_validators.reduce(
      (acc: {}, v: NextEpochValidatorInfo) => {
        acc[v.account_id] = v
        return acc
      },
      {}
    ),
    proposals: res.current_proposals.reduce(
      (acc: {}, v: ValidatorStakeView) => {
        acc[v.account_id] = v
        return acc
      },
      {}
    )
  }

  return cache
}

export async function getStatus(validator: string): Promise<ValidatorStatus> {
  const validators = await fetchValidators()
  if (validators.current[validator]) return 'active'
  if (validators.next[validator]) return 'next'
  if (validators.proposals[validator]) return 'proposed'
  return 'inactive'
}
