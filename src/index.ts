import 'reflect-metadata';
import express from 'express';
import mikroOrmConfig from "./mikro-orm.config";
import {__prod__} from "./constants";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log('server started on localhost:4000'));

}

main().catch(console.error);
