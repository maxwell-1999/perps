if (!process.env.NEXT_PUBLIC_TOS_API) {
  throw new Error('TOS API is not set')
}

export const TosBackendURL = process.env.NEXT_PUBLIC_TOS_API

export const jwtKey = (address: string) => {
  return `jwt_${address}`
}

export const LocalDev =
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const RestrictedCountries = [
  'US', // united states
  'BY', // belarus
  'CU', // cuba
  'IR', // iran
  'IQ', // iraq
  'CI', // cote d'ivoire
  'LR', // liberia
  'KP', // north korea
  'SD', // sudan
  'SY', // syria
  'ZW', // zimbabwe
]
