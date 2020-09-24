import { Migration } from '@mikro-orm/migrations';

export class Migration20200924075133 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `user` modify `username` varchar(255), modify `password` varchar(255);'
    );
    this.addSql(
      'alter table `user` add unique `user_username_unique`(`username`);'
    );

    this.addSql(
      'create table `post` (`id` int unsigned not null auto_increment primary key, `created_at` datetime not null, `updated_at` datetime not null, `title` text not null) default character set utf8mb4 engine = InnoDB;'
    );
  }
}
