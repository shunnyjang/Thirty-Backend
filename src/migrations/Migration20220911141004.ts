import { Migration } from '@mikro-orm/migrations';

export class Migration20220911141004 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "is_signed_up" boolean not null default false;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" drop column "is_signed_up";');
  }

}
