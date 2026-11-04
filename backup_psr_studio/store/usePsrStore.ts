import create from 'zustand';
import * as Tone from 'tone';
import { StyleDefinition, VoiceDefinition, SectionType, ChordType, DisplayMode, RegistrationMemory } from '../types/psr';
import { StyleFactory } from '../data/styleFactory';
import { VOICES } from '../data/voices';
import { SoundEngine } from '../audio/soundEngine';

export interface PsrState {
  // Styles & Voices
  styles: StyleDefinition[];
  selectedStyleIndex: number;
  voices: VoiceDefinition[];
  selectedVoiceIndex: number;

  // Playback & Arranger
  isPlaying: boolean;
  isSynchroStart: boolean;
  tempo: number;
  currentSection: SectionType;
  queuedSection: SectionType | null;
  currentMeasure: number;
  currentBeat: number;
  currentStep: number;

  // Chord Engine
  currentChordRoot: string;
  currentChordType: ChordType;
  accompanimentEnabled: boolean;
  splitPoint: number; // MIDI key number (e.g., 54 = F#3)

  // Keys & Pads
  activeKeys: Set<string>;
  activePads: Set<number>;
  pitchBend: number;

  // Settings & Effects
  reverbEnabled: boolean;
  chorusEnabled: boolean;
  dspEnabled: boolean;
  metronomeEnabled: boolean;
  touchSensitivity: boolean;
  sustainEnabled: boolean;

  // Volumes
  masterVolume: number;
  accompanimentVolume: number;
  voiceVolume: number;

  // Track Mutes
  trackMutes: {
    drums: boolean;
    bass: boolean;
    chords: boolean;
    pad: boolean;
  };

  // Registration Memories
  registrationBank: number;
  registrations: Record<number, RegistrationMemory | null>;

  // Display State
  displayMode: DisplayMode;
  numericBuffer: string;

  // Actions
  initAudio: () => Promise<void>;
  setStyleIndex: (index: number) => void;
  setVoiceIndex: (index: number) => void;
  setTempo: (bpm: number) => void;
  togglePlay: () => void;
  setSynchroStart: (enabled: boolean) => void;
  triggerSection: (section: SectionType) => void;
  setChord: (root: string, type: ChordType) => void;
  pressKey: (note: string, midiNumber: number) => void;
  releaseKey: (note: string, midiNumber: number) => void;
  triggerPad: (padId: number) => void;
  setPitchBend: (cents: number) => void;
  toggleAccompaniment: () => void;
  toggleReverb: () => void;
  toggleChorus: () => void;
  toggleDsp: () => void;
  toggleMetronome: () => void;
  setMasterVolume: (vol: number) => void;
  setAccompanimentVolume: (vol: number) => void;
  setVoiceVolume: (vol: number) => void;
  toggleTrackMute: (track: 'drums' | 'bass' | 'chords' | 'pad') => void;
  applyOneTouchSetting: () => void;
  storeRegistration: (slot: number) => void;
  loadRegistration: (slot: number) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  adjustDataWheel: (delta: number) => void;
  inputNumeric: (num: string) => void;
}

const allStyles = StyleFactory.createAllStyles();

let transportRepeatId: number | null = null;

export const usePsrStore = create<PsrState>((set, get) => ({
  styles: allStyles,
  selectedStyleIndex: 0,
  voices: VOICES,
  selectedVoiceIndex: 0,

  isPlaying: false,
  isSynchroStart: false,
  tempo: allStyles[0].defaultBpm,
  currentSection: SectionType.MAIN_A,
  queuedSection: null,
  currentMeasure: 1,
  currentBeat: 1,
  currentStep: 0,

  currentChordRoot: 'C',
  currentChordType: ChordType.MAJOR,
  accompanimentEnabled: true,
  splitPoint: 54, // F#3

  activeKeys: new Set<string>(),
  activePads: new Set<number>(),
  pitchBend: 0,

  reverbEnabled: true,
  chorusEnabled: false,
  dspEnabled: false,
  metronomeEnabled: false,
  touchSensitivity: true,
  sustainEnabled: false,

  masterVolume: 85,
  accompanimentVolume: 80,
  voiceVolume: 90,

  trackMutes: {
    drums: false,
    bass: false,
    chords: false,
    pad: false
  },

  registrationBank: 1,
  registrations: {},

  displayMode: DisplayMode.NORMAL,
  numericBuffer: '',

  initAudio: async () => {
    const engine = SoundEngine.getInstance();
    await engine.initAudio();
    const state = get();
    engine.setVoicePreset(state.voices[state.selectedVoiceIndex]);
    engine.setMasterVolume(state.masterVolume);
    engine.setAccompanimentVolume(state.accompanimentVolume);
    engine.setVoiceVolume(state.voiceVolume);
    engine.setReverbEnabled(state.reverbEnabled);
    engine.setChorusEnabled(state.chorusEnabled);
    engine.setDspEnabled(state.dspEnabled);
  },

  setStyleIndex: (index: number) => {
    const { styles } = get();
    const safeIdx = Math.max(0, Math.min(styles.length - 1, index));
    const style = styles[safeIdx];
    set({
      selectedStyleIndex: safeIdx,
      tempo: style.defaultBpm,
      currentMeasure: 1,
      currentBeat: 1,
      currentStep: 0
    });
    Tone.getTransport().bpm.value = style.defaultBpm;
  },

  setVoiceIndex: (index: number) => {
    const { voices } = get();
    const safeIdx = Math.max(0, Math.min(voices.length - 1, index));
    const voice = voices[safeIdx];
    set({ selectedVoiceIndex: safeIdx });
    SoundEngine.getInstance().setVoicePreset(voice);
  },

  setTempo: (bpm: number) => {
    const clamped = Math.max(40, Math.min(220, Math.round(bpm)));
    set({ tempo: clamped });
    Tone.getTransport().bpm.rampTo(clamped, 0.05);
  },

  togglePlay: () => {
    const state = get();
    if (state.isPlaying) {
      // Stop
      Tone.getTransport().stop();
      if (transportRepeatId !== null) {
        Tone.getTransport().clear(transportRepeatId);
        transportRepeatId = null;
      }
      set({
        isPlaying: false,
        isSynchroStart: false,
        currentMeasure: 1,
        currentBeat: 1,
        currentStep: 0,
        queuedSection: null
      });
    } else {
      // Start
      get().initAudio().then(() => {
        Tone.getTransport().bpm.value = state.tempo;
        Tone.getTransport().start();
        set({ isPlaying: true, isSynchroStart: false });

        let stepCount = 0;
        let measureIndex = 0;

        transportRepeatId = Tone.getTransport().scheduleRepeat((time) => {
          const s = get();
          if (!s.isPlaying) return;

          const currentStep = stepCount % 16;
          const currentBeat = Math.floor(currentStep / 4) + 1;
          const measureDisplay = Math.floor(stepCount / 16) + 1;

          // Metronome tick
          if (s.metronomeEnabled && currentStep % 4 === 0) {
            SoundEngine.getInstance().triggerMetronome(currentBeat === 1);
          }

          // Handle Section & Pattern
          const style = s.styles[s.selectedStyleIndex];
          let pattern = style.mainA;
          if (s.currentSection === SectionType.MAIN_B) pattern = style.mainB;
          else if (s.currentSection === SectionType.INTRO) pattern = style.intro;
          else if (s.currentSection === SectionType.FILL_A) pattern = style.fillA;
          else if (s.currentSection === SectionType.FILL_B) pattern = style.fillB;
          else if (s.currentSection === SectionType.ENDING) pattern = style.ending;

          const patternMeasure = measureIndex % pattern.measures;

          if (s.accompanimentEnabled) {
            const engine = SoundEngine.getInstance();
            const root = s.currentChordRoot;
            const chordType = s.currentChordType;

            // 1. Drums
            if (!s.trackMutes.drums && pattern.drums && pattern.drums[patternMeasure]) {
              const dStep = pattern.drums[patternMeasure][currentStep];
              if (dStep) {
                if (dStep.kick) engine.triggerDrumKick(time);
                if (dStep.snare) engine.triggerDrumSnare(time);
                if (dStep.hihat) engine.triggerDrumHiHat(dStep.hihat === 'open', time);
                if (dStep.percussion) engine.triggerPercussion(dStep.percussion, time);
              }
            }

            // 2. Bass
            if (!s.trackMutes.bass && pattern.bass && pattern.bass[patternMeasure]) {
              const bStep = pattern.bass[patternMeasure][currentStep];
              if (bStep && bStep.semitoneOffset !== undefined) {
                engine.triggerBass(root + '2', bStep.semitoneOffset, bStep.duration || '8n', bStep.velocity, time);
              }
            }

            // 3. Chords
            if (!s.trackMutes.chords && pattern.chords && pattern.chords[patternMeasure]) {
              const cStep = pattern.chords[patternMeasure][currentStep];
              if (cStep) {
                engine.triggerChord(root, chordType, cStep.duration || '8n', cStep.velocity, time);
              }
            }

            // 4. Pad
            if (!s.trackMutes.pad && pattern.pad && pattern.pad[patternMeasure]) {
              const pStep = pattern.pad[patternMeasure][currentStep];
              if (pStep && currentStep === 0) {
                engine.triggerPad(root, chordType, '1m', time);
              }
            }
          }

          // Advance step
          stepCount++;
          if (currentStep === 15) {
            measureIndex++;

            // Check if queued section is pending at measure boundary
            if (s.queuedSection) {
              set({
                currentSection: s.queuedSection,
                queuedSection: null
              });
              measureIndex = 0;
            } else if (s.currentSection === SectionType.INTRO && measureIndex >= pattern.measures) {
              set({ currentSection: SectionType.MAIN_A });
              measureIndex = 0;
            } else if (s.currentSection === SectionType.FILL_A && measureIndex >= pattern.measures) {
              set({ currentSection: SectionType.MAIN_A });
              measureIndex = 0;
            } else if (s.currentSection === SectionType.FILL_B && measureIndex >= pattern.measures) {
              set({ currentSection: SectionType.MAIN_B });
              measureIndex = 0;
            } else if (s.currentSection === SectionType.ENDING && measureIndex >= pattern.measures) {
              get().togglePlay();
              return;
            }
          }

          // Update UI state
          set({
            currentStep,
            currentBeat,
            currentMeasure: measureDisplay
          });
        }, '16n');
      });
    }
  },

  setSynchroStart: (enabled: boolean) => {
    set({ isSynchroStart: enabled });
  },

  triggerSection: (section: SectionType) => {
    const { isPlaying, currentSection } = get();
    if (!isPlaying) {
      set({ currentSection: section });
      return;
    }
    // If playing, queue the section change for next bar
    if (section === SectionType.FILL_A || section === SectionType.FILL_B) {
      set({ queuedSection: section });
    } else {
      set({ queuedSection: section });
    }
  },

  setChord: (root: string, type: ChordType) => {
    set({ currentChordRoot: root, currentChordType: type });
  },

  pressKey: (note: string, midiNumber: number) => {
    const state = get();
    const newKeys = new Set(state.activeKeys);
    newKeys.add(note);
    set({ activeKeys: newKeys });

    state.initAudio();

    if (midiNumber <= state.splitPoint) {
      // Chord zone (Left hand)
      const noteLetter = note.replace(/\d+/, '');
      // Determine major or minor based on root note / typical keyboard fingering
      let chordType = ChordType.MAJOR;
      if (noteLetter === 'A' || noteLetter === 'D' || noteLetter === 'E') {
        chordType = ChordType.MINOR;
      }
      set({ currentChordRoot: noteLetter, currentChordType: chordType });

      // If Synchro Start is armed, start playing immediately!
      if (state.isSynchroStart && !state.isPlaying) {
        get().togglePlay();
      }
    } else {
      // Melody voice zone (Right hand)
      SoundEngine.getInstance().triggerVoiceNote(note, 0.85);
    }
  },

  releaseKey: (note: string, midiNumber: number) => {
    const state = get();
    const newKeys = new Set(state.activeKeys);
    newKeys.delete(note);
    set({ activeKeys: newKeys });

    if (midiNumber > state.splitPoint && !state.sustainEnabled) {
      SoundEngine.getInstance().releaseVoiceNote(note);
    }
  },

  triggerPad: (padId: number) => {
    const state = get();
    const newPads = new Set(state.activePads);
    newPads.add(padId);
    set({ activePads: newPads });

    SoundEngine.getInstance().triggerMultiPad(padId);

    setTimeout(() => {
      const updated = new Set(get().activePads);
      updated.delete(padId);
      set({ activePads: updated });
    }, 200);
  },

  setPitchBend: (cents: number) => {
    set({ pitchBend: cents });
    SoundEngine.getInstance().setPitchBend(cents);
  },

  toggleAccompaniment: () => {
    set(s => ({ accompanimentEnabled: !s.accompanimentEnabled }));
  },

  toggleReverb: () => {
    const next = !get().reverbEnabled;
    set({ reverbEnabled: next });
    SoundEngine.getInstance().setReverbEnabled(next);
  },

  toggleChorus: () => {
    const next = !get().chorusEnabled;
    set({ chorusEnabled: next });
    SoundEngine.getInstance().setChorusEnabled(next);
  },

  toggleDsp: () => {
    const next = !get().dspEnabled;
    set({ dspEnabled: next });
    SoundEngine.getInstance().setDspEnabled(next);
  },

  toggleMetronome: () => {
    set(s => ({ metronomeEnabled: !s.metronomeEnabled }));
  },

  setMasterVolume: (vol: number) => {
    set({ masterVolume: vol });
    SoundEngine.getInstance().setMasterVolume(vol);
  },

  setAccompanimentVolume: (vol: number) => {
    set({ accompanimentVolume: vol });
    SoundEngine.getInstance().setAccompanimentVolume(vol);
  },

  setVoiceVolume: (vol: number) => {
    set({ voiceVolume: vol });
    SoundEngine.getInstance().setVoiceVolume(vol);
  },

  toggleTrackMute: (track: 'drums' | 'bass' | 'chords' | 'pad') => {
    set(s => ({
      trackMutes: {
        ...s.trackMutes,
        [track]: !s.trackMutes[track]
      }
    }));
  },

  applyOneTouchSetting: () => {
    const { styles, selectedStyleIndex, voices } = get();
    const style = styles[selectedStyleIndex];
    const matchingVoiceIdx = voices.findIndex(v => v.id === style.suggestedVoiceId);
    if (matchingVoiceIdx !== -1) {
      get().setVoiceIndex(matchingVoiceIdx);
    }
    get().setTempo(style.defaultBpm);
    set({ accompanimentEnabled: true, reverbEnabled: true, chorusEnabled: true });
    SoundEngine.getInstance().setReverbEnabled(true);
    SoundEngine.getInstance().setChorusEnabled(true);
  },

  storeRegistration: (slot: number) => {
    const state = get();
    const reg: RegistrationMemory = {
      styleId: state.styles[state.selectedStyleIndex].id,
      voiceId: state.voices[state.selectedVoiceIndex].id,
      tempo: state.tempo,
      splitPoint: state.splitPoint,
      accompanyEnabled: state.accompanimentEnabled,
      reverb: state.reverbEnabled,
      chorus: state.chorusEnabled,
      dsp: state.dspEnabled,
      volumes: {
        master: state.masterVolume,
        accompaniment: state.accompanimentVolume,
        voice: state.voiceVolume
      }
    };
    set(s => ({
      registrations: { ...s.registrations, [slot]: reg }
    }));
  },

  loadRegistration: (slot: number) => {
    const state = get();
    const reg = state.registrations[slot];
    if (!reg) return;

    const styleIdx = state.styles.findIndex(s => s.id === reg.styleId);
    const voiceIdx = state.voices.findIndex(v => v.id === reg.voiceId);

    if (styleIdx !== -1) get().setStyleIndex(styleIdx);
    if (voiceIdx !== -1) get().setVoiceIndex(voiceIdx);
    get().setTempo(reg.tempo);
    set({
      splitPoint: reg.splitPoint,
      accompanimentEnabled: reg.accompanyEnabled,
      reverbEnabled: reg.reverb,
      chorusEnabled: reg.chorus,
      dspEnabled: reg.dsp,
      masterVolume: reg.volumes.master,
      accompanimentVolume: reg.volumes.accompaniment,
      voiceVolume: reg.volumes.voice
    });

    SoundEngine.getInstance().setMasterVolume(reg.volumes.master);
    SoundEngine.getInstance().setAccompanimentVolume(reg.volumes.accompaniment);
    SoundEngine.getInstance().setVoiceVolume(reg.volumes.voice);
    SoundEngine.getInstance().setReverbEnabled(reg.reverb);
    SoundEngine.getInstance().setChorusEnabled(reg.chorus);
    SoundEngine.getInstance().setDspEnabled(reg.dsp);
  },

  setDisplayMode: (mode: DisplayMode) => {
    set({ displayMode: mode, numericBuffer: '' });
  },

  adjustDataWheel: (delta: number) => {
    const state = get();
    if (state.displayMode === DisplayMode.STYLE_SELECT || state.displayMode === DisplayMode.NORMAL) {
      get().setStyleIndex(state.selectedStyleIndex + delta);
    } else if (state.displayMode === DisplayMode.VOICE_SELECT) {
      get().setVoiceIndex(state.selectedVoiceIndex + delta);
    }
  },

  inputNumeric: (num: string) => {
    const state = get();
    let newBuffer = state.numericBuffer + num;
    if (newBuffer.length > 2) newBuffer = num; // reset on 3rd digit
    set({ numericBuffer: newBuffer });

    const val = parseInt(newBuffer, 10);
    if (!isNaN(val)) {
      if (state.displayMode === DisplayMode.STYLE_SELECT || state.displayMode === DisplayMode.NORMAL) {
        if (val >= 1 && val <= state.styles.length) {
          get().setStyleIndex(val - 1);
        }
      } else if (state.displayMode === DisplayMode.VOICE_SELECT) {
        if (val >= 1 && val <= state.voices.length) {
          get().setVoiceIndex(val - 1);
        }
      }
    }
  }
}));
