import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import ShortUniqueId from 'short-unique-id';
import { ItemService } from 'src/item/item.service';
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
          orderItem.quantity = cartItem.quantity;
          orderItem.totalPrice = cartItem.price;
          orderItem.itemId = cartItem.id;
          orderItem.unitPrice = cartItem.priceUC;

          orderItem.order = orderFinal;
          await queryRunner.manager.save(orderItem);
        }
      }

      await queryRunner.commitTransaction();
      this.sendingMail(orderFinal);
      return orderFinal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  sendingMail(order: Order) {
    this.mailerService
      .sendMail({
        to: order.email,
        from: 'zappa.mohsen@gmail.com',
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        html: '<b>welcome</b>', // HTML body content
      })
      .then(() => {})
      .catch(() => {});
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
