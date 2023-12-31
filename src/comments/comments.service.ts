import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from 'src/typeorm/entities';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentsRepository: Repository<CommentEntity>,
    private postsService: PostsService,
    private usersService: UsersService
  ) {}

  async create(dto: CreateCommentDto, userId: number) {
    const post = await this.postsService.findOne({ id: dto.postId })
    const user = await this.usersService.findOne({ id: userId })
    const newComment = this.commentsRepository.create({
      text: dto.text,
      post,
      user,
    })

    return await this.commentsRepository.save(newComment)
  }

  async find(postId: number, limit: number, order: 'ASC' | 'DESC') {
    return await this.commentsRepository.createQueryBuilder('comments')
    .leftJoinAndSelect('comments.post', 'post')
    .leftJoinAndSelect('comments.user', 'user')
    .select(['comments.id', 'comments.text', 'comments.createdAt', 'user.username'])
    .where("post.id = :postId", {postId})
    .orderBy('comments.id', order)
    .take(limit)
    .getMany();
  }
}
