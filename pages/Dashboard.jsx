import { useCallback, useEffect, useState } from 'react'
import { getDashboard } from '../services/dashboardService'
import { getErrorMessage } from '../services/api'
import { STATUS, PRIORIDADES } from '../constants'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import BarChart from '../components/ui/BarChart'
import DonutChart from '../components/ui/DonutChart'

const toItems = (constantes, totais = []) =>
    Object.entries(constantes).map(([key, c]) => ({
        key,
        label: c.label,
        tone: c.tone,
        value: totais[key] ?? 0
    }))

function formatDuration(horas) {
    if (horas == null) return '-'
    const minutos = Math.round(horas * 60)
    if (minutos < 60) return `${minutos} min`
    if (minutos < 60 * 24) { 
        const h = Math.floor(minutos/60)
        const m = minutos % 60
        return m ? `${h} h ${m} min` : `${h} h`
    }
    const d = Math.floor(minutos / (60 * 24))
    const h = Math.round((minutos % (60 * 24)) / 60)
    return h ? `${d} d ${h} h` : `${d} d`
}

export default function Dashboard({ title = 'Dashboard', totalLabel = 'Total de chamados' }){
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            setData(await getDashboard())
        } catch (err) {
            setError(getErrorMessage(err, 'Não foi possível carregar o dashboard.'))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const statusItems = data ? toItems(STATUS, data.porStatus) : []
    const prioridadeItems = data ? toItems(PRIORIDADES, data.porPrioridade) :
    []

    const total = statusItems.reduce((soma, i) => soma + i.value, 0)
    const abertos = data?.porStatus?.aberto ?? 0
    const concluidos = (data?.porStatus?.resolvido ?? 0) + (data?.porStatus?.fechado ?? 0)

    const categoriaItems = data
  ? (data.porCategoria || [])
      .map((c) => ({ key: c.id ?? c.nome, label: c.nome, value: c.total }))
      .sort((a, b) => b.value - a.value)
  : []

    return (
        <>
            <div className="page-header">   
                <h1 className="page-title">{title}</h1>
                <Button variant="secondary" onClick={load} loading={loading}>Atualizar</Button>
            </div>
 
            {error && <div className="alert alert-error">{error}</div>}
            {loading && !data && <p className="muted">Carregando...</p>}
        
            {data && (
                <>
                <div className="stat-grid">
                    <StatCard label={totalLabel} value={total} />
                    <StatCard label="Abertos" value={abertos} />
                    <StatCard label="Resolvidos / fechados" value={concluidos} />
                    <StatCard
                    label="Tempo médio de atendimento"
                    value={formatDuration(data.tempoMedioAtendimentoHoras)}
                    hint="Da abertura até a resolução"
                    />
                </div>
        
                <div className="chart-grid">
                    <section className="chart-card">
                        <h2>Chamados por status</h2>
                        <DonutChart items={statusItems} />
                    </section>
        
                    <section className="chart-card">
                        <h2>Chamados por prioridade</h2>
                        <BarChart items={prioridadeItems} />
                    </section>
        
                    <section className="chart-card wide">
                        <h2>Chamados por categoria</h2>
                        <BarChart items={categoriaItems} empty="Nenhum chamado por categoria ainda." />
                    </section>

            </div>
        </>
    )}
    </>
    )
}