import { User } from '../entities/User';
import { DbContext, UserInput, UserResponse } from '../types';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { createAPIErrors } from '../util/utilities';
import { COOKIE_NAME } from '../constants';
import { registerValidations } from '../validations/definitions/registerValidations';
import argon2 from 'argon2';

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { db, req }: DbContext
  ) {
    const id = req.session?.id ? Number(req.session.id) : 0;
    const user = await db.findOne(User, { id });
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { db, req }: DbContext): Promise<User | null> {
    const id = Number(req.session!.userId);
    return isNaN(id) ? null : await db.findOne(User, { id });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UserInput,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const { username, email, password } = options;
    const v = registerValidations();

    const usernameExists = await db.findOne(User, { username });
    const emailExists = await db.findOne(User, { email });

    const valid = v.validateCustom([
      { key: 'username', value: username, state: usernameExists },
      { key: 'email', value: email, state: emailExists },
      { key: 'password', value: password, state: null },
    ]);

    if (!valid) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const hash = await argon2.hash(password);
    const user = db.create(User, {
      ...options,
      password: hash,
    });

    await db.persistAndFlush(user).catch(console.error);
    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { db, req }: DbContext
  ): Promise<UserResponse | null> {
    const exists = usernameOrEmail.includes('@')
      ? await db.findOne(User, { email: usernameOrEmail })
      : await db.findOne(User, { username: usernameOrEmail });

    let valid = true;
    const validationState = {
      usernameOrEmail: {
        isValid: false,
        error: '',
      },
      password: {
        isValid: false,
        error: '',
      },
    };

    if (!exists) {
      valid = false;
      validationState.usernameOrEmail.error = 'Could not find username.';
    } else {
      const validPassword = await argon2
        .verify(exists.password, password)
        .catch(() => Promise.resolve(false));

      if (!validPassword) {
        valid = false;
        validationState.password.error = 'Incorrect Password.';
      }
    }

    return !valid
      ? { errors: createAPIErrors(validationState) }
      : (() => {
          req.session!.userId = exists!.id;
          return { user: exists ? exists : undefined };
        })();
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: DbContext) {
    return new Promise((resolve) =>
      req.session?.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        err && console.log('something went boom', err);
        return err ? resolve(false) : resolve(true);
      })
    );
  }
}
