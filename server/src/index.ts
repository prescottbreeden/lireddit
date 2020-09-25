import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { COOKIE_NAME, __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import connectRedis from 'connect-redis';
import cors from 'cors';
import mikroOrmConfig from './mikro-orm.config';
import Redis from 'ioredis';
import session from 'express-session';

const main = async () => {
  const app = express();

  const orm = await MikroORM.init(mikroOrmConfig);
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app
    .use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true,
      })
    )
    .use(
      session({
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years haha
          httpOnly: true,
          sameSite: 'lax', // csrf
          secure: __prod__, // cookie only works in https
        },
        name: COOKIE_NAME,
        resave: false,
        store: new RedisStore({ client: redis }),
        secret: 'dingoes ate my semi-colons',
        saveUninitialized: false,
      })
    );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }: { req: Request; res: Response }) => ({
      db: orm.em,
      req,
      res,
    }),
  });
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => console.log('server started on localhost:4000'));
};

main().catch(console.error);
