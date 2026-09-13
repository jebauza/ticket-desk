import { RealtimeNotifier } from '../../domain/interfaces/realtime-notifier';
import { WssServer } from './wss.server';

export class WssNotifier implements RealtimeNotifier {
  emit(event: string, payload?: unknown): void {
    WssServer.instance.broadcast(event, payload);
  }
}
