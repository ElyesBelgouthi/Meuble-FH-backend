import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Color } from 'src/item/entities/color.entity';
import { Item } from 'src/item/entities/item.entity';
import { Photo } from 'src/item/entities/photo.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Order } from 'src/order/entities/order.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 1919,
  username: 'postgres',
  password: 'admin',
  database: 'Meuble-FH-DB',
  entities: [Item, Photo, Color, User, Order, OrderItem],
  synchronize: true,
};
