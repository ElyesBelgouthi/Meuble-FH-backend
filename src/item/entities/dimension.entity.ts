import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class Dimension extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  height: number;

  @Column()
  width: number;

  @Column()
  length: number;

  @Column()
  price: number;

  @ManyToOne(() => Item, (item) => item.dimensions, {
    eager: false,
    onDelete: 'CASCADE',
  })
  item: Item;
}
