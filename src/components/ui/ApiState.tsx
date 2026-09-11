import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react'
import { getApiErrorMessage } from '../../api/api'

export function ApiLoading({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-2xl border border-[#dce7e2] bg-white p-6 text-base text-[#49655b]">
      <LoaderCircle className="animate-spin text-brand-600" size={22} />
      <strong>{label}</strong>
    </div>
  )
}

export function ApiError({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="flex min-h-40 items-center gap-4 rounded-2xl border border-[#efc8bf] bg-[#fff5f2] p-6 text-[#a54b3c] max-[620px]:flex-col max-[620px]:items-start">
      <AlertCircle className="shrink-0" size={24} />
      <div className="min-w-0 flex-1">
        <strong className="block text-lg">Não foi possível carregar os dados</strong>
        <p className="mt-1.5 mb-0 text-base leading-relaxed">{getApiErrorMessage(error)}</p>
      </div>
      {retry && (
        <button className="secondary-button" onClick={retry}>
          <RefreshCw size={15} /> Tentar novamente
        </button>
      )}
    </div>
  )
}

export function MutationError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <div className="mx-0 flex items-center gap-2.5 rounded-xl border border-[#efc8bf] bg-[#fff2ee] px-4 py-3.5 text-sm text-[#a54b3c]">
      <AlertCircle className="shrink-0" size={18} />
      <span>{getApiErrorMessage(error)}</span>
    </div>
  )
}
