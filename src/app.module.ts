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
          user: 'meuble.fh.service@gmail.com',
          pass: 'oqsl ypjk bmfx disc',
        },
      },

      defaults: {
        from: '"Meuble FH" <meuble.fh.service@gmail.com>',
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
