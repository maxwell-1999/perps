/* eslint-disable */
const fs = require('fs')
const path = require('path')

const lenses = ['Lens', 'VaultLens']

lenses.forEach((lens) => {
  const lensJsonPath = path.join(__dirname, `../lens/artifacts/contracts/Lens.sol/${lens}.json`)
  const lensJson = JSON.parse(fs.readFileSync(lensJsonPath, 'utf-8'))
  const tsCode = `export const ${lens}2Abi = ${JSON.stringify(lensJson.abi)} as const;`
  const tsFilePath = path.join(__dirname, `../abi/v2/${lens}2.abi.ts`)
  fs.writeFileSync(tsFilePath, tsCode)
  console.log(`${lens}2 ABI copied to abi/v2/${lens}2.abi.ts`)
})
