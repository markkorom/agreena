import { MigrationInterface, QueryRunner } from "typeorm";

export class $npmConfigName1675854304694 implements MigrationInterface {
  public name = "$npmConfigName1675854304694";

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log(queryRunner);
    // await queryRunner.query(
    //   `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "hashedPassword" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    // );
    // await queryRunner.query(
    //   `CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`,
    // );
    // await queryRunner.query(
    //   `ALTER TABLE "access_token" ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    // );
    await queryRunner.query(
      `CREATE TABLE "farm" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "name" character varying NOT NULL, "size" decimal NOT NULL, "yield" decimal NOT NULL, "coordinates" point NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_f20f028607b2603deabd8182999" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "farm" ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c17777" FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log(queryRunner);
    // await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9"`);
    // await queryRunner.query(`DROP TABLE "access_token"`);
    // await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c17777"`);
    await queryRunner.query(`DROP TABLE "farm"`);
  }
}
