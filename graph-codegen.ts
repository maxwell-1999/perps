import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://subgraph.satsuma-prod.com/4b3062a029bc/equilibria/perennial-arbitrum/api",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./types/gql/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
      config: {
        scalars: {
          BigInt: "string",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
