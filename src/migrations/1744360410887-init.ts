import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1744360410887 implements MigrationInterface {
  name = 'Init1744360410887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`age\` int NOT NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles_role\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_5f9286e6c25594c6b88c108db7\` (\`userId\`), INDEX \`IDX_4be2f7adf862634f5f803d246b\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`content\``);
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD \`content\` text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`role\` ADD \`name\` varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_5c1cf55c308037b5aca1038a131\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_users_user\` ADD CONSTRAINT \`FK_ed6edac7184b013d4bd58d60e54\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_users_user\` ADD CONSTRAINT \`FK_a88fcb405b56bf2e2646e9d4797\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_5f9286e6c25594c6b88c108db77\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` ADD CONSTRAINT \`FK_4be2f7adf862634f5f803d246b8\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_4be2f7adf862634f5f803d246b8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles_role\` DROP FOREIGN KEY \`FK_5f9286e6c25594c6b88c108db77\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_users_user\` DROP FOREIGN KEY \`FK_a88fcb405b56bf2e2646e9d4797\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_users_user\` DROP FOREIGN KEY \`FK_ed6edac7184b013d4bd58d60e54\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_5c1cf55c308037b5aca1038a131\``,
    );
    await queryRunner.query(`ALTER TABLE \`role\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`role\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`post\` DROP COLUMN \`content\``);
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD \`content\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_4be2f7adf862634f5f803d246b\` ON \`user_roles_role\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5f9286e6c25594c6b88c108db7\` ON \`user_roles_role\``,
    );
    await queryRunner.query(`DROP TABLE \`user_roles_role\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
  }
}
