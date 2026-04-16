import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('cards/:cardId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('cardId') cardId: string) {
    return this.commentsService.findAll(cardId);
  }

  @Post()
  create(
    @Param('cardId') cardId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(cardId, dto);
  }
}
