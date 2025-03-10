import { MigrationInterface, QueryRunner } from "typeorm";

export class PostCmment1741609549501 implements MigrationInterface {
    name = 'PostCmment1741609549501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`files\` (\`id\` varchar(36) NOT NULL, \`originalName\` varchar(255) NOT NULL, \`fileName\` varchar(255) NOT NULL, \`mimeType\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`storageType\` enum ('local', 's3', 'gcs') NOT NULL DEFAULT 'local', \`path\` varchar(255) NOT NULL, \`url\` varchar(255) NULL, \`userId\` varchar(255) NULL, \`metadata\` json NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, INDEX \`IDX_389d4090f38da709582e7e3a95\` (\`mimeType\`), INDEX \`IDX_1d9c2e5be3355a1c2b0e831acc\` (\`storageType\`), INDEX \`IDX_7e7425b17f9e707331e9a6c733\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`posts\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`content\` text NOT NULL, \`published\` tinyint NOT NULL DEFAULT 0, \`userId\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`comments\` (\`id\` varchar(36) NOT NULL, \`content\` text NOT NULL, \`userId\` varchar(255) NULL, \`postId\` varchar(255) NULL, \`parentId\` varchar(255) NULL, \`replies\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`action\` \`action\` enum ('create', 'update', 'delete', 'login', 'logout', 'password_change', 'password_reset', 'access', 'custom') NOT NULL DEFAULT 'custom'`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`resource\` \`resource\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`userAgent\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_ae05faaa55c866130abef6e1fee\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_7e8d7c49f218ebb14314fdb3749\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_e44ddaaa6d058cb4092f83ad61f\` FOREIGN KEY (\`postId\`) REFERENCES \`posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comments\` ADD CONSTRAINT \`FK_8770bd9030a3d13c5f79a7d2e81\` FOREIGN KEY (\`parentId\`) REFERENCES \`comments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_8770bd9030a3d13c5f79a7d2e81\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_e44ddaaa6d058cb4092f83ad61f\``);
        await queryRunner.query(`ALTER TABLE \`comments\` DROP FOREIGN KEY \`FK_7e8d7c49f218ebb14314fdb3749\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_ae05faaa55c866130abef6e1fee\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` ADD \`userAgent\` varchar(500) NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`resource\` \`resource\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`audit_logs\` CHANGE \`action\` \`action\` enum ('create', 'update', 'delete', 'login', 'logout', 'password_reset', 'password_change', 'failed_login', 'access') NOT NULL`);
        await queryRunner.query(`DROP TABLE \`comments\``);
        await queryRunner.query(`DROP TABLE \`posts\``);
        await queryRunner.query(`DROP INDEX \`IDX_7e7425b17f9e707331e9a6c733\` ON \`files\``);
        await queryRunner.query(`DROP INDEX \`IDX_1d9c2e5be3355a1c2b0e831acc\` ON \`files\``);
        await queryRunner.query(`DROP INDEX \`IDX_389d4090f38da709582e7e3a95\` ON \`files\``);
        await queryRunner.query(`DROP TABLE \`files\``);
    }

}
