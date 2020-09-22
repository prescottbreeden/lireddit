import 'reflect-metadata';
import express from 'express';
import mikroOrmConfig from './mikro-orm.config';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

const main = async () => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

  app.use(
    session({
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years haha
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      name: 'qid',
      resave: false,
      store: new RedisStore({ client: redisClient }),
      secret: 'dingoes ate my semi-colons',
      saveUninitialized: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ db: orm.em, req, res }),
  });
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log('server started on localhost:4000'));
};

main().catch(console.error);
