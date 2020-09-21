import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { UserLoginValidation, UserRegisterValidation } from "../validations/UserValidation";
import { ValidationState } from "../validations/ValidationState";
import argon2 from 'argon2';

@InputType()
export class UsernameInput {
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
    @Arg('options') options: UsernameInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse | null> {
    const { username, password } = options;
    const v = UserRegisterValidation();
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
    @Arg('options') options: UsernameInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse | null> {
    const { username, password } = options;
    const user = await em.findOne(User, { username });
    const v = UserLoginValidation();
    const valid = v.validateCustom([
      { key: 'username', value: username, state: user },
      { key: 'password', value: password, state: user },
    ], user);
    if (!valid) {
      return {
        errors: createAPIErrors(v.validationState),
      }
    }
    return {
      user: user ? user : undefined,
    }
  }
}
