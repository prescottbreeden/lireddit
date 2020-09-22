import {Connection, EntityManager, IDatabaseDriver} from "@mikro-orm/core";
import {Field, InputType, ObjectType} from "type-graphql";
import {User} from "./entities/User";

export type DbContext = {
  db: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
}

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
