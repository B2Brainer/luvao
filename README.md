# Luvao

Plataforma web para comparar precios de supermercados, centralizar información dispersa y apoyar la toma de decisiones de compra con búsquedas, comparaciones y optimización de listas.

## 1. Introducción

El proyecto aborda la dificultad de comparar productos entre supermercados diferentes cuando la información está repartida en múltiples sitios web. La solución centraliza datos de precios, disponibilidad y origen del producto en una sola plataforma.

## 2. Problema

La pregunta central es cómo construir una plataforma web que, apoyada en scraping y microservicios, permita comparar precios de supermercados en Barranquilla y optimizar listas de compra de forma automática.

## 3. Objetivos

El objetivo general es diseñar e implementar una aplicación para comparar precios de productos en supermercados y facilitar decisiones de compra más informadas.

Entre los objetivos específicos están recolectar datos desde múltiples fuentes, integrarlos en una estructura común, permitir búsquedas y comparaciones, y validar el comportamiento del sistema.

## 4. Arquitectura lógica

La solución se organiza en un frontend, un orquestador y varios servicios de dominio. El frontend recibe las solicitudes del usuario, el orquestador coordina las consultas, y los servicios gestionan productos, tiendas, usuarios y datos scrapeados.

El crawler obtiene información desde supermercados externos, la normaliza y la envía al servicio de datos scrapeados para su almacenamiento y consulta posterior.

## 5. Arquitectura física

La plataforma se despliega en contenedores independientes. Incluye una base de datos por servicio, un servicio de colas para ejecutar trabajos de scraping y un worker separado para procesar esas tareas de forma asíncrona.

El usuario accede desde el navegador, el frontend consume el orquestador y este distribuye las peticiones al resto de servicios.

## 6. Prototipo

El prototipo permite iniciar sesión, registrar usuarios, buscar productos, comparar precios entre supermercados y optimizar listas de compra. También incluye una vista de estadísticas para analizar cobertura, costo y distribución del gasto.

## 7. Recolección de datos

El módulo de scraping consulta supermercados como Éxito, Olímpica, D1 y Carulla. El crawler se apoya en peticiones HTTP asincrónicas, Selenium cuando es necesario, y una cola de trabajos para actualizar catálogos sin bloquear el flujo principal del sistema.

## 8. Base de datos e integración

Cada servicio mantiene su propia persistencia relacional. El sistema maneja entidades como usuarios, productos, tiendas y productos scrapeados, con un proceso de normalización que asocia los datos extraídos con la lista canónica de productos.

## 9. Interfaz de usuario

La interfaz se divide en un módulo operativo para búsqueda, comparación y optimización, y un módulo analítico para estadísticas y escenarios de consumo. El contexto de optimización se reutiliza para mantener coherencia entre ambas vistas.

## 10. Resultados

El sistema permitió validar la extracción automática de datos, su almacenamiento estructurado y la generación de recomendaciones de compra. En las pruebas reportadas, la estrategia óptima distribuyó compras entre varias tiendas para reducir el costo total y mejorar la cobertura.

## 11. Conclusiones

La plataforma demuestra que es viable integrar scraping, procesamiento de datos y microservicios para construir una herramienta útil de comparación de precios. Como trabajo futuro, se pueden ampliar los supermercados integrados y mejorar la homologación de productos.
