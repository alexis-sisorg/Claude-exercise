import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [PrismaModule, CommentsModule],
})
export class AppModule {}
