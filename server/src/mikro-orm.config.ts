import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { MikroORM } from '@mikro-orm/core';
import { User } from './entities/User';
import path from 'path';
import { KEYS } from './keys';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  type: 'mysql',
  dbName: 'lireddit',
  ...KEYS.db,
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
