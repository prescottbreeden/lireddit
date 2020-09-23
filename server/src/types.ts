import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './entities/User';

export type DbContext = {
  db: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
  req: Request & { session?: Express.Session };
  res: Response;
};

@InputType()
export class UsernameInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
