import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Users of lireddit' })
@Entity()
export class User {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: 'string', unique: true })
  username!: string;

  @Field()
  @Property({ type: 'string', unique: true })
  email!: string;

  @Property({ type: 'string' })
  password!: string;
}
