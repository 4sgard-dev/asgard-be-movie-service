import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../entities/Event';
import { CreateEvent } from '../dto/CreateEvent';
import { Movie } from '../../entities/Movie';
import { EventQuery } from '../dto/EventQuery';
import { EventGridBuilder, EventType } from '../../utils/event.utils';
import { DaprService } from '../../service/dapr/dapr.service';

@Controller('events')
export class EventController {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    private daprService: DaprService,
  ) {}

  @Get()
  async getRatingByMovieId(@Query() query: EventQuery): Promise<Event[]> {
    // Returns all events
    if (!query.movieId) {
      return this.eventRepository.find({
        relations: {
          movie: true,
        },
      });
    }

    return this.eventRepository.find({
      where: { movieId: query.movieId },
    });
  }

  @Post()
  async createEvent(
    @Body() createEvent: CreateEvent,
    @Headers('discord-id') discordId: string,
  ) {
    const movieEntity = await this.movieRepository.findOneBy({
      ...(createEvent.imdbId
        ? { imdbId: createEvent.imdbId }
        : { movieId: createEvent.movieId }),
    });

    if (!movieEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const eventEntity = {
      movieId: movieEntity.movieId,
      time: createEvent.eventDate,
    } as Event;

    const entitySaved = await this.eventRepository.save(eventEntity);

    const egEvent = EventGridBuilder.build(EventType.EventCreated, 'event', {
      eventId: eventEntity.eventId,
      movie: {
        movieId: movieEntity.movieId,
        imdbId: movieEntity.imdbId,
        title: movieEntity.name,
      },
      discordId,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return entitySaved;
  }

  @Delete(':id')
  async deleteEvent(
    @Param('id', ParseIntPipe) eventId: number,
    @Headers('discord-id') discordId: string,
  ) {
    const eventEntity = await this.eventRepository.findOneBy({
      eventId,
    });

    if (!eventEntity) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const eventRemoved = await this.eventRepository.remove(eventEntity);

    const egEvent = EventGridBuilder.build(EventType.EventDeleted, 'event', {
      eventId: eventEntity.eventId,
      movieId: eventEntity.movieId,
      discordId,
    });

    this.daprService.client.binding
      .send('asgard-eg', 'create', [egEvent])
      .then();

    return eventRemoved;
  }
}
