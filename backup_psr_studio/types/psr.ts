export enum SectionType {
  INTRO = 'INTRO',
  MAIN_A = 'MAIN_A',
  MAIN_B = 'MAIN_B',
  FILL_A = 'FILL_A',
  FILL_B = 'FILL_B',
  ENDING = 'ENDING'
}

export enum StyleCategory {
  URBAN = 'URBAN',
  LATIN = 'LATIN',
  JAZZ_BLUES = 'JAZZ_BLUES',
  POP_ROCK = 'POP_ROCK',
  ELECTRONIC = 'ELECTRONIC',
  WORLD_TRAD = 'WORLD_TRAD'
}

export enum ChordType {
  MAJOR = 'maj',
  MINOR = 'm',
  DOMINANT_7TH = '7',
  MINOR_7TH = 'm7',
  MAJOR_7TH = 'maj7',
  SUS4 = 'sus4',
  DIMINISHED = 'dim'
}

export enum EffectType {
  REVERB = 'REVERB',
  CHORUS = 'CHORUS',
  DSP = 'DSP'
}

export enum DisplayMode {
  NORMAL = 'NORMAL',
  STYLE_SELECT = 'STYLE_SELECT',
  VOICE_SELECT = 'VOICE_SELECT',
  MIXER = 'MIXER',
  EFFECTS = 'EFFECTS',
  REGISTRATION = 'REGISTRATION'
}

export interface ChordInfo {
  root: string;
  type: ChordType;
  bass?: string;
  notes: string[];
}

export interface DrumStep {
  kick?: boolean;
  snare?: boolean;
  hihat?: 'closed' | 'open';
  percussion?: 'clap' | 'tom' | 'rim' | 'shaker';
  accent?: boolean;
}

export interface BassStep {
  semitoneOffset?: number; // relative to root note
  octaveOffset?: number;
  duration?: string;
  velocity?: number;
}

export interface ChordStep {
  voicing?: number[]; // semitone offsets
  octave?: number;
  duration?: string;
  velocity?: number;
}

export interface StylePattern {
  measures: number;
  timeSignature: [number, number];
  drums: DrumStep[][]; // [measure][16th step]
  bass: BassStep[][];
  chords: ChordStep[][];
  pad: ChordStep[][];
  phrase?: BassStep[][];
}

export interface StyleDefinition {
  id: string;
  number: string;
  name: string;
  category: StyleCategory;
  defaultBpm: number;
  timeSignature: [number, number];
  intro: StylePattern;
  mainA: StylePattern;
  mainB: StylePattern;
  fillA: StylePattern;
  fillB: StylePattern;
  ending: StylePattern;
  suggestedVoiceId: string;
}

export interface VoiceDefinition {
  id: string;
  number: string;
  name: string;
  category: string;
  octaveShift: number;
  synthType: 'piano' | 'epiano' | 'organ' | 'guitar' | 'brass' | 'strings' | 'synthLead' | 'bass' | 'flute' | 'vibes';
  filterFreq?: number;
  resonance?: number;
  attack?: number;
  release?: number;
}

export interface MultiPadItem {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface RegistrationMemory {
  styleId: string;
  voiceId: string;
  tempo: number;
  splitPoint: number;
  accompanyEnabled: boolean;
  reverb: boolean;
  chorus: boolean;
  dsp: boolean;
  volumes: {
    master: number;
    accompaniment: number;
    voice: number;
  };
}
