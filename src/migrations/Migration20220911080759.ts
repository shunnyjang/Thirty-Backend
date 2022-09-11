import { Migration } from '@mikro-orm/migrations';

export class Migration20220911080759 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "challenge" add column "thumbnail" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "challenge" drop column "thumbnail";');
  }

}
