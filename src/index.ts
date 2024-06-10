import fs from "fs";
import { join } from "path";
import depthLimit from "graphql-depth-limit";
import { ApolloServer } from "@apollo/server";
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from '@graphql-tools/schema'
import { startStandaloneServer } from "@apollo/server/standalone";

import { connectDatabase } from "./utils/db.util";
import { permission } from './graphql/schema.shield';
import { resolvers } from "./graphql/resolvers/index.resolver";

const typeDefs = fs.readFileSync(
  join(process.cwd(), "src", "graphql", "schema.graphql"),
  "utf-8"
);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema: applyMiddleware(schema, permission),
  validationRules: [depthLimit(2)],
  status400ForVariableCoercionErrors: true,
});

connectDatabase()
  .then(() =>
    startStandaloneServer(server, {
      context: ({ req }) => {
        const {
          headers: { authorization = null },
        } = req;
        return Promise.resolve({ authorization });
      },
    })
  )
  .then(({ url }) => {
    console.log(`Server is up and running at ${url}`);
  });
