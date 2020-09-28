import { Post } from '../entities/Post';
import {
  Int,
  Arg,
  Query,
  Resolver,
  Mutation,
  Ctx,
  UseMiddleware,
} from 'type-graphql';
import { MyContext, PostResponse, PostInput } from '../types';
import { BaseResolver } from './base';
import { createPostValidations } from '../validations/definitions/createPost.validations';
import { createAPIErrors } from '../util/createApiErrors';
import { isAuth } from '../middleware/isAuth';

@Resolver()
export class PostResolver extends BaseResolver {
  @Query(() => [Post], { description: 'Get all the posts.' })
  async posts(): Promise<Post[]> {
    return await Post.find();
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return await Post.findOne(id);
  }

  @Mutation(() => PostResponse)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<PostResponse | undefined> {
    const v = createPostValidations();
    const valid = v.validateAll(input);

    if (!valid) {
      return { errors: createAPIErrors(v.validationState) };
    }

    const creatorId = this.getLoggedInUserID(req);
    const post = await Post.create({
      ...input,
      creatorId,
    }).save();

    return { post };
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    if (!post) {
      return undefined;
    }
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async deletePost(@Arg('id') id: number): Promise<Post | undefined> {
    const post = await Post.findOne(id);
    await Post.delete(id);
    return post;
  }
}
