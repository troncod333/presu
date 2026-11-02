# Rediseño Cromático Conceptual: Base Sobria, Ítems de Construcción y Alertas Reflectarias

Plan integral para reformar la identidad visual y sistema de colores de la aplicación, descartando los degradados genéricos actuales (púrpura/rosa/índigo) e implementando un sistema cromático estructurado por concepto funcional: **base sobria arquitectónica** (presentación y fondos), **colores llamativos de obra** (naranja de construcción y azul cobalto para partidas e ítems interactivos), y **colores reflectarios de faena** (amarillo/lima flúor de alta visibilidad para elementos críticos, normas SEC y alertas presupuestarias).

***

## Decisiones Críticas y Revisión del Usuario

> [!IMPORTANT]
> Se consolidan las preferencias confirmadas por el usuario en la fase de clarificación:
> - **Base Sobria de Presentación**: Grafito arquitectónico, pizarra técnica (`#0F141C`, `#1A202C`, `#242B35`) y aceros estructurados con líneas de cota tenues para descartar los fondos lavados e inconsistentes.
> - **Ítems Interactivos y Partidas**: Familia cromática de **Naranja de Construcción** (`#EA580C` / `#F97316`) y **Azul Cobalto Vivo** (`#1D4ED8` / `#2563EB`), combinados con identificadores temáticos sobrios por especialidad de obra.
> - **Ítems de Alta Atención**: **Amarillo/Lima Flúor Reflectivo de Seguridad** (`#CCFF00`, `#EAB308`, resplandor `rgba(204,255,0,0.3)`) con bordes de alta visibilidad aplicados a partidas críticas, normativas SEC, sobrecostos y advertencias estructurales.

- **Decisión Confirmada 1 (Paleta de Ítems)**: Naranja de construcción vial y azul cobalto vivo como acentos primarios en botones, selectores de partidas, sliders y checkboxes.
- **Decisión Confirmada 2 (Reflectarios de Seguridad)**: Estilo chaleco de faena / reflectante vial (`safety-fluor`) para advertencias normativas, materiales que representen más del 25% del presupuesto y alertas de riesgo.
- **Decisión Confirmada 3 (Eliminación de Slop Visual)**: Supresión total de degradados violeta/fucsia, píldoras decorativas duplicadas y luces de estado pulsantes ficticias.

***

## 1. Visión General y Concepto

### Lo que Ofrece la Reforma
La aplicación pasará de parecer una plantilla genérica con colores saturados aleatorios a un **software técnico de ingeniería y presupuestos de construcción chilena**, con una jerarquía visual precisa y profesional inspirada en planos CAD/BIM y estándares de faena física:

1. **60% Base Sobria (Presentación y Lienzo)**: Superficies en grafito mate, gris asfalto y pizarra técnica que descansan la vista, proporcionan contraste óptico superior (WCAG AA) y realzan el plano interactivo y las cotas de medición.
2. **30% Estructura e Ítems Interactivos (Naranja de Obra y Azul Cobalto)**: Componentes activos, partidas seleccionadas, botones de cubicación, selectores de proveedores (Sodimac, Easy, Construmart) y herramientas del plano.
3. **10% Capa Reflectaria de Alta Atención (Lima/Amarillo Flúor)**: Marcadores de riesgo eléctrico (SEC), materiales con impacto superior al 25% del total, alertas de sobrecosto y normas estructurales (NCh).

### Audiencia Objetivo
Arquitectos, constructores civiles, maestros de obra, contratistas y propietarios en Chile que requieren estimaciones rigurosas, legibles en terreno (incluso bajo luz solar directa o en pantalla oscura) sin distracciones visuales.

***

## 2. Experiencia de Usuario y Diseño Visual

### Sistema de Tokens Cromáticos (Tailwind CSS)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SISTEMA CROMÁTICO CONCEPTUAL                           │
├────────────────────────────────┬────────────────────────────────────────────┤
│ CONCEPTO                       │ COLORES / TOKENS                           │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 1. Base Sobria de Presentación │ - Fondo Principal: slate-950 (#0B0F17)     │
│    (60% del espacio visual)    │ - Tarjetas/Superficies: slate-900 (#131B26)│
│                                │ - Bordes Técnicos: slate-800/700 (#1E293B) │
│                                │ - Texto Principal: slate-100 (#F1F5F9)     │
│                                │ - Texto Técnico/Cotas: slate-400 (#94A3B8) │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. Ítems Interactivos          │ - Primario Obra: Naranja Vial (#EA580C)    │
│    (30% del espacio visual)    │ - Secundario Obra: Azul Cobalto (#2563EB)  │
│                                │ - Partidas Activas: Ring cobalto + acento  │
│                                │ - Controles de Plano: Azul técnico         │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. Ítems Reflectarios          │ - Alerta Flúor: Lima Reflectante (#CCFF00) │
│    (10% de Alta Atención)      │ - Aviso Normativo: Ámbar Vial (#FACC15)    │
│                                │ - Borde Reflectivo: border-[#CCFF00]/80    │
│                                │ - Resplandor de Faena: glow reflectivo     │
└────────────────────────────────┴────────────────────────────────────────────┘
```

### Jerarquía Tipográfica y Disciplina "Zero-Pill"
- **Fuentes**: Tipografía sans-serif nítida y geométrica con compensación óptica, combinada con números monoespaciados tabulares (`font-mono tabular-nums`) para todos los precios en pesos chilenos ($ CLP), metros cuadrados ($m^2$), cantidades y porcentajes.
- **Supresión de Cápsulas/Pills**: Reemplazo de etiquetas tipo píldora estática por texto sobrio con separadores tipográficos (`·`, `/`).
- **Encabezado (Top Bar Contract)**: 
  - Zona 1: Título de marca limpio en una sola línea (`PSR Studio · Cubicador Pro Chile`).
  - Zona 2: Enlaces funcionales sin fondos de botón (`Cubicación`, `Insumos`, `Comparador`, `Mapa`).
  - Zona 3: Botones de acción directos (Alternar Modo Oscuro, Guardar Presupuesto).

### Comportamiento de los Elementos Reflectarios
- **Insumos Críticos de Alto Costo**: Los ítems cuyo costo total represente una proporción dominante ($\ge 25\%$) del presupuesto recibirán una viñeta reflectante de alta visibilidad (`[!] ALTO IMPACTO PRESUPUESTARIO`) con borde perimetral reflectivo.
- **Alertas de Normativa SEC y Seguridad**: Los consejos técnicos que exigen certificación SEC (cables libres de halógeno, disyuntores diferenciales, ventilación de gas) contarán con marco reflectario lima/ámbar que garantiza lectura obligatoria antes de comprar insumos.
- **Indicador de Sobrecosto / Desvío**: Si se cambia la calidad a "Premium" o la superficie sobrepasa los umbrales seguros, se activa una cinta reflectaria con advertencia de tolerancia.

***

## 3. Decisiones Técnicas y de Producto

### Decisión 1: Reemplazo Integral de Estilos y Clases en Componentes
- **Enfoque**: Modificar directamente los esquemas de color en `Navbar.tsx`, `ProjectCategorySelector.tsx`, `FloorPlanCanvas.tsx`, `InteractiveBlueprint.tsx`, `MaterialsList.tsx`, `BudgetSummaryPanel.tsx`, `PriceComparisonMatrix.tsx` y `LocationAndMapPanel.tsx`.
- **Por qué**: Garantiza que el 100% de la interfaz responda a la nueva tricotomía cromática (sobrio / llamativo / reflectario) sin dejar rastros de los antiguos morados o azules desvaídos.

### Decisión 2: Utilidades CSS para Efecto Reflectario de Obra
- **Enfoque**: Definir en `src/index.css` clases utilitarias personalizadas para reflectividad (`.border-reflective`, `.badge-reflective`, `.glow-reflective`) utilizando combinaciones de colores flúor certificados (`#CCFF00`, `#FACC15`) con sombras de bajo radio y alto contraste.
- **Por qué**: Permite reutilizar la semántica reflectante de manera consistente y accesible en tablas, tarjetas y el plano interactivo.

### Decisión 3: Limpieza de Clases Huérfanas de Sintetizador
- **Enfoque**: Depurar las clases `.lcd-screen`, `.psr-chassis`, `.psr-recess` que quedaron en `index.css` de versiones previas.
- **Por qué**: Mantener una hoja de estilos ligera, profesional y dedicada exclusivamente a la arquitectura y construcción.

***

## 4. Arquitectura de Componentes y Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DE COLOR Y VISTAS                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     ┌───────────────────────┐                     ┌─────────────────────┐
     │ BASE SOBRIA: LIENZO   │                     │ TOP BAR CONTRACT    │
     │ - Fondo Grafito #0B0F │                     │ - Marca Sobria      │
     │ - Grilla Técnica CAD  │                     │ - Acciones Limpias  │
     └──────────┬────────────┘                     └─────────────────────┘
                │
                ├─────────────────────────────────────────────┐
                ▼                                             ▼
     ┌───────────────────────┐                     ┌─────────────────────┐
     │ ÍTEMS LLAMATIVOS      │                     │ ÍTEMS REFLECTARIOS  │
     │ - Selector Partidas   │                     │ - Alertas SEC       │
     │   (Naranja/Cobalto)   │                     │ - Materiales Crítico│
     │ - Botones de Acción   │                     │   (>25% Presupuesto)│
     │ - Checkboxes Insumos  │                     │ - Cinta de Obra     │
     │ - Cotas en Plano      │                     │   (#CCFF00 Fluor)   │
     └───────────────────────┘                     └─────────────────────┘
```

### Mapeo de Componentes a Refactorizar

1. **`src/index.css`**:
   - Limpieza de código legado (`psr-chassis`, `lcd-screen`).
   - Inyección de tokens de color: variables de grafito arquitectónico, naranja obra, azul cobalto y utilidades reflectarias flúor.
2. **`src/components/Navbar.tsx`**:
   - Retiro de degradados violeta/rosa y píldoras decorativas.
   - Presentación sobria con tipografía unificada y acento sutil en naranja de obra.
3. **`src/components/ProjectCategorySelector.tsx`**:
   - Tarjetas de especialidad con base neutra de grafito/acero.
   - Selección activa con borde y resalte en naranja de construcción y azul cobalto.
4. **`src/components/MaterialsList.tsx`**:
   - Tabla técnica limpia con cifras tabulares.
   - Checkboxes e interactivos en azul cobalto y naranja.
   - Distintivo reflectario flúor para materiales críticos o de alto impacto.
5. **`src/components/BudgetSummaryPanel.tsx`**:
   - Resumen financiero con visualización de sobriedad ejecutiva.
   - Desglose con alertas reflectantes cuando una partida supere límites estándar.
6. **`src/components/InteractiveBlueprint.tsx`**:
   - Plano de planta con estética de mesa de arquitectura (grafito oscuro y cotas nítidas).
   - Elementos interactivos en naranja y cobalto, con marcas de peligro o tomas eléctricas en amarillo reflectario.
7. **`src/components/AIAssistantPanel.tsx`**:
   - Panel de consejos técnicos con sección de normativas SEC resaltada en marco reflectario de seguridad.

***

## 5. Verificación y Pruebas Previas al Despliegue

1. **Validación de Compilación y Tipos**: Ejecución de `lint_applet` (`tsc --noEmit`) y `compile_applet` para confirmar cero errores de compilación.
2. **Contraste y Accesibilidad (WCAG AA)**: Verificación de legibilidad entre el fondo grafito (#0B0F17) y textos claros (#F1F5F9), así como los acentos reflectarios sobre fondos oscuros.
3. **Prueba en Caliente del Dev Server**: Verificación de carga en navegador sin errores de CSS ni transformaciones rotas.
