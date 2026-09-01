import { CalendarCheck, Mail, MoreHorizontal, Phone, Plus, Search, Star, UsersRound } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { therapists } from '../../data/mockData'

export function TherapistsPage() {
  return (
    <section className="page-content">
      <PageHeader eyebrow="EQUIPE CLÍNICA" title="Fisioterapeutas" description="Acompanhe especialidades, agendas e a ocupação de cada profissional." actions={<button className="primary-button page-primary"><Plus size={18} /> Novo profissional</button>} />
      <div className="team-summary"><div><span className="summary-icon"><UsersRound /></span><div><strong>7 profissionais</strong><p>5 em atendimento hoje</p></div></div><div className="team-capacity"><span>Ocupação da equipe</span><div><i style={{ width: '74%' }} /></div><strong>74%</strong></div><div className="team-rating"><Star size={18} fill="currentColor" /><div><strong>4,9</strong><span>Satisfação média</span></div></div></div>
      <div className="team-toolbar"><label className="table-search"><Search size={17} /><input placeholder="Buscar profissional ou especialidade..." /></label><div className="filter-tabs"><button className="selected">Todos</button><button>Disponíveis</button><button>Em atendimento</button></div></div>
      <div className="therapist-grid">
        {therapists.map((therapist) => <article className="therapist-card" key={therapist.id}><div className={`therapist-cover cover-${therapist.color}`}><span className={`therapist-avatar avatar-${therapist.color}`}>{therapist.initials}</span><button><MoreHorizontal size={19} /></button></div><div className="therapist-body"><div className="therapist-name"><div><h2>{therapist.name}</h2><p>{therapist.crefito}</p></div><StatusBadge>{therapist.status}</StatusBadge></div><span className="specialty-label">{therapist.specialty}</span><div className="contact-lines"><span><Phone size={14} /> {therapist.phone}</span><span><Mail size={14} /> {therapist.email}</span></div><div className="occupancy"><div><span>Ocupação hoje</span><strong>{therapist.occupancy}%</strong></div><div><i style={{ width: `${therapist.occupancy}%` }} /></div></div><footer><span><CalendarCheck size={16} /><strong>{therapist.todayAppointments}</strong> consultas hoje</span><button>Ver agenda</button></footer></div></article>)}
        <button className="add-therapist-card"><span><Plus size={23} /></span><strong>Adicionar fisioterapeuta</strong><p>Cadastre um novo profissional e configure sua agenda.</p></button>
      </div>
    </section>
  )
}
