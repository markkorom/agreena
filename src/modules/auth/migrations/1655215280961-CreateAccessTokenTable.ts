import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccessTokenTable1655215280961 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "access_token" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "token" character varying NOT NULL, 
        "expiresAt" TIMESTAMP NOT NULL, 
        "userId" uuid NOT NULL, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP DEFAULT now(), 
        CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "access_token" 
       ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" 
       FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9"`);
    await queryRunner.query(`DROP TABLE "access_token"`);
  }
}
