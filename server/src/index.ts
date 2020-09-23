import 'reflect-metadata';
import express, { Request, Response } from 'express';
import mikroOrmConfig from './mikro-orm.config';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME, __prod__ } from './constants';
import { MikroORM } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';
import cors from 'cors';

const main = async () => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();

  const app = express();

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
