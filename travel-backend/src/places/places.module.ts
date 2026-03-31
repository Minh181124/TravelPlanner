import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

/**
 * PlacesModule — module quản lý tính năng Place Discovery.
 * PrismaService đã được export toàn cục từ PrismaModule, không cần import lại.
 */
@Module({
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService], // Export để các module khác có thể inject nếu cần
})
export class PlacesModule {}
