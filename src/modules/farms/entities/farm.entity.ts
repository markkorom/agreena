
import { ColumnNumericTransformer } from "helpers/utils";
import { User } from "modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public address: string;

  @Column()
  public name: string;

  @Column("numeric", {
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  public size: number;

  @Column("numeric", {
    precision: 7,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  public yield: number;

  @Column("integer", {array: true})  //Looks a bit hacky to me, but at least it works.
  public coordinates: number[];

  @ManyToOne(() => User)
  public user?: User;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
