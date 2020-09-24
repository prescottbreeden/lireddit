import { Migration } from '@mikro-orm/migrations';

export class Migration20200924075158 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `user` add `email` varchar(255) not null;');
    this.addSql(
      'alter table `user` modify `username` varchar(255) not null, modify `password` varchar(255) not null;'
    );
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');
    this.addSql(
      'alter table `user` add unique `user_username_unique`(`username`);'
    );
  }
}
