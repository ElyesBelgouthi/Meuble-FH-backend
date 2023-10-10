import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import ShortUniqueId from 'short-unique-id';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OrderService {
  private uid = new ShortUniqueId({ length: 8 });

  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
  ) {
    this.uid.setDictionary('alphanum_upper');
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order: Order = new Order();
      order.reference = 'COM' + '-' + this.uid.rnd();
      order.email = createOrderDto.email;
      order.firstName = createOrderDto.firstName;
      order.lastName = createOrderDto.lastName;
      order.phoneNumber = createOrderDto.phoneNumber;
      order.totalPrice = parseInt(createOrderDto.totalPrice);

      const cart = JSON.parse(createOrderDto.cart);

      const orderFinal = await queryRunner.manager.save(order);
      if (Array.isArray(cart)) {
        // Create and save item photos
        for (let cartItem of cart) {
          const orderItem: OrderItem = new OrderItem();
          orderItem.reference = cartItem.reference;
          orderItem.title = cartItem.title;
          orderItem.colorName = cartItem.color;
          orderItem.dimension = cartItem.dimension;
          orderItem.quantity = cartItem.quantity;
          orderItem.totalPrice = cartItem.price;
          orderItem.itemId = cartItem.id;
          orderItem.unitPrice = cartItem.priceUC;

          orderItem.order = orderFinal;
          await queryRunner.manager.save(orderItem);
        }
      }

      await queryRunner.commitTransaction();
      this.sendingMail(order.id);
      return orderFinal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async sendingMail(id: number) {
    const order: Order = await this.orderRepository.findOneBy({ id });

    if (order) {
      const totalPrice = order.totalPrice;

      const emailContent = `
        <html>
          <head>
            <style>
              /* Add CSS styles for better email formatting */
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f7f7f7;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
              }
              .header {
                background-color: #DAC0A3;
                color: #102C57;
                padding: 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .logo {
                text-align: center;
              }
              .logo img {
                max-width: 150px;
                height: auto;
              }
              .message {
                padding: 20px;
                text-align: center;
              }
              .message h2 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #102C57; /* Highlighted text color */
              }
              .total {
                margin-top: 20px;
                text-align: right;
                font-weight: bold;
                font-size: 20px;
                color: #F0535D; /* Highlighted price color */
              }
              .reference {
                margin-top: 20px;
                font-size: 16px;
                color: #102C57; /* Highlighted reference color */
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirmation de Commande</h1>
              </div>
              <div class="logo">
                <img src="https://i.imgur.com/xzWDPBI.png" alt="Logo" />
              </div>
              <div class="message">
                <h2>Merci ${order.firstName} ${order.lastName},</h2>
                <p>Votre commande a été confirmée avec succès. Nous vous remercions pour votre confiance.</p>
                <p class="reference">Référence de Commande: ${
                  order.reference
                }</p>
                <div class="total">
                  <p>Prix Total: ${totalPrice.toFixed(3)} DT</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      try {
        await this.mailerService.sendMail({
          to: order.email,
          from: 'meuble.fh.service@gmail.com',
          subject: 'Confirmation de Commande', // Subject line
          html: emailContent, // HTML body content
        });
        order.isConfirmed = true;
        return 'success';
      } catch (error) {
        return 'error';
      }
    }
  }

  async getOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getOrderById(id: number): Promise<Order> {
    return await this.orderRepository.findOneBy({ id });
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.orderRepository.delete({ id });
  }
}
