import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemModule } from './item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [ItemModule, TypeOrmModule.forRoot(typeOrmConfig), AuthModule, OrderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
