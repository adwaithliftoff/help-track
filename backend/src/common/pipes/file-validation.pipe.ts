import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { extname } from 'node:path';

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

const allowedExtensions = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.txt',
  '.pdf',
  '.csv',
  '.xls',
  '.xlsx',
];

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(values: any) {
    for (const value of values) {
      if (value.size > 5 * 1024 * 1024) {
        throw new BadRequestException('File size should be less than 5 MB');
      }
      if (!allowedMimeTypes.includes(value.mimetype)) {
        throw new BadRequestException(
          `Unsupported file type: ${value.mimetype}`,
        );
      }
      const ext = extname(value.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new BadRequestException(`Unsupported file extension: ${ext}`);
      }
    }
    return values;
  }
}
