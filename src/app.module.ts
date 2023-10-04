import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemModule } from './item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { OrderModule } from './order/order.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ItemModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthModule,
    OrderModule,
    MailerModule.forRoot({
      transport: {
        service: 'Gmail',
        auth: {
          user: 'zappa.mohsen@gmail.com',
          pass: 'hammia7167416',
        },
      },

      defaults: {
        from: '"Meuble FH" <zappa.mohsen@gmail.com>',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
