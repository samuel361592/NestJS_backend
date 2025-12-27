import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1747034358438 implements MigrationInterface {
  name = 'Init1747034358438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(100) NOT NULL,
        "email" character varying(100) NOT NULL,
        "password" character varying(255) NOT NULL,
        "age" integer NOT NULL,
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(100) NOT NULL,
        CONSTRAINT "UQ_role_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "post" (
        "id" SERIAL PRIMARY KEY,
        "title" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "userId" integer,
        CONSTRAINT "FK_post_user"
          FOREIGN KEY ("userId")
          REFERENCES "user"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "userId" integer NOT NULL,
        "roleId" integer NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("userId", "roleId"),
        CONSTRAINT "FK_user_roles_user"
          FOREIGN KEY ("userId")
          REFERENCES "user"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role"
          FOREIGN KEY ("roleId")
          REFERENCES "role"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "role"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
