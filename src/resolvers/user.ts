import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2';
import { UserValidation } from "../validations/UserValidation";
import { ValidationState } from "../validations/ValidationState";

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

const createAPIErrors = (v: ValidationState) => {
  console.log(Object.keys(v));
  return Object.keys(v).reduce((acc: any, curr: any) => {
    return v[curr].isValid
      ? acc
      : [...acc, { field: curr, message: v[curr].error }];
  }, []) as FieldError[];
}


@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse | null> {
    const { username, password } = options;
    const v = UserValidation();
    const valid = v.validateAll(options);
    if (!valid) {
      return {
        errors: createAPIErrors(v.validationState),
      }
    }
    const hash = await argon2.hash(password);
    const user = em.create(User, { username, password: hash });
    await em.persistAndFlush(user);
    return {
      user
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse | undefined> {
    const { username, password } = options;
    const user = await em.findOne(User, { username });
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message: "that username doesn't exist",
        }]
      }
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: "incorrect password",
        }]
      }
    }
    return {
      user,
    }
  }
}
