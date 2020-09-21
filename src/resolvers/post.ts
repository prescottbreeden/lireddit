import {Post} from "../entities/Post";
import {MyContext} from "src/types";
import {Int, Arg, Ctx, Query, Resolver, Mutation } from "type-graphql";

@Resolver()
export class PostResolver {

  @Query(() => [Post], { description: 'Get all the posts.' })
  async posts(@Ctx() {em}: MyContext): Promise<Post[]> {
    return await em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id', () => Int) id: number,
    @Ctx() {em}: MyContext,
  ): Promise<Post | null> {
    return await em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() {em}: MyContext,
  ): Promise<Post | null> {
    const post = em.create(Post, {title});
    await em.persistAndFlush(post); 
    return post;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx() {em}: MyContext,
  ): Promise<Post | null> {
    const post = await em.findOne(Post, {id});
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Post)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() {em}: MyContext,
  ): Promise<Post | null> {
    const post = await em.findOne(Post, {id});
    await em.nativeDelete(Post, { id });
    return post;
  }

}
