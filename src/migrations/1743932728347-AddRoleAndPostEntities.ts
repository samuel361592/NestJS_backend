import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleAndPostEntities1743932728347 implements MigrationInterface {
    name = 'AddRoleAndPostEntities1743932728347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`post\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`content\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_users_user\` (\`roleId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_ed6edac7184b013d4bd58d60e5\` (\`roleId\`), INDEX \`IDX_a88fcb405b56bf2e2646e9d479\` (\`userId\`), PRIMARY KEY (\`roleId\`, \`userId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`post\` ADD CONSTRAINT \`FK_5c1cf55c308037b5aca1038a131\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_users_user\` ADD CONSTRAINT \`FK_ed6edac7184b013d4bd58d60e54\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_users_user\` ADD CONSTRAINT \`FK_a88fcb405b56bf2e2646e9d4797\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_users_user\` DROP FOREIGN KEY \`FK_a88fcb405b56bf2e2646e9d4797\``);
        await queryRunner.query(`ALTER TABLE \`role_users_user\` DROP FOREIGN KEY \`FK_ed6edac7184b013d4bd58d60e54\``);
        await queryRunner.query(`ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_5c1cf55c308037b5aca1038a131\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\``);
        await queryRunner.query(`DROP INDEX \`IDX_a88fcb405b56bf2e2646e9d479\` ON \`role_users_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_ed6edac7184b013d4bd58d60e5\` ON \`role_users_user\``);
        await queryRunner.query(`DROP TABLE \`role_users_user\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`post\``);
    }

}
 