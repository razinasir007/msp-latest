import { CodegenConfig } from '@graphql-codegen/cli'
import { loadEnv } from './src/loadconfig';

loadEnv();


const config: CodegenConfig = {
  schema: process.env.BACKEND_URL, //'http://0.0.0.0:8000/graphql',
  documents: ['src/**/*.tsx'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/apollo/gql-types/': {
      preset: 'client',
      plugins: []
    }
  }
}

export default config