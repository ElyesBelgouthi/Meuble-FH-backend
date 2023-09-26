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
import { Connection, DataSource, Repository } from 'typeorm';
import ShortUniqueId from 'short-unique-id';
import * as fs from 'fs';
import * as pathLib from 'path';
import { Item } from './entities/item.entity';
import { Photo } from './entities/photo.entity';
import { PhotoModel } from './models/photo.model';

@Injectable()
export class ItemService {
  private uid = new ShortUniqueId({ length: 8 });

  constructor(
    @InjectRepository(Color) private colorRepository: Repository<Color>,
    @InjectRepository(Item) private itemRepository: Repository<Item>,
    private readonly dataSource: DataSource,
  ) {
    this.uid.setDictionary('alphanum_upper');
  }

  async createItem(createItemDto: CreateItemDto, regularPhotos: PhotoModel[]) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item: Item = new Item();
      item.title = createItemDto.title;
      item.description = createItemDto.description;
      item.height = createItemDto.height;
      item.width = createItemDto.width;
      item.type = createItemDto.type;
      item.price = createItemDto.price;
      item.category = createItemDto.category;
      item.reference =
        createItemDto.category.slice(0, 2).toUpperCase() + '-' + this.uid.rnd();

      // Fetch colors based on color IDs
      // const colorIds = createItemDto.colorIds;
      // const colors: Color[] = await this.colorRepository
      //   .createQueryBuilder('color')
      //   .where('color.id IN (:...colorIds)', { colorIds })
      //   .getMany();

      // if (colors) {
      //   item.colors = colors;
      // }

      // Save the item
      const itemFinal = await queryRunner.manager.save(item);
      if (Array.isArray(regularPhotos)) {
        // Create and save item photos
        const itemPhotos = regularPhotos.map(async (photo: PhotoModel) => {
          const itemPhoto: Photo = new Photo();
          itemPhoto.name = photo.originalname;
          itemPhoto.path = photo.filename;
          await queryRunner.manager.save(itemPhoto);
          return itemPhoto;
        });

        // Wait for all item photos to be saved
        const savedPhotos = await Promise.all(itemPhotos);

        // Associate saved photos with the item
        itemFinal.photos = savedPhotos;
      }

      await queryRunner.commitTransaction();
      return itemFinal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createColor(
    createColorDto: CreateColorDto,
    path: string,
  ): Promise<Color> {
    try {
      const color: Color = new Color();
      color.name = createColorDto.name;
      color.reference = 'CL-' + this.uid.rnd();
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
        where: [{ name: updateColorDto.name }],
      });

      if (existingColor && existingColor.id !== color.id) {
        throw new ConflictException(
          'Color name or reference is already in use',
        );
      }

      color.name = updateColorDto.name;

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
