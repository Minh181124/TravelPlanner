import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LocalService],
  controllers: [LocalController],
})
export class LocalModule {}
