if (!process.env.NEXT_PUBLIC_TOS_API) {
  throw new Error('TOS API is not set')
}

export const TosBackendURL = process.env.NEXT_PUBLIC_TOS_API

export const jwtKey = (address: string) => {
  return `jwt_${address}`
}
