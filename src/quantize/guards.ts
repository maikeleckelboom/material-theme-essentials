import type {
  QuantizeWorkerDoneEvent,
  QuantizeWorkerStartEvent,
  QuantizeWorkerEvent,
} from './types'

export function isStartEvent(
  event: QuantizeWorkerEvent,
): event is QuantizeWorkerStartEvent {
  return event.data.type === 'start'
}

export function isDoneEvent(
  event: QuantizeWorkerEvent,
): event is QuantizeWorkerDoneEvent {
  return event.data.type === 'done'
}
