import { CodegenConfig } from '@graphql-codegen/cli'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig({ path: './.env.local' })

const config: CodegenConfig = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  schema: [process.env.GRAPH_URL_ARBITRUM_2!],
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './types/gql/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        skipTypename: true,
        scalars: {
          BigInt: 'string',
          Bytes: 'string',
        },
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
