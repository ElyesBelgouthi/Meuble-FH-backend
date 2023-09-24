import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as pathLib from 'path';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Color) private colorRepository: Repository<Color>,
  ) {}

  createItem(createItemDto: CreateItemDto) {
    return 'This action adds a new item';
  }

  async createColor(
    createColorDto: CreateColorDto,
    path: string,
  ): Promise<Color> {
    try {
      const color: Color = new Color();
      color.name = createColorDto.name;
      color.reference = createColorDto.reference;
      color.path = path;
      return await color.save();
    } catch (error) {
      this.deleteFile(path, 'images');
      throw new ConflictException('Name or reference of color already exists');
    }
  }

  async getColorById(id: number): Promise<Color> {
    return await this.colorRepository.findOneBy({ id });
  }

  async getColors(): Promise<Color[]> {
    return await this.colorRepository.find();
  }

  update(id: number, updateItemDto: UpdateItemDto) {
    return `This action updates a #${id} item`;
  }

  async updateColor(
    id: number,
    updateColorDto: UpdateColorDto,
    path: string,
  ): Promise<Color> {
    try {
      const color: Color = await this.colorRepository.findOneBy({ id });
      if (!color) {
        throw new NotFoundException('Color not found');
      }
      const existingColor = await this.colorRepository.findOne({
        where: [
          { name: updateColorDto.name },
          { reference: updateColorDto.reference },
        ],
      });

      if (existingColor && existingColor.id !== color.id) {
        throw new ConflictException(
          'Color name or reference is already in use',
        );
      }

      color.name = updateColorDto.name;
      color.reference = updateColorDto.reference;

      if (path) {
        this.deleteFile(color.path, 'images');
        color.path = path;
      }

      return await this.colorRepository.save(color);
    } catch (error) {
      if (path) {
        this.deleteFile(path, 'images');
      }
      throw new ConflictException('Color name or reference is already in use');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }

  async removeColor(id): Promise<void> {
    const color = await this.colorRepository.findOneBy({ id });
    if (color) {
      try {
        this.deleteFile(color.path, 'images');
      } catch (error) {
      } finally {
        await color.remove();
      }
    }
  }

  async deleteFile(fileName: string, folder: string): Promise<void> {
    const filePath = pathLib.join(
      __dirname,
      '..',
      '..',
      'uploads',
      folder,
      fileName,
    );

    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      throw new NotFoundException('File not found');
    }

    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      throw new InternalServerErrorException('Unable to delete file');
    }
  }
}
