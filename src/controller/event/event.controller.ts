import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/Event';

@Controller('events')
export class EventController {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  @Get()
  async getRatingByMovieId(
    @Query('movieId', ParseIntPipe) movieId: number,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      where: { movieId: movieId },
    });
  }
}
