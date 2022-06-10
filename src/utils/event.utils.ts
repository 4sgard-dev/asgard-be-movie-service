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
  EventCreated = '4sgard.Event.EventCreated',
  EventDeleted = '4sgard.Event.EventDeleted',
  RatingCreated = '4sgard.Rating.RatingCreated',
  RatingDeleted = '4sgard.Rating.RatingDeleted',
  RatingUpdated = '4sgard.Rating.RatingUpdated',
  SuggestionCreated = '4sgard.Movie.SuggestionCreated',
  SuggestionDeleted = '4sgard.Movie.SuggestionDeleted',
}
