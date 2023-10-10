import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('api/v1/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly pdfService: PdfService,
  ) {}

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

  // @Get('pdf/:id')
  // async sendPDF(@Param('id') id: number, @Res() res: Response): Promise<void> {
  //   const order = await this.orderService.getOrderById(id);

  //   if (order) {
  //     const pdfFileName = await this.pdfService.generatePdf(order);

  //     // Set response headers for PDF download
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader(
  //       'Content-Disposition',
  //       `attachment; filename="${pdfFileName}"`,
  //     );

  //     const pdfReadStream = createReadStream(pdfFileName);
  //     pdfReadStream.pipe(res);
  //   } else {
  //     res.status(404).send('Order not found');
  //   }
  // }

  @Get('mail/:id')
  sendMail(@Param('id') id: number) {
    return this.orderService.sendingMail(id);
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
