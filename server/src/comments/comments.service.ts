import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

const USER_SELECT = { id: true, name: true } as const;

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(cardId: string) {
    return this.prisma.comment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: USER_SELECT } },
    });
  }

  create(cardId: string, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        text: dto.text,
        cardId,
        userId: dto.userId,
      },
      include: { user: { select: USER_SELECT } },
    });
  }
}
