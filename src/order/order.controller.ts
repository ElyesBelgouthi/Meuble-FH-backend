import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('api/v1/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get()
  getOrders() {
    return this.orderService.getOrders();
  }

  @Get(':id')
  getOrderById(@Param('id') id: number) {
    return this.orderService.getOrderById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.orderService.deleteOrder(id);
  }
}
