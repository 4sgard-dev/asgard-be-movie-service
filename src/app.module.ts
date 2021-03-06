import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { MovieController } from './controller/movie/movie.controller';
import { Movie } from './entities/Movie';
import { RatingController } from './controller/rating/rating.controller';
import { Rating } from './entities/Rating';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './controller/user/user.controller';
import { Event } from './entities/Event';
import { EventController } from './controller/event/event.controller';
import { MovieService } from './service/movie/movie.service';
import { TmdbService } from './service/tmdb/tmdb.service';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controller/health/health.controller';
import { CountController } from './controller/count/count.controller';
import { RatingService } from './service/rating/rating.service';
import { Suggestion } from './entities/Suggestion';
import { SuggestionController } from './controller/suggestion/suggestion.controller';
import { Vote } from './entities/Vote';
import { DaprService } from './service/dapr/dapr.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_URL'),
        port: 5432,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        synchronize: false,
        entities: ['dist/**/entities/*.js'],
        extra: {
          connectionLimit: 5,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Movie, User, Rating, Event, Suggestion, Vote]),
    HttpModule,
    TerminusModule,
  ],
  controllers: [
    AppController,
    MovieController,
    RatingController,
    UserController,
    EventController,
    CountController,
    SuggestionController,
    HealthController,
  ],
  providers: [
    AppService,
    MovieService,
    TmdbService,
    RatingService,
    DaprService,
  ],
})
export class AppModule {}
