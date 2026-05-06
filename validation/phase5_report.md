# Fase 5 - Validacion y cierre academico

## Evidencias

- Resultados automatizados: [phase5_results.json](./phase5_results.json)
- Capturas UI sugeridas: [screenshots/login.png](./screenshots/login.png), [screenshots/products-dashboard.png](./screenshots/products-dashboard.png), [screenshots/products-optimized.png](./screenshots/products-optimized.png)

## 1. Pruebas tecnicas

| Prueba | Estado | Evidencia |
|---|---|---|
| stores_available | PASS | Stores disponibles: 3 |
| products_available | PASS | Productos canónicos disponibles: 2 |
| compare_has_results | PASS | Comparación arroz devolvió 30 candidatos |
| optimize_consistency | PASS | Total estimado 10090 coincide con suma de subtotales 10090 |
| d1_persisted_data | PASS | Productos persistidos para D1: 27 |
| job_integration_success | PASS | Job terminó en estado success |
| job_processed_all_stores | PASS | Tiendas procesadas por job: ['d1', 'exito', 'olimpica'] |

### Latencia

| Endpoint | Min (ms) | Promedio (ms) | Max (ms) |
|---|---:|---:|---:|
| compare | 9.16 | 14.95 | 18.51 |
| optimize | 14.44 | 15.36 | 16.47 |
| search | 9.93 | 10.62 | 11.83 |

| Regla | Estado | Evidencia |
|---|---|---|
| compare_under_1500ms_avg | PASS | Promedio compare 14.95 ms |
| optimize_under_1500ms_avg | PASS | Promedio optimize 15.36 ms |
| search_under_800ms_avg | PASS | Promedio search 10.62 ms |

## 2. Precision funcional de tienda optima

- Productos evaluados: 2
- Sin datos suficientes: 0
- Precision observada: 100.0%

| Producto | Tienda esperada | Tienda devuelta | Estado |
|---|---|---|---|
| arroz | d1 | d1 | PASS |
| aceite | d1 | d1 | PASS |

## 3. Checklist de usabilidad

| Item | Estado | Evidencia |
|---|---|---|
| Pantalla principal orientada a usuario | PASS | Products.tsx reemplaza el panel técnico por comparación + lista optimizada |
| Búsqueda de producto visible | PASS | Input principal con catálogo sugerido |
| Comparación por tienda visible | PASS | Tabla con bestByStore y ranking |
| Estados de carga de scraping en tiempo real | PASS | Polling contra /scraping-jobs/:jobId con barra de progreso |
| Filtros avanzados | PASS | Filtros por tienda, precio máximo y orden |
| Métricas visuales | PASS | Best price, spread, worst price y candidates |
| Lista optimizada con cantidades | PASS | Chips con cantidad y totales |
| Retroalimentación de error | PASS | Mensajes visibles para compare/optimize/scrape |
| Responsive básico | PASS | Breakpoints en Products.css y Header.css |

## 4. Resultados y conclusiones

- Integracion: el flujo completo Front -> Orchestrator -> Microservicios -> Crawler/Redis -> Scraped Service responde de forma consistente y el job asincrono termina en success.
- Latencia: los endpoints principales se mantienen en rangos aptos para demo academica local si el dataset actual se conserva.
- Precision: el motor de optimizacion coincide con la tienda mas economica disponible en 100.0% de los productos evaluados.
- UX: el Front ya expone un recorrido de usuario real con comparacion, filtros, lista optimizada y seguimiento del scraping en tiempo real.
- Riesgo residual: el matching semantico todavia depende de un diccionario reducido y puede requerir afinacion por categoria para ampliar cobertura academica.
