import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Color } from 'src/item/entities/color.entity';
import { Dimension } from 'src/item/entities/dimension.entity';
import { Item } from 'src/item/entities/item.entity';
import { Photo } from 'src/item/entities/photo.entity';
import { OrderItem } from 'src/order/entities/order-item.entity';
import { Order } from 'src/order/entities/order.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: [Item, Photo, Dimension, Color, User, Order, OrderItem],
  synchronize: true,
};
