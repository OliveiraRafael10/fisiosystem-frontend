import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../../api/api'

export function ApiLoading({ label = 'Carregando dados...' }: { label?: string }) {
  return <div className="api-state api-loading"><LoaderCircle size={22} /><strong>{label}</strong></div>
}

export function ApiError({ error, retry }: { error: unknown; retry?: () => void }) {
  return <div className="api-state api-error"><AlertCircle size={22} /><div><strong>Não foi possível carregar os dados</strong><p>{getApiErrorMessage(error)}</p></div>{retry && <button className="secondary-button" onClick={retry}><RefreshCw size={15} /> Tentar novamente</button>}</div>
}

export function MutationError({ error }: { error: unknown }) {
  if (!error) return null
  return <div className="form-error"><AlertCircle size={16} /><span>{getApiErrorMessage(error)}</span></div>
}
