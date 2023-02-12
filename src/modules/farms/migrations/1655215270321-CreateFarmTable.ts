import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFarmTable1655215270321 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address" character varying NOT NULL, 
        "name" character varying NOT NULL, 
        "size" decimal NOT NULL, 
        "yield" decimal NOT NULL, 
        "coordinates" float[] NOT NULL, 
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
        "userId" uuid, CONSTRAINT "PK_f20f028607b2603deabd8182999" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm" 
       ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c17777"
       FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c17777"`)
    await queryRunner.query(`DROP TABLE "farm"`);
  }
}
