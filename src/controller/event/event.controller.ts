import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/Event';
import { CreateEvent } from '../dto/CreateEvent';
import { Movie } from '../../entities/Movie';

@Controller('events')
export class EventController {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  @Get()
  async getRatingByMovieId(
    @Query('movieId', ParseIntPipe) movieId: number,
  ): Promise<Event[]> {
    return this.eventRepository.find({
      where: { movieId: movieId },
    });
  }

  @Post()
  async createEvent(@Body() createEvent: CreateEvent) {
    const movieEntity = await this.movieRepository.findOneBy({
      movieId: createEvent.movieId,
    });

    if (!movieEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const eventEntity = {
      movieId: createEvent.movieId,
      time: createEvent.eventDate,
    } as Event;

    return this.eventRepository.save(eventEntity);
  }
}
