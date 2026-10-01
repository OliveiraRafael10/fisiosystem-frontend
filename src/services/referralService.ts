import { servicoEncaminhamento } from './servicoEncaminhamento'

export const referralService = {
  list: servicoEncaminhamento.list,
  queue: servicoEncaminhamento.queue,
  create: servicoEncaminhamento.create,
  indicators: servicoEncaminhamento.indicators,
  queuePriorityIndicators: servicoEncaminhamento.queuePriorityIndicators,
}
