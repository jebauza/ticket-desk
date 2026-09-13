export interface RealtimeNotifier {
  emit(event: string, payload?: unknown): void;
}
