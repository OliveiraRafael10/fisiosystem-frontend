import { servicoConsulta } from './servicoConsulta'

export const appointmentService = {
  list: servicoConsulta.list,
  agenda: servicoConsulta.agenda,
  create: servicoConsulta.create,
  indicators: servicoConsulta.indicators,
}
