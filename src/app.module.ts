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
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Movie, User, Rating]),
  ],
  controllers: [AppController, MovieController, RatingController],
  providers: [AppService],
})
export class AppModule {}
