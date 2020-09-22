import { User } from '../entities/User';
import { DbContext, UsernameInput, UserResponse } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import {
  RegisterValidations,
  UserLoginValidation,
  UserRegisterValidation,
} from '../validations/UserValidation';
import { createAPIErrors } from '../util/utilities';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { db, req }: DbContext): Promise<User | null> {
    const id = Number(req.session!.userId);
    return isNaN(id) ? null : await db.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernameInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const data: RegisterValidations = {
      ...options,
      exists: await db.findOne(User, { username: options.username }),
    };

    // validate user registration
    const v = UserRegisterValidation();
    const valid = v.validateAll(data);

    if (!valid) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const hash = await argon2.hash(data.password);
    const user = db.create(User, {
      username: data.username,
      password: hash,
    });

    await db.persistAndFlush(user);
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernameInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const { username, password } = options;
    const user = await db.findOne(User, { username });

    // validate user registration
    const v = UserLoginValidation();
    const valid = v.validateCustom(
      [
        { key: 'username', value: username, state: user },
        { key: 'password', value: password, state: user },
      ],
      user
    );

    return !valid
      ? { errors: createAPIErrors(v.validationState) }
      : (() => {
          req.session!.userId = user!.id;
          return { user: user ? user : undefined };
        })();
  }
}
