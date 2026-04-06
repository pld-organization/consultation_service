
// controller
import { Controller, Post, Get, Param, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './consultation.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('comment') comment: string,
    @Body('patientId') patientId: string,
  ) {
    return this.filesService.uploadFile(file, comment ,patientId  );
  }

  @Get(':id')
  async getFile(@Param('id') id: string) {
    return this.filesService.getFile(id);
  }
}
