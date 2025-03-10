import { MigrationInterface, QueryRunner } from "typeorm";

export class LoggerAudit1741601225161 implements MigrationInterface {
    name = 'LoggerAudit1741601225161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NULL, \`userEmail\` varchar(255) NULL, \`action\` enum ('create', 'update', 'delete', 'login', 'logout', 'password_reset', 'password_change', 'failed_login', 'access') NOT NULL, \`resource\` varchar(255) NOT NULL, \`resourceId\` varchar(255) NULL, \`oldValue\` json NULL, \`newValue\` json NULL, \`ipAddress\` varchar(255) NULL, \`userAgent\` varchar(500) NULL, \`metadata\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_cfa83f61e4d27a87fcae1e025a\` (\`userId\`), INDEX \`IDX_cee5459245f652b75eb2759b4c\` (\`action\`), INDEX \`IDX_8769d5d852a6b56dd77186a1c6\` (\`resource\`), INDEX \`IDX_b41c13e0a4212c95088d102981\` (\`resourceId\`), INDEX \`IDX_c69efb19bf127c97e6740ad530\` (\`createdAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deletedAt\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`deletedAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`deletedAt\` timestamp(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`DROP INDEX \`IDX_c69efb19bf127c97e6740ad530\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_b41c13e0a4212c95088d102981\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_8769d5d852a6b56dd77186a1c6\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_cee5459245f652b75eb2759b4c\` ON \`audit_logs\``);
        await queryRunner.query(`DROP INDEX \`IDX_cfa83f61e4d27a87fcae1e025a\` ON \`audit_logs\``);
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }

}
