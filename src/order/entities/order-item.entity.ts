import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reference: string;

  @Column()
  title: string;

  @Column()
  colorName: string;

  @Column()
  unitPrice: number;

  @Column()
  quantity: number;

  @Column()
  totalPrice: number;

  @Column()
  itemId: number;

  @ManyToOne(() => Order, (order) => order.orderItems, {
    eager: false,
    onDelete: 'CASCADE',
  })
  order: Order;
}
