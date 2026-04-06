import { Module } from '@nestjs/common';
import { FilesController } from './upload.controller';
import { FilesService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './upload.entity';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class UploadModule {}