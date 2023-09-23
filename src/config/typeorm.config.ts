import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Color } from 'src/item/entities/color.entity';
import { Item } from 'src/item/entities/item.entity';
import { Photo } from 'src/item/entities/photo.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 1919,
  username: 'postgres',
  password: 'admin',
  database: 'Meuble-FH-DB',
  entities: [Item, Photo, Color],
  synchronize: true,
};
