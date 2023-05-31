import { Result } from 'ethers'

// Utility function to convert ethers Result object to a serializable POJO
export function ethersResultToPOJO<T>(result: T): T {
  const obj = (result as unknown as Result).toObject()
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Result) {
      obj[key] = ethersResultToPOJO(obj[key] as Result)
    }
  })

  return obj as T
}
