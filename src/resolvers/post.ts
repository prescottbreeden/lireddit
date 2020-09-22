import {Post} from "../entities/Post";
import { DbContext } from "../types";
import {Int, Arg, Ctx, Query, Resolver, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {

  @Query(() => [Post], { description: 'Get all the posts.' })
  async posts(@Ctx() {db}: DbContext): Promise<Post[]> {
    return await db.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id', () => Int) id: number,
    @Ctx() {db}: DbContext,
  ): Promise<Post | null> {
    return await db.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() {db}: DbContext,
  ): Promise<Post | null> {
    const post = db.create(Post, {title});
    await db.persistAndFlush(post); 
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() {db}: DbContext,
  ): Promise<Post | null> {
    const post = await db.findOne(Post, {id});
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await db.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Post)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() {db}: DbContext,
  ): Promise<Post | null> {
    const post = await db.findOne(Post, {id});
    await db.nativeDelete(Post, { id });
    return post;
  }

}
