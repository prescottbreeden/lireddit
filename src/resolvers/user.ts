import { User } from "../entities/User";
import { DbContext, UsernameInput, UserResponse } from "../types";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { RegisterValidations, UserLoginValidation, UserRegisterValidation } from "../validations/UserValidation";
import {createAPIErrors} from "../util/utilities";
import argon2 from 'argon2';

@Resolver()
export class UserResolver {

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameInput,
    @Ctx() { db }: DbContext
  ): Promise<UserResponse | null> {
    const data: RegisterValidations = {
      ...options,
      exists: await db.findOne(User, { username: options.username }),
    }

    // validate user registration
    const v = UserRegisterValidation();
    const valid = v.validateAll(data);

    return !valid
      ? { errors: createAPIErrors(v.validationState) }
      : (async () => {
        const hash = await argon2.hash(data.password);
        const user = db.create(User, {
          username: data.username, 
          password: hash
        });
        await db.persistAndFlush(user);
        return {
          user
        };
      })();
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernameInput,
    @Ctx() { db }: DbContext
  ): Promise<UserResponse | null> {
    const { username, password } = options;
    const user = await db.findOne(User, { username });

    // validate user registration
    const v = UserLoginValidation();
    const valid = v.validateCustom([
      { key: 'username', value: username, state: user },
      { key: 'password', value: password, state: user },
    ], user);

    return !valid
      ? { errors: createAPIErrors(v.validationState) }
      : { user: user ? user : undefined };
  }
}
