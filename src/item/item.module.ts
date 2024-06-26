import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Color } from './entities/color.entity';
import { Photo } from './entities/photo.entity';
import { Dimension } from './entities/dimension.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Color, Photo, Dimension]), AuthModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
