import { Field, ObjectType } from 'type-graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

@ObjectType({ description: 'Posts created for lireddit' })
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @UpdateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt = new Date();

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number;

  @Field()
  @Column()
  creatorId!: number;

  @ManyToOne(() => User, (user) => user.posts)
  creator: User;
}
