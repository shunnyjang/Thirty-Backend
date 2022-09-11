import { Migration } from '@mikro-orm/migrations';

export class Migration20220911144137 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "category" ("id" serial primary key, "created_at" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, "name" varchar(255) not null, "description" varchar(255) not null);');
    this.addSql('alter table "category" add constraint "category_name_unique" unique ("name");');

    this.addSql('create table "stamp" ("id" serial primary key, "created_at" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, "detail" varchar(255) not null, "illust" varchar(255) null);');

    this.addSql('create table "user" ("id" varchar(255) not null, "uuid" varchar(255) not null, "email" varchar(255) null, "password" varchar(255) null, "nickname" varchar(255) null, "date_joined" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, "role" varchar(255) not null default \'BASIC\', "visibility" varchar(255) not null default \'PRIVATE\', "refresh_token" varchar(255) null, "is_signed_up" boolean not null default false, "signup_at" timestamptz(0) null, "deleted_at" timestamptz(0) null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_uuid_unique" unique ("uuid");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "challenge" ("id" serial primary key, "created_at" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, "title" varchar(255) not null, "description" varchar(255) not null, "is_public" boolean not null default true, "category_id" int not null, "author_id" varchar(255) null, "thumbnail" varchar(255) null);');

    this.addSql('create table "mission" ("id" serial primary key, "challenge_id" int not null, "date" int not null, "detail" varchar(255) not null);');

    this.addSql('create table "bucket" ("id" varchar(255) not null, "user_id" varchar(255) not null, "challenge_id" int not null, "count" int not null default 0, "status" varchar(255) not null default \'WRK\', "created_at" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, constraint "bucket_pkey" primary key ("id"));');

    this.addSql('create table "answer" ("id" serial primary key, "created_at" timestamptz(0) not null default current_timestamp, "updated_at" timestamptz(0) not null default current_timestamp, "bucket_id" varchar(255) not null, "music" varchar(255) null, "date" int not null, "detail" varchar(255) null, "image" varchar(255) null, "stamp" int not null);');

    this.addSql('alter table "challenge" add constraint "challenge_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "challenge" add constraint "challenge_author_id_foreign" foreign key ("author_id") references "user" ("id") on update cascade on delete set null;');

    this.addSql('alter table "mission" add constraint "mission_challenge_id_foreign" foreign key ("challenge_id") references "challenge" ("id") on update cascade;');

    this.addSql('alter table "bucket" add constraint "bucket_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "bucket" add constraint "bucket_challenge_id_foreign" foreign key ("challenge_id") references "challenge" ("id") on update cascade;');

    this.addSql('alter table "answer" add constraint "answer_bucket_id_foreign" foreign key ("bucket_id") references "bucket" ("id") on update cascade;');
  }

}
