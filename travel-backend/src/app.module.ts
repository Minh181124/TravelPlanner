import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlacesModule } from './places/places.module';
import { LocalModule } from './local/local.module';

@Module({
  imports: [
    PrismaModule, // Module quản lý DB của bạn
    PlacesModule, // Tìm kiếm địa điểm và tuyến đường
    LocalModule, // Tạo lịch trình Local (mẫu)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
