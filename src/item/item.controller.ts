import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  NotFoundException,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from 'src/helpers/image.storage';
import { Express, Response } from 'express';
import { CreateColorDto } from './dto/create-color.dto';

import * as pathLib from 'path';
import * as fs from 'fs';
import { UpdateColorDto } from './dto/update-color.dto';
import { PhotoModel } from './models/photo.model';

@Controller('api/v1')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  /*
   *
   * Post Requests
   *
   *
   */
  @Post('item')
  @UseInterceptors(FilesInterceptor('photos', 5, saveImageToStorage))
  async createItem(
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() createItemDto: CreateItemDto,
  ) {
    if (!photos || photos.length === 0) {
      throw new BadRequestException('Images are missing.');
    }
    const regularPhotos: PhotoModel[] = [];
    for (const photo of photos) {
      regularPhotos.push({
        originalname: photo.originalname,
        filename: photo.filename,
      });
    }

    return this.itemService.createItem(createItemDto, regularPhotos);
  }

  @Post('color')
  @UseInterceptors(FileInterceptor('img', saveImageToStorage))
  async createColor(
    @UploadedFile() img: Express.Multer.File,
    @Body() createColorDto: CreateColorDto,
  ) {
    if (!img || !img.filename) {
      throw new BadRequestException('Image file is missing.');
    }
    return this.itemService.createColor(createColorDto, img?.filename);
  }

  /*
   *
   * Get Requests
   *
   *
   */

  @Get('item')
  getItems(@Query() params) {
    return this.itemService.getItems(params);
  }

  @Get('item/:id')
  getItemById(@Param('id') id: number) {
    return this.itemService.getItemById(id);
  }

  @Get('image/:path')
  getImage(@Param('path') path: string, @Res() res: Response) {
    const imagePath = pathLib.join(__dirname, '../../uploads/images', path);

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException('Image not found');
    }

    const fileExtension = pathLib.extname(path).toLowerCase();
    let contentType = '';

    if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else {
      throw new BadRequestException('Unsupported image format');
    }

    res.setHeader('Content-Type', contentType);

    const imageBuffer = fs.readFileSync(imagePath);
    res.send(imageBuffer);
  }

  @Get('color')
  getColors() {
    return this.itemService.getColors();
  }

  @Get('color/:id')
  getColor(@Param('id') id: number) {
    return this.itemService.getColorById(id);
  }

  /*
   *
   * Patch Requests
   *
   *
   */

  @Patch('item/:id')
  @UseInterceptors(FilesInterceptor('photos', 5, saveImageToStorage))
  async updateItem(
    @Param('id') id: number,
    @UploadedFiles() photos: Array<Express.Multer.File>,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    const regularPhotos: PhotoModel[] = [];
    for (const photo of photos) {
      regularPhotos.push({
        originalname: photo.originalname,
        filename: photo.filename,
      });
    }

    return this.itemService.updateItem(id, updateItemDto, regularPhotos);
  }

  @Patch('color/:id')
  @UseInterceptors(FileInterceptor('img', saveImageToStorage))
  updateColor(
    @UploadedFile() img: Express.Multer.File,
    @Param('id') id: number,
    @Body() updateColorDto: UpdateColorDto,
  ) {
    return this.itemService.updateColor(id, updateColorDto, img?.filename);
  }

  /*
   *
   * Delete Requests
   *
   *
   */

  @Delete('item/:id')
  removeItem(@Param('id') id: number) {
    return this.itemService.removeItem(id);
  }

  @Delete('color/:id')
  removeColor(@Param('id') id: number) {
    this.itemService.removeColor(id);
  }
}
