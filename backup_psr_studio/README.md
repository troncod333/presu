# Respaldo de Código: Generador de Música PSR Studio (Tone.js & Zustand)

Este directorio contiene el código y la arquitectura del sintetizador y teclado de acompañamientos PSR Studio antes de ser descartado del proyecto Cubicador Pro:

## Estructura de Archivos:
- `audio/soundEngine.ts`: Motor de síntesis con Tone.js (baterías, sintetizador polifónico, bajo mono, reverberación, coro y DSP).
- `store/usePsrStore.ts`: Store Zustand para reproducción de patrones rítmicos, cambio de acordes, tempo y asignación de voces.
- `data/styleFactory.ts`: Generador de 6 ritmos (Urban, Latin, Pop/Rock, Jazz, Electronic, World) con secciones Intro, Main A, Main B, Fills y Ending.
- `data/voices.ts`: Catálogo de 20 voces de instrumentos sintetizados.
- `types/psr.ts`: Definiciones TypeScript para acordes, estilos y memorias de registro.

## Dependencias requeridas si deseas recrearlo en un proyecto nuevo:
```json
"dependencies": {
  "tone": "^15.0.4",
  "zustand": "^4.5.5",
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```
