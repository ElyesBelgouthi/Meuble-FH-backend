import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ParamData,
} from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { DataSource, Repository } from 'typeorm';
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
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    private readonly dataSource: DataSource,
  ) {
    this.uid.setDictionary('alphanum_upper');
  }

  /*
   *
   *
   * Post requests
   *
   *
   */
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
      const colorIds = JSON.parse(createItemDto.colorIds);
      const colors: Color[] = await this.colorRepository
        .createQueryBuilder('color')
        .where('color.id IN (:...colorIds)', { colorIds })
        .getMany();

      if (colors) {
        item.colors = colors;
      }

      // Save the item
      const itemFinal = await queryRunner.manager.save(item);
      if (Array.isArray(regularPhotos)) {
        // Create and save item photos
        for (let photo of regularPhotos) {
          const itemPhoto: Photo = new Photo();
          itemPhoto.name = photo.originalname;
          itemPhoto.path = photo.filename;
          itemPhoto.item = itemFinal;
          await queryRunner.manager.save(itemPhoto);
        }
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

  /*
   *
   *
   * GET requests
   *
   *
   */
  async getItems(params: any): Promise<Item[]> {
    const queryBuilder = this.itemRepository.createQueryBuilder('item');

    if (params) {
      if (params.categories) {
        const categories = params.categories.split(',');
        queryBuilder.andWhere('item.category IN (:...categories)', {
          categories,
        });
      }

      if (params.types) {
        const types = params.types.split(',');
        queryBuilder.andWhere('item.type IN (:...types)', { types });
      }
    }
    queryBuilder
      .leftJoinAndSelect('item.photos', 'photo')
      .leftJoinAndSelect('item.colors', 'colr');

    return await queryBuilder.getMany();
  }

  async getItemById(id: number): Promise<Item> {
    return await this.itemRepository.findOneBy({ id });
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

  /*
   *
   *
   * Patch requests
   *
   *
   */

  async updateItem(
    id: number,
    updateItemDto: UpdateItemDto,
    photos: PhotoModel[],
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const item: Item = await this.itemRepository.findOneBy({ id });
      if (item) {
        item.title = updateItemDto.title;
        item.description = updateItemDto.description;
        item.height = updateItemDto.height;
        item.width = updateItemDto.width;
        item.type = updateItemDto.type;
        item.price = updateItemDto.price;
        item.category = updateItemDto.category;

        const colorIds = JSON.parse(updateItemDto.colorIds);
        const colors: Color[] = await this.colorRepository
          .createQueryBuilder('color')
          .where('color.id IN (:...colorIds)', { colorIds })
          .getMany();

        if (colors) {
          item.colors = colors;
        }
      }

      // Fetch colors based on color IDs

      // Save the item
      const itemFinal = await queryRunner.manager.save(item);
      if (Array.isArray(photos) && photos.length > 0) {
        const oldPhotos: Photo[] = item.photos;
        if (oldPhotos) {
          for (let photo of oldPhotos) {
            await this.removePhoto(photo.id);
          }
        }
        // Create and save item photos
        for (let photo of photos) {
          const itemPhoto: Photo = new Photo();
          itemPhoto.name = photo.originalname;
          itemPhoto.path = photo.filename;
          itemPhoto.item = itemFinal;
          await queryRunner.manager.save(itemPhoto);
        }
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

  /*
   *
   *
   * Delete requests
   *
   *
   */

  async removeItem(id: number): Promise<void> {
    const item = await this.itemRepository.findOneBy({ id });
    if (item) {
      const photos: Photo[] = item.photos;
      if (photos) {
        for (let photo of photos) {
          await this.removePhoto(photo.id);
        }
      }
      await item.remove();
    }
  }

  async removeColor(id: number): Promise<void> {
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

  async removePhoto(id: number): Promise<void> {
    const photo = await this.photoRepository.findOneBy({ id });
    if (photo) {
      try {
        this.deleteFile(photo.path, 'images');
      } catch (error) {
      } finally {
        await photo.remove();
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
