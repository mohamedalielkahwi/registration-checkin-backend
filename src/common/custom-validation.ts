// qrcode-validation.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class QRCodeValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string')
      throw new BadRequestException('Invalid QR code');

    return value;
  }
}

@Injectable()
export class TicketNoValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== 'string')
      throw new BadRequestException('Invalid QR code');

    return value;
  }
}
