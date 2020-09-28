import { Request, Response } from 'express';
import { Field, InputType, ObjectType } from 'type-graphql';
import { User } from './entities/User';
import { Redis } from 'ioredis';
import { Post } from './entities/Post';

export type MyContext = {
  redis: Redis;
  req: Request & { session?: Express.Session };
  res: Response;
};

@InputType()
export class UserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Post, { nullable: true })
  post?: Post;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}
