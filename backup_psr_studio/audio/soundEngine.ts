import * as Tone from 'tone';
import { VoiceDefinition, ChordType } from '../types/psr';

// Note frequency map helpers
const NOTE_SEMITONES: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1,
  'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4,
  'F': 5, 'F#': 6, 'Gb': 6,
  'G': 7, 'G#': 8, 'Ab': 8,
  'A': 9, 'A#': 10, 'Bb': 10,
  'B': 11
};

export class SoundEngine {
  private static instance: SoundEngine | null = null;
  private isInitialized = false;

  // Effects
  private masterCompressor!: Tone.Compressor;
  private masterGain!: Tone.Gain;
  private accompGain!: Tone.Gain;
  private voiceGain!: Tone.Gain;
  private reverbEffect!: Tone.Reverb;
  private chorusEffect!: Tone.Chorus;
  private dspDelayEffect!: Tone.FeedbackDelay;

  // Instruments
  private kickSynth!: Tone.MembraneSynth;
  private snareNoise!: Tone.NoiseSynth;
  private snareBody!: Tone.MembraneSynth;
  private hihatSynth!: Tone.MetalSynth;
  private tomSynth!: Tone.MembraneSynth;
  private clapSynth!: Tone.NoiseSynth;
  private bassSynth!: Tone.MonoSynth;
  private chordSynth!: Tone.PolySynth;
  private padSynth!: Tone.PolySynth;
  private leadSynth!: Tone.PolySynth;
  private metronomeHigh!: Tone.MembraneSynth;
  private metronomeLow!: Tone.MembraneSynth;

  // Multi-pads
  private multiPadNoise!: Tone.NoiseSynth;
  private multiPadTone!: Tone.MembraneSynth;
  private multiPadPoly!: Tone.PolySynth;

  private constructor() {}

  public static getInstance(): SoundEngine {
    if (!SoundEngine.instance) {
      SoundEngine.instance = new SoundEngine();
    }
    return SoundEngine.instance;
  }

  public async initAudio(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      await Tone.start();

      // Master output stage with limiter
      this.masterCompressor = new Tone.Compressor({
        threshold: -12,
        ratio: 4,
        attack: 0.005,
        release: 0.1
      }).toDestination();

      this.masterGain = new Tone.Gain(0.85).connect(this.masterCompressor);

      // Effects sends
      this.reverbEffect = new Tone.Reverb({
        decay: 2.2,
        preDelay: 0.01,
        wet: 0.28
      }).connect(this.masterGain);
      await this.reverbEffect.generate();

      this.chorusEffect = new Tone.Chorus({
        frequency: 2.5,
        delayTime: 3.5,
        depth: 0.6,
        wet: 0.25
      }).connect(this.reverbEffect);
      this.chorusEffect.start();

      this.dspDelayEffect = new Tone.FeedbackDelay({
        delayTime: '8n.',
        feedback: 0.35,
        wet: 0.25
      }).connect(this.reverbEffect);

      // Sub-mix gains
      this.accompGain = new Tone.Gain(0.8).connect(this.masterGain);
      this.voiceGain = new Tone.Gain(0.9).connect(this.masterGain);

      // Drum Section
      this.kickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.4 }
      }).connect(this.accompGain);

      this.snareNoise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.16, sustain: 0 }
      }).connect(this.accompGain);

      this.snareBody = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 2,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 }
      }).connect(this.accompGain);

      this.hihatSynth = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).connect(this.accompGain);
      this.hihatSynth.volume.value = -12;

      this.tomSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.2 }
      }).connect(this.accompGain);

      this.clapSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.18, sustain: 0 }
      }).connect(this.accompGain);

      // Bass Synth
      this.bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 3, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.2 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.2, baseFrequency: 70, octaves: 3.5 }
      }).connect(this.accompGain);
      this.bassSynth.volume.value = -3;

      // Chord Synth (DX style EP)
      this.chordSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.35, sustain: 0.3, release: 0.4 }
      }).connect(this.accompGain);
      this.chordSynth.connect(this.chorusEffect);
      this.chordSynth.volume.value = -5;

      // Pad Synth
      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.35, decay: 0.6, sustain: 0.7, release: 0.8 }
      }).connect(this.reverbEffect);
      this.padSynth.volume.value = -9;

      // Lead Voice Synth
      this.leadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.008, decay: 0.4, sustain: 0.35, release: 0.5 }
      }).connect(this.voiceGain);
      this.leadSynth.connect(this.reverbEffect);

      // Metronome
      this.metronomeHigh = new Tone.MembraneSynth({
        pitchDecay: 0.005,
        octaves: 1,
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 }
      }).toDestination();
      this.metronomeHigh.volume.value = -8;

      this.metronomeLow = new Tone.MembraneSynth({
        pitchDecay: 0.005,
        octaves: 1,
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 }
      }).toDestination();
      this.metronomeLow.volume.value = -11;

      // Multi-Pads
      this.multiPadTone = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 6,
        envelope: { attack: 0.001, decay: 0.6, sustain: 0.1, release: 0.5 }
      }).connect(this.masterGain);

      this.multiPadNoise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.002, decay: 0.25, sustain: 0 }
      }).connect(this.reverbEffect);

      this.multiPadPoly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.4 }
      }).connect(this.dspDelayEffect);

      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize Tone.js Audio Engine:', e);
      return false;
    }
  }

  // Set Voice Sound Configuration
  public setVoicePreset(voice: VoiceDefinition): void {
    if (!this.leadSynth) return;

    let oscType: Tone.ToneOscillatorType = 'triangle';
    let attack = voice.attack || 0.01;
    let decay = 0.4;
    let sustain = 0.3;
    let release = voice.release || 0.4;

    switch (voice.synthType) {
      case 'piano':
        oscType = 'triangle';
        attack = 0.005;
        decay = 0.6;
        sustain = 0.2;
        release = 0.5;
        break;
      case 'epiano':
        oscType = 'sine';
        attack = 0.01;
        decay = 0.5;
        sustain = 0.4;
        release = 0.6;
        break;
      case 'organ':
        oscType = 'square';
        attack = 0.02;
        decay = 0.1;
        sustain = 0.9;
        release = 0.1;
        break;
      case 'guitar':
        oscType = 'sawtooth';
        attack = 0.005;
        decay = 0.35;
        sustain = 0.2;
        release = 0.3;
        break;
      case 'brass':
        oscType = 'sawtooth';
        attack = 0.06;
        decay = 0.3;
        sustain = 0.6;
        release = 0.25;
        break;
      case 'strings':
        oscType = 'sawtooth';
        attack = 0.25;
        decay = 0.5;
        sustain = 0.8;
        release = 0.7;
        break;
      case 'synthLead':
        oscType = 'sawtooth';
        attack = 0.01;
        decay = 0.2;
        sustain = 0.7;
        release = 0.3;
        break;
      case 'bass':
        oscType = 'triangle';
        attack = 0.01;
        decay = 0.3;
        sustain = 0.4;
        release = 0.2;
        break;
      case 'flute':
        oscType = 'sine';
        attack = 0.08;
        decay = 0.2;
        sustain = 0.8;
        release = 0.3;
        break;
      case 'vibes':
        oscType = 'sine';
        attack = 0.002;
        decay = 0.8;
        sustain = 0.1;
        release = 0.8;
        break;
    }

    this.leadSynth.set({
      oscillator: { type: oscType },
      envelope: { attack, decay, sustain, release }
    });
  }

  // Play Note from Keyboard / Solo Voice
  public triggerVoiceNote(note: string, velocity = 0.8): void {
    if (!this.isInitialized) this.initAudio();
    if (this.leadSynth) {
      this.leadSynth.triggerAttack(note, Tone.now(), velocity);
    }
  }

  public releaseVoiceNote(note: string): void {
    if (this.leadSynth) {
      this.leadSynth.triggerRelease(note, Tone.now());
    }
  }

  // Pitch Bend
  public setPitchBend(cents: number): void {
    if (this.leadSynth) {
      this.leadSynth.set({ detune: cents });
    }
  }

  // Drum Triggers
  public triggerDrumKick(time?: number): void {
    const t = time || Tone.now();
    this.kickSynth.triggerAttackRelease('C1', '8n', t, 0.95);
  }

  public triggerDrumSnare(time?: number): void {
    const t = time || Tone.now();
    this.snareNoise.triggerAttackRelease('16n', t, 0.8);
    this.snareBody.triggerAttackRelease('G1', '16n', t, 0.6);
  }

  public triggerDrumHiHat(isOpen: boolean, time?: number): void {
    const t = time || Tone.now();
    if (isOpen) {
      this.hihatSynth.envelope.decay = 0.25;
      this.hihatSynth.triggerAttackRelease('32n', t, 0.6);
    } else {
      this.hihatSynth.envelope.decay = 0.04;
      this.hihatSynth.triggerAttackRelease('32n', t, 0.5);
    }
  }

  public triggerPercussion(type: 'clap' | 'tom' | 'rim' | 'shaker', time?: number): void {
    const t = time || Tone.now();
    switch (type) {
      case 'clap':
        this.clapSynth.triggerAttackRelease('16n', t, 0.7);
        break;
      case 'tom':
        this.tomSynth.triggerAttackRelease('A1', '8n', t, 0.85);
        break;
      case 'rim':
        this.snareNoise.triggerAttackRelease('64n', t, 0.5);
        this.tomSynth.triggerAttackRelease('C3', '64n', t, 0.7);
        break;
      case 'shaker':
        this.clapSynth.triggerAttackRelease('64n', t, 0.35);
        break;
    }
  }

  // Bass Trigger
  public triggerBass(rootNote: string, semitoneOffset: number, duration: string, velocity = 0.85, time?: number): void {
    const t = time || Tone.now();
    const note = Tone.Frequency(rootNote).transpose(semitoneOffset).toNote();
    this.bassSynth.triggerAttackRelease(note, duration, t, velocity);
  }

  // Chord / Rhythm Trigger
  public triggerChord(rootNote: string, chordType: ChordType, duration: string, velocity = 0.7, time?: number): void {
    const t = time || Tone.now();
    const chordNotes = this.getChordNotes(rootNote, chordType);
    this.chordSynth.triggerAttackRelease(chordNotes, duration, t, velocity);
  }

  // Pad Trigger
  public triggerPad(rootNote: string, chordType: ChordType, duration: string, time?: number): void {
    const t = time || Tone.now();
    const padNotes = this.getChordNotes(rootNote, chordType, 4);
    this.padSynth.triggerAttackRelease(padNotes, duration, t, 0.6);
  }

  // Metronome Beep
  public triggerMetronome(isDownbeat: boolean): void {
    if (isDownbeat) {
      this.metronomeHigh.triggerAttackRelease('C5', '32n', Tone.now(), 0.9);
    } else {
      this.metronomeLow.triggerAttackRelease('G4', '32n', Tone.now(), 0.6);
    }
  }

  // Multi Pads Triggers
  public triggerMultiPad(padId: number): void {
    if (!this.isInitialized) this.initAudio();
    const now = Tone.now();

    switch (padId) {
      case 1: // Percussion Fill Roll
        this.tomSynth.triggerAttackRelease('C2', '32n', now, 0.8);
        this.tomSynth.triggerAttackRelease('E2', '32n', now + 0.08, 0.85);
        this.tomSynth.triggerAttackRelease('G2', '32n', now + 0.16, 0.9);
        this.snareNoise.triggerAttackRelease('16n', now + 0.24, 0.9);
        break;
      case 2: // 808 Sub Drop
        this.multiPadTone.triggerAttackRelease('C1', '2n', now, 1.0);
        break;
      case 3: // DJ Scratch / Shaker FX
        this.multiPadNoise.triggerAttackRelease('32n', now, 0.7);
        this.multiPadNoise.triggerAttackRelease('32n', now + 0.07, 0.9);
        this.multiPadNoise.triggerAttackRelease('16n', now + 0.14, 0.6);
        break;
      case 4: // Synth Chord Stab
        this.multiPadPoly.triggerAttackRelease(['C4', 'E4', 'G4', 'B4'], '8n', now, 0.85);
        break;
    }
  }

  // Volume & Effects Controls
  public setMasterVolume(val0to100: number): void {
    if (!this.masterGain) return;
    const gain = Math.max(0, Math.min(1, val0to100 / 100));
    this.masterGain.gain.rampTo(gain, 0.05);
  }

  public setAccompanimentVolume(val0to100: number): void {
    if (!this.accompGain) return;
    const gain = Math.max(0, Math.min(1, val0to100 / 100));
    this.accompGain.gain.rampTo(gain, 0.05);
  }

  public setVoiceVolume(val0to100: number): void {
    if (!this.voiceGain) return;
    const gain = Math.max(0, Math.min(1, val0to100 / 100));
    this.voiceGain.gain.rampTo(gain, 0.05);
  }

  public setReverbEnabled(enabled: boolean): void {
    if (this.reverbEffect) {
      this.reverbEffect.wet.rampTo(enabled ? 0.35 : 0, 0.1);
    }
  }

  public setChorusEnabled(enabled: boolean): void {
    if (this.chorusEffect) {
      this.chorusEffect.wet.rampTo(enabled ? 0.35 : 0, 0.1);
    }
  }

  public setDspEnabled(enabled: boolean): void {
    if (this.dspDelayEffect) {
      this.dspDelayEffect.wet.rampTo(enabled ? 0.3 : 0, 0.1);
    }
  }

  // Chord Note Generator
  public getChordNotes(root: string, type: ChordType, octave = 3): string[] {
    const rootBase = root.replace(/\d+/, '');
    const baseFreq = Tone.Frequency(`${rootBase}${octave}`);
    let offsets = [0, 4, 7]; // Major

    switch (type) {
      case ChordType.MINOR:
        offsets = [0, 3, 7];
        break;
      case ChordType.DOMINANT_7TH:
        offsets = [0, 4, 7, 10];
        break;
      case ChordType.MINOR_7TH:
        offsets = [0, 3, 7, 10];
        break;
      case ChordType.MAJOR_7TH:
        offsets = [0, 4, 7, 11];
        break;
      case ChordType.SUS4:
        offsets = [0, 5, 7];
        break;
      case ChordType.DIMINISHED:
        offsets = [0, 3, 6];
        break;
    }

    return offsets.map(offset => baseFreq.transpose(offset).toNote());
  }
}
