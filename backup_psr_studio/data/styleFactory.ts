import { StyleDefinition, StyleCategory, StylePattern, DrumStep, BassStep, ChordStep } from '../types/psr';

export class StyleFactory {
  // Helper to generate empty 16-step grid
  private static createGrid<T>(steps: number, fill: () => T): T[] {
    return Array.from({ length: steps }, fill);
  }

  // Helper to build Drum pattern
  private static makeDrumMeasure(patternStr: {
    k?: number[]; // kick step indices (0-15)
    s?: number[]; // snare step indices (0-15)
    h?: number[]; // hi-hat closed step indices
    ho?: number[]; // hi-hat open step indices
    p?: { step: number; type: 'clap' | 'tom' | 'rim' | 'shaker' }[];
  }): DrumStep[] {
    const measure: DrumStep[] = StyleFactory.createGrid(16, () => ({}));
    patternStr.k?.forEach(i => { if (measure[i]) measure[i].kick = true; });
    patternStr.s?.forEach(i => { if (measure[i]) measure[i].snare = true; });
    patternStr.h?.forEach(i => { if (measure[i]) measure[i].hihat = 'closed'; });
    patternStr.ho?.forEach(i => { if (measure[i]) measure[i].hihat = 'open'; });
    patternStr.p?.forEach(({ step, type }) => { if (measure[step]) measure[step].percussion = type; });
    return measure;
  }

  // Helper to build Bass pattern
  private static makeBassMeasure(notes: { step: number; offset: number; dur?: string }[]): BassStep[] {
    const measure: BassStep[] = StyleFactory.createGrid(16, () => ({}));
    notes.forEach(n => {
      if (measure[n.step]) {
        measure[n.step] = { semitoneOffset: n.offset, duration: n.dur || '8n', velocity: 0.9 };
      }
    });
    return measure;
  }

  // Helper to build Chord pattern
  private static makeChordMeasure(chords: { step: number; voicing?: number[]; dur?: string }[]): ChordStep[] {
    const measure: ChordStep[] = StyleFactory.createGrid(16, () => ({}));
    chords.forEach(c => {
      if (measure[c.step]) {
        measure[c.step] = { voicing: c.voicing || [0, 4, 7], duration: c.dur || '8n', velocity: 0.8 };
      }
    });
    return measure;
  }

  // Helper to build Pad pattern
  private static makePadMeasure(pads: { step: number; voicing?: number[]; dur?: string }[]): ChordStep[] {
    const measure: ChordStep[] = StyleFactory.createGrid(16, () => ({}));
    pads.forEach(p => {
      if (measure[p.step]) {
        measure[p.step] = { voicing: p.voicing || [0, 4, 7], duration: p.dur || '1m', velocity: 0.7 };
      }
    });
    return measure;
  }

  // Generates the standard 20 styles
  public static createAllStyles(): StyleDefinition[] {
    return [
      // 01. HIP HOP (Boom Bap 90 BPM)
      StyleFactory.buildStyle(
        '001', '01', 'Hip Hop 90s', StyleCategory.URBAN, 90, '001',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [15] }),
            StyleFactory.makeDrumMeasure({ k: [0, 7, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10, 14], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 6, offset: 0, dur: '8n' }, { step: 10, offset: -2, dur: '4n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 8, offset: 3, dur: '8n' }, { step: 12, offset: 5, dur: '8n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 4, dur: '8n' }, { step: 12, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 4, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }])
          ]
        }
      ),

      // 02. TRAP (140 BPM)
      StyleFactory.buildStyle(
        '002', '02', 'Modern Trap', StyleCategory.URBAN, 140, '010',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 10], s: [8], h: [0, 2, 4, 5, 6, 8, 10, 12, 13, 14, 15], p: [{ step: 8, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 11], s: [8], h: [0, 1, 2, 3, 4, 6, 8, 10, 11, 12, 14], p: [{ step: 8, type: 'clap' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 3, 6, 10, 14], s: [8], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], p: [{ step: 8, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10, 13], s: [8], h: [0, 1, 2, 3, 4, 6, 7, 8, 10, 12, 13, 14, 15], p: [{ step: 8, type: 'clap' }] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '2n' }, { step: 10, offset: 0, dur: '4n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: -2, dur: '2n' }, { step: 11, offset: 0, dur: '4n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }])
          ]
        }
      ),

      // 03. REGGAETÓN (Dembow 95 BPM)
      StyleFactory.buildStyle(
        '003', '03', 'Reggaetón Beat', StyleCategory.LATIN, 95, '003',
        {
          drumsA: [
            // Classic Dembow: Kick on 0, 4, 8, 12. Snare on 3, 6, 11, 14!
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [3, 6, 11, 14], h: [0, 2, 4, 6, 8, 10, 12, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [3, 6, 11, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [3, 6, 11, 14], h: [0, 1, 2, 4, 6, 8, 9, 10, 12, 14], p: [{ step: 3, type: 'rim' }, { step: 11, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [3, 6, 11, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '8n' }, { step: 6, offset: 0, dur: '8n' }, { step: 8, offset: 0, dur: '8n' }, { step: 14, offset: 0, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: -2, dur: '8n' }, { step: 6, offset: -2, dur: '8n' }, { step: 8, offset: 0, dur: '8n' }, { step: 14, offset: 2, dur: '8n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 3, dur: '16n' }, { step: 6, dur: '16n' }, { step: 11, dur: '16n' }, { step: 14, dur: '16n' }]),
            StyleFactory.makeChordMeasure([{ step: 3, dur: '16n' }, { step: 6, dur: '16n' }, { step: 11, dur: '16n' }, { step: 14, dur: '16n' }])
          ]
        }
      ),

      // 04. JAZZ SWING (128 BPM)
      StyleFactory.buildStyle(
        '004', '04', 'Jazz Swing', StyleCategory.JAZZ_BLUES, 128, '005',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ h: [0, 4, 6, 8, 12, 14], ho: [6, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ h: [0, 4, 6, 8, 12, 14], ho: [6, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 10], h: [0, 4, 6, 8, 12, 14], ho: [6, 14], s: [4, 12] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6], h: [0, 4, 6, 8, 12, 14], ho: [6, 14], s: [4, 12] })
          ],
          bassA: [
            // Walking Bass (Quarter notes: 0, 4, 8, 12)
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 4, offset: 4 }, { step: 8, offset: 7 }, { step: 12, offset: 9 }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 12 }, { step: 4, offset: 9 }, { step: 8, offset: 7 }, { step: 12, offset: 4 }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, voicing: [0, 4, 7, 11], dur: '4n' }, { step: 6, voicing: [0, 4, 7, 11], dur: '8n' }, { step: 10, voicing: [0, 4, 7, 11], dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, voicing: [0, 4, 7, 11], dur: '8n' }, { step: 8, voicing: [0, 4, 7, 11], dur: '4n' }])
          ]
        }
      ),

      // 05. R&B SOUL (82 BPM)
      StyleFactory.buildStyle(
        '005', '05', 'R&B Neo Soul', StyleCategory.URBAN, 82, '003',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [15] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 3, 6, 10], s: [4, 12], h: [0, 1, 2, 4, 6, 7, 8, 10, 12, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 6, offset: 2, dur: '8n' }, { step: 10, offset: 3, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 5, dur: '4n' }, { step: 8, offset: 7, dur: '8n' }, { step: 12, offset: 0, dur: '8n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, voicing: [0, 3, 7, 10], dur: '2n' }, { step: 8, voicing: [0, 3, 7, 10], dur: '2n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, voicing: [0, 4, 7, 11], dur: '2n' }, { step: 8, voicing: [0, 4, 7, 11], dur: '2n' }])
          ]
        }
      ),

      // 06. BLUES SHUFFLE (115 BPM)
      StyleFactory.buildStyle(
        '006', '06', 'Blues Shuffle', StyleCategory.JAZZ_BLUES, 115, '005',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14] })
          ],
          bassA: [
            // Boogie bass (1 - 3 - 5 - 6 - b7 - 6 - 5 - 3)
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 4, offset: 4 }, { step: 8, offset: 7 }, { step: 12, offset: 9 }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 10 }, { step: 4, offset: 9 }, { step: 8, offset: 7 }, { step: 12, offset: 4 }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }])
          ]
        }
      ),

      // 07. CLASSIC ROCK (124 BPM)
      StyleFactory.buildStyle(
        '007', '07', 'Classic Rock', StyleCategory.POP_ROCK, 124, '008',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8, 11], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 2, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 2, offset: 0 }, { step: 4, offset: 0 }, { step: 6, offset: 0 }, { step: 8, offset: 0 }, { step: 10, offset: 0 }, { step: 12, offset: 0 }, { step: 14, offset: 0 }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 4, offset: -2 }, { step: 8, offset: -4 }, { step: 12, offset: -5 }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '8n' }, { step: 8, dur: '4n' }, { step: 12, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 6, dur: '8n' }, { step: 8, dur: '4n' }])
          ]
        }
      ),

      // 08. POP DANCE (120 BPM)
      StyleFactory.buildStyle(
        '008', '08', '80s Pop Dance', StyleCategory.POP_ROCK, 120, '001',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], ho: [2, 6, 10, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] })
          ],
          bassA: [
            // Octave Pop Bass
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 2, offset: 12 }, { step: 4, offset: 0 }, { step: 6, offset: 12 }, { step: 8, offset: 0 }, { step: 10, offset: 12 }, { step: 12, offset: 0 }, { step: 14, offset: 12 }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 2, offset: 12 }, { step: 4, offset: -2 }, { step: 6, offset: 10 }, { step: 8, offset: -4 }, { step: 10, offset: 8 }, { step: 12, offset: -5 }, { step: 14, offset: 7 }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '8n' }, { step: 3, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 12, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '8n' }, { step: 3, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }])
          ]
        }
      ),

      // 09. BOSSA NOVA (130 BPM)
      StyleFactory.buildStyle(
        '009', '09', 'Bossa Nova', StyleCategory.LATIN, 130, '007',
        {
          drumsA: [
            // Bossa clave rimshot: 0, 6, 10, 14
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 0, type: 'rim' }, { step: 6, type: 'rim' }, { step: 10, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], p: [{ step: 0, type: 'shaker' }, { step: 6, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 6, offset: 0, dur: '8n' }, { step: 8, offset: 7, dur: '4n' }, { step: 14, offset: 7, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 6, offset: 0, dur: '8n' }, { step: 8, offset: 7, dur: '4n' }, { step: 14, offset: 7, dur: '8n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '8n' }, { step: 3, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 5, dur: '8n' }, { step: 8, dur: '8n' }, { step: 12, dur: '8n' }])
          ]
        }
      ),

      // 10. FUNK GROOVE (110 BPM)
      StyleFactory.buildStyle(
        '010', '10', 'Funky Clav', StyleCategory.URBAN, 110, '009',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] }),
            StyleFactory.makeDrumMeasure({ k: [0, 7, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [3, 11] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 3, 6, 10], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '16n' }, { step: 3, offset: 0, dur: '16n' }, { step: 6, offset: 12, dur: '16n' }, { step: 10, offset: 10, dur: '16n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '16n' }, { step: 6, offset: 5, dur: '16n' }, { step: 10, offset: 7, dur: '16n' }, { step: 14, offset: 10, dur: '16n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 7, dur: '16n' }, { step: 12, dur: '16n' }, { step: 15, dur: '16n' }]),
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 7, dur: '16n' }, { step: 12, dur: '16n' }])
          ]
        }
      ),

      // 11. DISCO 70s (122 BPM)
      StyleFactory.buildStyle(
        '011', '11', '70s Disco Fever', StyleCategory.POP_ROCK, 122, '011',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], ho: [2, 6, 10, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], ho: [2, 6, 10, 14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 2, offset: 12 }, { step: 4, offset: 0 }, { step: 6, offset: 12 }, { step: 8, offset: 0 }, { step: 10, offset: 12 }, { step: 12, offset: 0 }, { step: 14, offset: 12 }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 2, offset: 12 }, { step: 4, offset: 0 }, { step: 6, offset: 12 }, { step: 8, offset: -2 }, { step: 10, offset: 10 }, { step: 12, offset: -4 }, { step: 14, offset: 8 }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }])
          ]
        }
      ),

      // 12. EDM CLUB (128 BPM)
      StyleFactory.buildStyle(
        '012', '12', 'Club EDM Pulse', StyleCategory.ELECTRONIC, 128, '017',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], ho: [2, 6, 10, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], ho: [2, 6, 10, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 2, offset: 0, dur: '16n' }, { step: 6, offset: 0, dur: '16n' }, { step: 10, offset: 0, dur: '16n' }, { step: 14, offset: 0, dur: '16n' }]),
            StyleFactory.makeBassMeasure([{ step: 2, offset: -2, dur: '16n' }, { step: 6, offset: -2, dur: '16n' }, { step: 10, offset: -4, dur: '16n' }, { step: 14, offset: -4, dur: '16n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, dur: '8n' }, { step: 6, dur: '8n' }, { step: 10, dur: '8n' }, { step: 14, dur: '8n' }])
          ]
        }
      ),

      // 13. CUMBIA LATINA (98 BPM)
      StyleFactory.buildStyle(
        '013', '13', 'Cumbia Sabrosa', StyleCategory.LATIN, 98, '019',
        {
          drumsA: [
            // Güiro raspa on 16ths, kick on 0, 8, conga/tom on 4, 12
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'tom' }, { step: 12, type: 'tom' }, { step: 2, type: 'shaker' }, { step: 6, type: 'shaker' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'tom' }, { step: 12, type: 'tom' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'tom' }, { step: 12, type: 'tom' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'tom' }, { step: 12, type: 'tom' }, { step: 14, type: 'rim' }] })
          ],
          bassA: [
            // Classic Cumbia 2/4 syncopation: 0 (long), 6 (short), 8 (long), 14 (short)
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '8n' }, { step: 6, offset: 7, dur: '16n' }, { step: 8, offset: 0, dur: '8n' }, { step: 14, offset: 7, dur: '16n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: -2, dur: '8n' }, { step: 6, offset: 5, dur: '16n' }, { step: 8, offset: 0, dur: '8n' }, { step: 14, offset: 7, dur: '16n' }])
          ],
          chordsA: [
            // Offbeat chord stabs
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 12, dur: '16n' }]),
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 12, dur: '16n' }])
          ]
        }
      ),

      // 14. SALSA BRAVA (100 BPM)
      StyleFactory.buildStyle(
        '014', '14', 'Salsa Brava', StyleCategory.LATIN, 100, '001',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 0, type: 'rim' }, { step: 6, type: 'rim' }, { step: 10, type: 'rim' }, { step: 12, type: 'tom' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 10, type: 'rim' }, { step: 14, type: 'tom' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'tom' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 10, type: 'rim' }, { step: 14, type: 'tom' }] })
          ],
          bassA: [
            // Salsa Tumbao (Offbeat anticipation on 6 and 14)
            StyleFactory.makeBassMeasure([{ step: 6, offset: 0, dur: '8n' }, { step: 14, offset: 7, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 6, offset: 7, dur: '8n' }, { step: 14, offset: 0, dur: '8n' }])
          ],
          chordsA: [
            // Montuno rhythm
            StyleFactory.makeChordMeasure([{ step: 0, dur: '16n' }, { step: 3, dur: '16n' }, { step: 6, dur: '16n' }, { step: 10, dur: '16n' }, { step: 12, dur: '16n' }]),
            StyleFactory.makeChordMeasure([{ step: 2, dur: '16n' }, { step: 5, dur: '16n' }, { step: 8, dur: '16n' }, { step: 11, dur: '16n' }, { step: 14, dur: '16n' }])
          ]
        }
      ),

      // 15. PIANO BALLAD (68 BPM)
      StyleFactory.buildStyle(
        '015', '15', 'Love Ballad', StyleCategory.POP_ROCK, 68, '001',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 10], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8, 10], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'rim' }, { step: 12, type: 'rim' }] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '2n' }, { step: 8, offset: 7, dur: '4n' }, { step: 12, offset: 0, dur: '4n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: -2, dur: '2n' }, { step: 8, offset: -4, dur: '4n' }, { step: 12, offset: -5, dur: '4n' }])
          ],
          chordsA: [
            // Arpeggiated slow ballad chords
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '4n' }, { step: 8, dur: '4n' }, { step: 12, dur: '4n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '4n' }, { step: 8, dur: '4n' }, { step: 12, dur: '4n' }])
          ]
        }
      ),

      // 16. REGGAE ONE-DROP (75 BPM)
      StyleFactory.buildStyle(
        '016', '16', 'Reggae Roots', StyleCategory.URBAN, 75, '005',
        {
          drumsA: [
            // One drop: Kick & Snare together ONLY on beat 3 (step 8)
            StyleFactory.makeDrumMeasure({ k: [8], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] }),
            StyleFactory.makeDrumMeasure({ k: [8], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [8], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14], p: [{ step: 0, type: 'rim' }] }),
            StyleFactory.makeDrumMeasure({ k: [8], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14], p: [{ step: 15, type: 'tom' }] })
          ],
          bassA: [
            // Melodic syncopated dub bassline
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '8n' }, { step: 3, offset: 0, dur: '8n' }, { step: 6, offset: 7, dur: '8n' }, { step: 10, offset: 5, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '8n' }, { step: 4, offset: 3, dur: '8n' }, { step: 8, offset: 2, dur: '8n' }, { step: 12, offset: 0, dur: '8n' }])
          ],
          chordsA: [
            // Skank guitar/organ on beats 2 and 4 (steps 4 and 12)
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 5, dur: '16n' }, { step: 12, dur: '16n' }, { step: 13, dur: '16n' }]),
            StyleFactory.makeChordMeasure([{ step: 4, dur: '16n' }, { step: 5, dur: '16n' }, { step: 12, dur: '16n' }, { step: 13, dur: '16n' }])
          ]
        }
      ),

      // 17. LO-FI CHILL (80 BPM)
      StyleFactory.buildStyle(
        '017', '17', 'Lo-Fi Chill Hop', StyleCategory.URBAN, 80, '004',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 7, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 2, type: 'shaker' }, { step: 6, type: 'shaker' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [15] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 10, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 7, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [7, 15] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 7, offset: 0, dur: '8n' }, { step: 10, offset: -2, dur: '4n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: -4, dur: '4n' }, { step: 8, offset: -5, dur: '4n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, voicing: [0, 3, 7, 10], dur: '2n' }, { step: 8, voicing: [0, 3, 7, 10], dur: '2n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, voicing: [0, 4, 7, 11], dur: '2n' }, { step: 8, voicing: [0, 4, 7, 11], dur: '2n' }])
          ]
        }
      ),

      // 18. COUNTRY TWO-STEP (108 BPM)
      StyleFactory.buildStyle(
        '018', '18', 'Country Strum', StyleCategory.WORLD_TRAD, 108, '007',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] })
          ],
          bassA: [
            // Country alternating bass: Root on beat 1, Fifth on beat 3
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 8, offset: 7, dur: '4n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 8, offset: 7, dur: '4n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 4, dur: '8n' }, { step: 6, dur: '8n' }, { step: 12, dur: '8n' }, { step: 14, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 4, dur: '8n' }, { step: 6, dur: '8n' }, { step: 12, dur: '8n' }, { step: 14, dur: '8n' }])
          ]
        }
      ),

      // 19. GOSPEL SHUFFLE (78 BPM)
      StyleFactory.buildStyle(
        '019', '19', 'Gospel Praise', StyleCategory.JAZZ_BLUES, 78, '005',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [6, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 8, 11], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          bassA: [
            StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 6, offset: 4, dur: '8n' }, { step: 8, offset: 5, dur: '4n' }, { step: 12, offset: 6, dur: '8n' }]),
            StyleFactory.makeBassMeasure([{ step: 0, offset: 7, dur: '4n' }, { step: 6, offset: 9, dur: '8n' }, { step: 8, offset: 10, dur: '4n' }, { step: 12, offset: 11, dur: '8n' }])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '8n' }, { step: 8, dur: '4n' }, { step: 12, dur: '8n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '8n' }, { step: 8, dur: '4n' }, { step: 12, dur: '8n' }])
          ]
        }
      ),

      // 20. SYNTHWAVE OUTRUN (118 BPM)
      StyleFactory.buildStyle(
        '020', '20', 'Retro Synthwave', StyleCategory.ELECTRONIC, 118, '017',
        {
          drumsA: [
            StyleFactory.makeDrumMeasure({ k: [0, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }),
            StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 14], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [14] })
          ],
          drumsB: [
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14], ho: [2, 6, 10, 14], p: [{ step: 4, type: 'clap' }, { step: 12, type: 'clap' }] }),
            StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 12], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] })
          ],
          bassA: [
            // Arpeggiated 16th rolling synth bass
            StyleFactory.makeBassMeasure([
              { step: 0, offset: 0, dur: '16n' }, { step: 2, offset: 0, dur: '16n' }, { step: 4, offset: 0, dur: '16n' }, { step: 6, offset: 0, dur: '16n' },
              { step: 8, offset: 0, dur: '16n' }, { step: 10, offset: 0, dur: '16n' }, { step: 12, offset: 0, dur: '16n' }, { step: 14, offset: 0, dur: '16n' }
            ]),
            StyleFactory.makeBassMeasure([
              { step: 0, offset: -2, dur: '16n' }, { step: 2, offset: -2, dur: '16n' }, { step: 4, offset: -2, dur: '16n' }, { step: 6, offset: -2, dur: '16n' },
              { step: 8, offset: -4, dur: '16n' }, { step: 10, offset: -4, dur: '16n' }, { step: 12, offset: -5, dur: '16n' }, { step: 14, offset: -5, dur: '16n' }
            ])
          ],
          chordsA: [
            StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }]),
            StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }])
          ]
        }
      )
    ];
  }

  // Helper to compile full StyleDefinition with Intro, Main A, Main B, Fills, Ending
  private static buildStyle(
    id: string,
    number: string,
    name: string,
    category: StyleCategory,
    defaultBpm: number,
    suggestedVoiceId: string,
    patterns: {
      drumsA: DrumStep[][];
      drumsB: DrumStep[][];
      bassA: BassStep[][];
      chordsA: ChordStep[][];
    }
  ): StyleDefinition {
    // Generate Fill A
    const fillADrums: DrumStep[][] = [
      StyleFactory.makeDrumMeasure({
        k: [0, 2, 4, 6],
        s: [4, 6, 8, 10, 12, 13, 14, 15],
        h: [0, 2],
        p: [{ step: 8, type: 'tom' }, { step: 10, type: 'tom' }, { step: 12, type: 'tom' }, { step: 14, type: 'tom' }]
      })
    ];
    const fillABass: BassStep[][] = [
      StyleFactory.makeBassMeasure([{ step: 0, offset: 0 }, { step: 4, offset: 5 }, { step: 8, offset: 7 }, { step: 12, offset: 11 }])
    ];
    const fillAChords: ChordStep[][] = [
      StyleFactory.makeChordMeasure([{ step: 0, dur: '4n' }, { step: 4, dur: '4n' }, { step: 8, dur: '4n' }, { step: 12, dur: '4n' }])
    ];

    // Generate Fill B
    const fillBDrums: DrumStep[][] = [
      StyleFactory.makeDrumMeasure({
        k: [0, 4, 8, 10, 12, 14],
        s: [4, 8, 10, 12, 13, 14, 15],
        h: [0, 2, 4, 6],
        ho: [7],
        p: [{ step: 6, type: 'tom' }, { step: 8, type: 'tom' }, { step: 10, type: 'tom' }, { step: 12, type: 'tom' }, { step: 14, type: 'tom' }]
      })
    ];

    // Intro (2 measures: measure 1 drum count + chord pad, measure 2 fill-in groove)
    const introDrums: DrumStep[][] = [
      StyleFactory.makeDrumMeasure({ h: [0, 4, 8, 12], p: [{ step: 0, type: 'rim' }, { step: 4, type: 'rim' }, { step: 8, type: 'rim' }, { step: 12, type: 'rim' }] }),
      StyleFactory.makeDrumMeasure({ k: [0, 6, 8, 10, 12], s: [8, 10, 12, 14], p: [{ step: 12, type: 'tom' }, { step: 14, type: 'tom' }] })
    ];
    const introBass: BassStep[][] = [
      StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '1m' }]),
      StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '4n' }, { step: 8, offset: 7, dur: '4n' }])
    ];
    const introChords: ChordStep[][] = [
      StyleFactory.makeChordMeasure([{ step: 0, dur: '1m' }]),
      StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }])
    ];

    // Ending (2 measures: resolving progression to final hit)
    const endingDrums: DrumStep[][] = [
      StyleFactory.makeDrumMeasure({ k: [0, 4, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] }),
      StyleFactory.makeDrumMeasure({ k: [0], s: [0], ho: [0] })
    ];
    const endingBass: BassStep[][] = [
      StyleFactory.makeBassMeasure([{ step: 0, offset: 5, dur: '2n' }, { step: 8, offset: 7, dur: '2n' }]),
      StyleFactory.makeBassMeasure([{ step: 0, offset: 0, dur: '1m' }])
    ];
    const endingChords: ChordStep[][] = [
      StyleFactory.makeChordMeasure([{ step: 0, dur: '2n' }, { step: 8, dur: '2n' }]),
      StyleFactory.makeChordMeasure([{ step: 0, dur: '1m' }])
    ];

    // Pad layers (warm sustained chords)
    const padA: ChordStep[][] = [
      StyleFactory.makePadMeasure([{ step: 0, dur: '1m' }]),
      StyleFactory.makePadMeasure([{ step: 0, dur: '1m' }])
    ];

    return {
      id,
      number,
      name,
      category,
      defaultBpm,
      timeSignature: [4, 4],
      intro: {
        measures: 2,
        timeSignature: [4, 4],
        drums: introDrums,
        bass: introBass,
        chords: introChords,
        pad: introChords
      },
      mainA: {
        measures: 2,
        timeSignature: [4, 4],
        drums: patterns.drumsA,
        bass: patterns.bassA,
        chords: patterns.chordsA,
        pad: padA
      },
      mainB: {
        measures: 2,
        timeSignature: [4, 4],
        drums: patterns.drumsB,
        bass: patterns.bassA,
        chords: patterns.chordsA,
        pad: padA
      },
      fillA: {
        measures: 1,
        timeSignature: [4, 4],
        drums: fillADrums,
        bass: fillABass,
        chords: fillAChords,
        pad: fillAChords
      },
      fillB: {
        measures: 1,
        timeSignature: [4, 4],
        drums: fillBDrums,
        bass: fillABass,
        chords: fillAChords,
        pad: fillAChords
      },
      ending: {
        measures: 2,
        timeSignature: [4, 4],
        drums: endingDrums,
        bass: endingBass,
        chords: endingChords,
        pad: endingChords
      },
      suggestedVoiceId
    };
  }
}
