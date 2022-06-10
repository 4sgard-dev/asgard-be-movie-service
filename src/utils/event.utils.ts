import { randomUUID } from 'crypto';

export class EventGridBuilder {
  public static build(eventType: EventType, subject: string, data: any): any {
    return {
      id: randomUUID(),
      subject,
      data: data,
      eventType: eventType,
      eventTime: new Date().toISOString(),
      dataVersion: '',
      metadataVersion: '1',
    };
  }
}

export enum EventType {
  MovieCreated = '4sgard.Movie.MovieCreated',
  MovieDeleted = '4sgard.Movie.MovieDeleted',
  EventCreated = '4sgard.Movie.EventCreated',
  EventDeleted = '4sgard.Movie.EventDeleted',
  RatingCreated = '4sgard.Movie.RatingCreated',
  RatingDeleted = '4sgard.Movie.RatingDeleted',
  RatingUpdated = '4sgard.Movie.RatingUpdated',
  SuggestionCreated = '4sgard.Movie.SuggestionCreated',
  SuggestionDeleted = '4sgard.Movie.SuggestionDeleted',
}
