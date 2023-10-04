import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photo } from './photo.entity';
import { Color } from './color.entity';

@Entity()
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ unique: true })
  reference: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column()
  type: string;

  @Column()
  height: number;

  @Column()
  width: number;

  @Column()
  price: number;

  @OneToMany(() => Photo, (photo) => photo.item, {
    eager: true,
    cascade: true,
  })
  photos: Photo[];

  @ManyToMany(() => Color, (color) => color.items, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinTable()
  colors: Color[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
