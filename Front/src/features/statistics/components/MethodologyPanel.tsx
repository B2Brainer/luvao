type MethodologyPanelProps = {
  householdSize: number
  periodDays: number
  dailyCaloriesPerPerson: number
}

export default function MethodologyPanel({
  householdSize,
  periodDays,
  dailyCaloriesPerPerson,
}: MethodologyPanelProps) {
  return (
    <section className="methodology-card">
      <div>
        <h2>Metodologia</h2>
        <p>
          La pagina separa lo observado de lo derivado para que la lectura investigativa sea transparente.
        </p>
      </div>

      <section>
        <h3>Variables observadas</h3>
        <ul>
          <li>Precios scrapeados, series temporales, minimos, maximos, promedio, desviacion estandar y coeficiente de variacion.</li>
          <li>Distribucion del gasto por tienda y productos con o sin match en el catalogo actual.</li>
        </ul>
      </section>

      <section>
        <h3>Variables derivadas</h3>
        <ul>
          <li>Costo por persona y dia, ahorro potencial y cobertura del optimizador por categoria.</li>
          <li>Escenario activo: {householdSize} personas, {periodDays} dias y {dailyCaloriesPerPerson} kcal por persona/dia.</li>
        </ul>
      </section>

      <section>
        <h3>Variables estimadas</h3>
        <ul>
          <li>Las calorias provienen de referencias del optimizador, no de fichas nutricionales de cada producto real.</li>
          <li>La conversion temporal usa equivalencias practicas: 1 semana = 7 dias y 1 mes = 30 dias.</li>
        </ul>
      </section>
    </section>
  )
}