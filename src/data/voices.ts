import { VoiceDefinition } from '../types/psr';

export const VOICES: VoiceDefinition[] = [
  { id: '001', number: '001', name: 'Grand Piano', category: 'Piano', octaveShift: 0, synthType: 'piano' },
  { id: '002', number: '002', name: 'Bright Piano', category: 'Piano', octaveShift: 0, synthType: 'piano', filterFreq: 6000 },
  { id: '003', number: '003', name: 'DX E.Piano', category: 'E.Piano', octaveShift: 0, synthType: 'epiano' },
  { id: '004', number: '004', name: 'Suitcase EP', category: 'E.Piano', octaveShift: 0, synthType: 'epiano', release: 0.5 },
  { id: '005', number: '005', name: 'Jazz Organ', category: 'Organ', octaveShift: 0, synthType: 'organ' },
  { id: '006', number: '006', name: 'Church Organ', category: 'Organ', octaveShift: 0, synthType: 'organ', attack: 0.1 },
  { id: '007', number: '007', name: 'Nylon Guitar', category: 'Guitar', octaveShift: 0, synthType: 'guitar' },
  { id: '008', number: '008', name: 'Distortion Gtr', category: 'Guitar', octaveShift: 0, synthType: 'guitar', filterFreq: 3000 },
  { id: '009', number: '009', name: 'Slap Bass', category: 'Bass', octaveShift: -1, synthType: 'bass' },
  { id: '010', number: '010', name: 'Synth Bass 303', category: 'Bass', octaveShift: -1, synthType: 'bass', resonance: 8 },
  { id: '011', number: '011', name: 'String Ensemble', category: 'Strings', octaveShift: 0, synthType: 'strings', attack: 0.25, release: 0.8 },
  { id: '012', number: '012', name: 'Synth Strings', category: 'Strings', octaveShift: 0, synthType: 'strings', attack: 0.3, release: 0.6 },
  { id: '013', number: '013', name: 'Brass Section', category: 'Brass', octaveShift: 0, synthType: 'brass', attack: 0.08 },
  { id: '014', number: '014', name: 'Synth Brass 80s', category: 'Brass', octaveShift: 0, synthType: 'brass', attack: 0.05, filterFreq: 4000 },
  { id: '015', number: '015', name: 'Sweet Flute', category: 'Woodwind', octaveShift: 1, synthType: 'flute' },
  { id: '016', number: '016', name: 'Vibraphone', category: 'Mallet', octaveShift: 0, synthType: 'vibes' },
  { id: '017', number: '017', name: 'Sawtooth Lead', category: 'Synth', octaveShift: 0, synthType: 'synthLead' },
  { id: '018', number: '018', name: 'Square Lead', category: 'Synth', octaveShift: 0, synthType: 'synthLead', filterFreq: 3500 },
  { id: '019', number: '019', name: 'Musette Accordion', category: 'Organ', octaveShift: 0, synthType: 'organ', attack: 0.06 },
  { id: '020', number: '020', name: 'Chiff Lead', category: 'Synth', octaveShift: 0, synthType: 'synthLead', attack: 0.02 }
];
