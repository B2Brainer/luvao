import type { ResearchViewFilters } from '../types'

type ResearchFiltersProps = {
  filters: ResearchViewFilters
  onChange: (patch: Partial<ResearchViewFilters>) => void
}

export default function ResearchFilters({
  filters,
  onChange,
}: ResearchFiltersProps) {
  return (
    <section className="research-filter-card">
      <h2>Parametros de investigacion</h2>
      <p>Ajusta el escenario activo para recalcular costo, cobertura y planeacion calorica sin salir de la pagina.</p>

      <div className="research-filter-grid">
        <label className="form-field">
          <span>Numero de personas</span>
          <input
            type="number"
            min={1}
            max={12}
            value={filters.householdSize}
            onChange={(event) => onChange({ householdSize: Number(event.target.value) || 1 })}
          />
        </label>

        <label className="form-field">
          <span>Unidad de tiempo</span>
          <select
            value={filters.timeUnit}
            onChange={(event) => onChange({ timeUnit: event.target.value as ResearchViewFilters['timeUnit'] })}
          >
            <option value="days">Dias</option>
            <option value="weeks">Semanas</option>
            <option value="months">Meses</option>
          </select>
        </label>

        <label className="form-field">
          <span>Duracion</span>
          <input
            type="number"
            min={1}
            max={filters.timeUnit === 'days' ? 120 : 24}
            value={filters.durationValue}
            onChange={(event) => onChange({ durationValue: Number(event.target.value) || 1 })}
          />
        </label>

        <label className="form-field">
          <span>Kcal por persona y dia</span>
          <input
            type="number"
            min={1200}
            max={4500}
            step={50}
            value={filters.dailyCaloriesPerPerson}
            onChange={(event) => onChange({ dailyCaloriesPerPerson: Number(event.target.value) || 2200 })}
          />
        </label>

        <label className="form-field">
          <span>Proyeccion principal</span>
          <select
            value={filters.projectionMode}
            onChange={(event) => onChange({ projectionMode: event.target.value as ResearchViewFilters['projectionMode'] })}
          >
            <option value="people">Costo por personas</option>
            <option value="duration">Costo por tiempo</option>
          </select>
        </label>
      </div>

      <div className="research-filter-note">
        <strong>Lectura recomendada</strong>
        <p>
          Cambia primero personas, tiempo y kcal para tensionar el escenario. La proyeccion, la comparacion por tienda
          y la distribucion calorica se recalculan con cada cambio.
        </p>
      </div>
    </section>
  )
}