import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import {
  Play,
  Square,
  Volume2,
  Sliders,
  Sparkles,
  Music,
  Radio,
  Layers,
  RotateCcw,
  Zap,
  Info,
  ChevronLeft,
  ChevronRight,
  Disc,
  Power
} from 'lucide-react';
import { usePsrStore } from './store/usePsrStore';
import { SectionType, ChordType, DisplayMode } from './types/psr';

// Generate 61 piano keys from C2 (MIDI 36) to C7 (MIDI 96)
interface KeyData {
  note: string;
  midi: number;
  isBlack: boolean;
  name: string;
}

const GENERATE_KEYS = (): KeyData[] => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keys: KeyData[] = [];
  for (let midi = 36; midi <= 96; midi++) {
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    const noteName = noteNames[noteIndex];
    const isBlack = noteName.includes('#');
    keys.push({
      note: `${noteName}${octave}`,
      midi,
      isBlack,
      name: noteName
    });
  }
  return keys;
};

const ALL_KEYS = GENERATE_KEYS();

const QUICK_CHORDS: { name: string; root: string; type: ChordType }[] = [
  { name: 'C', root: 'C', type: ChordType.MAJOR },
  { name: 'G', root: 'G', type: ChordType.MAJOR },
  { name: 'Am', root: 'A', type: ChordType.MINOR },
  { name: 'F', root: 'F', type: ChordType.MAJOR },
  { name: 'Dm', root: 'D', type: ChordType.MINOR },
  { name: 'Em', root: 'E', type: ChordType.MINOR },
  { name: 'G7', root: 'G', type: ChordType.DOMINANT_7TH },
  { name: 'C7', root: 'C', type: ChordType.DOMINANT_7TH },
  { name: 'Fmaj7', root: 'F', type: ChordType.MAJOR_7TH },
  { name: 'Bb', root: 'Bb', type: ChordType.MAJOR },
  { name: 'A7', root: 'A', type: ChordType.DOMINANT_7TH },
  { name: 'D7', root: 'D', type: ChordType.DOMINANT_7TH }
];

export function App() {
  const {
    styles,
    selectedStyleIndex,
    voices,
    selectedVoiceIndex,
    isPlaying,
    isSynchroStart,
    tempo,
    currentSection,
    queuedSection,
    currentMeasure,
    currentBeat,
    currentStep,
    currentChordRoot,
    currentChordType,
    accompanimentEnabled,
    splitPoint,
    activeKeys,
    activePads,
    reverbEnabled,
    chorusEnabled,
    dspEnabled,
    metronomeEnabled,
    masterVolume,
    accompanimentVolume,
    voiceVolume,
    trackMutes,
    registrationBank,
    registrations,
    displayMode,
    setStyleIndex,
    setVoiceIndex,
    setTempo,
    togglePlay,
    setSynchroStart,
    triggerSection,
    setChord,
    pressKey,
    releaseKey,
    triggerPad,
    setPitchBend,
    toggleAccompaniment,
    toggleReverb,
    toggleChorus,
    toggleDsp,
    toggleMetronome,
    setMasterVolume,
    setAccompanimentVolume,
    setVoiceVolume,
    toggleTrackMute,
    applyOneTouchSetting,
    storeRegistration,
    loadRegistration,
    setDisplayMode,
    adjustDataWheel,
    inputNumeric
  } = usePsrStore();

  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [isDraggingWheel, setIsDraggingWheel] = useState<boolean>(false);
  const lastYRef = useRef<number>(0);
  const [storeArmed, setStoreArmed] = useState<boolean>(false);

  const currentStyle = styles[selectedStyleIndex] || styles[0];
  const currentVoice = voices[selectedVoiceIndex] || voices[0];

  // Data wheel drag handler
  const handleWheelMouseDown = (e: React.MouseEvent) => {
    setIsDraggingWheel(true);
    lastYRef.current = e.clientY;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingWheel) return;
      const deltaY = lastYRef.current - e.clientY;
      if (Math.abs(deltaY) > 8) {
        const direction = deltaY > 0 ? 1 : -1;
        adjustDataWheel(direction);
        setWheelAngle(prev => (prev + direction * 25) % 360);
        lastYRef.current = e.clientY;
      }
    };

    const handleMouseUp = () => {
      setIsDraggingWheel(false);
    };

    if (isDraggingWheel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingWheel, adjustDataWheel]);

  // Computer keyboard listener for notes and shortcuts
  useEffect(() => {
    const keyMap: Record<string, string> = {
      // Right hand melody
      'y': 'C4', '7': 'C#4', 'u': 'D4', '8': 'D#4', 'i': 'E4', 'o': 'F4', '0': 'F#4', 'p': 'G4',
      // Left hand chord keys
      'a': 'C3', 'w': 'C#3', 's': 'D3', 'e': 'D#3', 'd': 'E3', 'f': 'F3', 't': 'F#3', 'g': 'G3'
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
        return;
      }
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        const keyItem = ALL_KEYS.find(k => k.note === note);
        if (keyItem) pressKey(note, keyItem.midi);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        const keyItem = ALL_KEYS.find(k => k.note === note);
        if (keyItem) releaseKey(note, keyItem.midi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressKey, releaseKey, togglePlay]);

  return (
    <div className="min-h-screen bg-[#11141a] text-slate-200 flex flex-col items-center p-2 sm:p-4 select-none font-sans overflow-x-hidden">
      {/* Top Banner / Title */}
      <header className="w-full max-w-7xl flex flex-wrap items-center justify-between py-2 px-3 mb-2 bg-[#191d26] rounded-t-xl border border-slate-700/60 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded border border-slate-700">
            <span className="font-extrabold tracking-widest text-lg text-slate-100 font-display">YAMAHA</span>
            <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 font-mono font-bold rounded">PORTATONE</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-wider text-slate-300 font-display">PSR-620</span>
          <span className="hidden md:inline-block text-xs uppercase tracking-widest text-slate-400 font-medium border-l border-slate-700 pl-3">
            Interactive Workstation Arranger
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPoweredOn(!isPoweredOn)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all shadow ${
              isPoweredOn ? 'bg-red-950/80 text-red-400 border border-red-700/80' : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>POWER</span>
            <span className={`led ${isPoweredOn ? 'led-red-on' : 'led-red-off'} ml-1`} />
          </button>
        </div>
      </header>

      {/* Main Synthesizer Chassis */}
      <main className={`w-full max-w-7xl psr-chassis rounded-xl p-3 sm:p-5 flex flex-col gap-4 transition-opacity duration-300 ${isPoweredOn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        
        {/* Upper Console: Left Controls, Central LCD, Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT SECTION (Col 1-3): Arranger & Section Transport */}
          <div className="lg:col-span-3 flex flex-col gap-3 psr-recess p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">Auto Accompaniment</span>
              <button
                onClick={toggleAccompaniment}
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase transition ${
                  accompanimentEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                ACCOMP: {accompanimentEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Master Volume & Accompaniment Sliders */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2 rounded border border-slate-800">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>MASTER</span>
                  <span>{masterVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume}
                  onChange={(e) => setMasterVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                  <span>ACCOMP</span>
                  <span>{accompanimentVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={accompanimentVolume}
                  onChange={(e) => setAccompanimentVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Tempo Controls & Metronome */}
            <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-mono text-slate-400">TEMPO</span>
                <span className="px-2 py-0.5 bg-black/60 rounded text-amber-400 font-mono font-bold text-sm">
                  {tempo}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setTempo(tempo - 2)}
                  className="panel-btn px-2.5 py-1 text-xs font-bold text-slate-300"
                >
                  -
                </button>
                <button
                  onClick={() => setTempo(tempo + 2)}
                  className="panel-btn px-2.5 py-1 text-xs font-bold text-slate-300"
                >
                  +
                </button>
                <button
                  onClick={toggleMetronome}
                  className={`panel-btn px-2 py-1 text-[11px] font-bold flex items-center gap-1 ${
                    metronomeEnabled ? 'panel-btn-orange text-white' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${metronomeEnabled ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  METRO
                </button>
              </div>
            </div>

            {/* Section Buttons (Intro, Main A, Main B, Fill In, Ending) */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Style Sections</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => triggerSection(SectionType.INTRO)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.INTRO ? 'panel-btn-active text-amber-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.INTRO ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  INTRO
                </button>

                <button
                  onClick={() => triggerSection(SectionType.MAIN_A)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.MAIN_A ? 'panel-btn-active text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.MAIN_A ? 'led-green-on' : 'led-green-off'}`} />
                  MAIN A
                </button>

                <button
                  onClick={() => triggerSection(SectionType.MAIN_B)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.MAIN_B ? 'panel-btn-active text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.MAIN_B ? 'led-green-on' : 'led-green-off'}`} />
                  MAIN B
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => triggerSection(SectionType.FILL_A)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.FILL_A || queuedSection === SectionType.FILL_A ? 'panel-btn-active text-amber-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.FILL_A ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  FILL TO A
                </button>

                <button
                  onClick={() => triggerSection(SectionType.FILL_B)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.FILL_B || queuedSection === SectionType.FILL_B ? 'panel-btn-active text-amber-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.FILL_B ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  FILL TO B
                </button>

                <button
                  onClick={() => triggerSection(SectionType.ENDING)}
                  className={`panel-btn p-2 text-[11px] font-bold flex flex-col items-center justify-center gap-1 ${
                    currentSection === SectionType.ENDING ? 'panel-btn-active text-red-400' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${currentSection === SectionType.ENDING ? 'led-red-on' : 'led-red-off'}`} />
                  ENDING
                </button>
              </div>
            </div>

            {/* Synchro Start & Main START/STOP Button */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setSynchroStart(!isSynchroStart)}
                className={`panel-btn py-2.5 px-2 text-xs font-bold flex items-center justify-center gap-1.5 ${
                  isSynchroStart ? 'panel-btn-orange text-white' : 'text-slate-300'
                }`}
              >
                <span className={`led ${isSynchroStart ? 'led-yellow-on' : 'led-yellow-off'}`} />
                SYNC START
              </button>

              <button
                onClick={togglePlay}
                className={`panel-btn py-2.5 px-3 text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isPlaying ? 'panel-btn-orange text-white border-orange-500' : 'panel-btn-teal text-white border-teal-500'
                }`}
              >
                {isPlaying ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'STOP' : 'START'}</span>
              </button>
            </div>
          </div>

          {/* CENTER SECTION (Col 4-8): Yamaha PSR-620 Retro LCD Display */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="p-2 sm:p-3 bg-[#13161c] rounded-lg border-2 border-[#363f52] shadow-2xl flex flex-col">
              
              {/* LCD Frame Header */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2 py-0.5 mb-1.5 border-b border-slate-800">
                <span className="font-bold tracking-widest text-slate-300">MULTI-FUNCTION LCD DISPLAY</span>
                <div className="flex items-center gap-3">
                  <span className={reverbEnabled ? 'text-amber-400 font-bold' : 'text-slate-600'}>REV</span>
                  <span className={chorusEnabled ? 'text-emerald-400 font-bold' : 'text-slate-600'}>CHO</span>
                  <span className={dspEnabled ? 'text-cyan-400 font-bold' : 'text-slate-600'}>DSP</span>
                  <span className={accompanimentEnabled ? 'text-amber-400 font-bold' : 'text-slate-600'}>ACCOMP</span>
                </div>
              </div>

              {/* LCD Display Screen (Green Matrix Phosphor) */}
              <div className="lcd-screen lcd-glass p-3 sm:p-4 rounded border-2 border-[#4b5936] flex flex-col justify-between min-h-[220px]">
                
                {/* LCD Top Row: Style & Voice info */}
                <div className="grid grid-cols-2 gap-2 border-b border-[#2b3a1a]/40 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] tracking-wider uppercase opacity-75">STYLE</span>
                    <span className="text-base sm:text-lg font-extrabold tracking-wide truncate">
                      {currentStyle.number} {currentStyle.name}
                    </span>
                    <span className="text-[10px] opacity-70">Category: {currentStyle.category}</span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] tracking-wider uppercase opacity-75">VOICE (R1)</span>
                    <span className="text-base sm:text-lg font-extrabold tracking-wide truncate">
                      {currentVoice.number} {currentVoice.name}
                    </span>
                    <span className="text-[10px] opacity-70">Voice Cat: {currentVoice.category}</span>
                  </div>
                </div>

                {/* LCD Middle: Beats, Tempo, Chord & Measure */}
                <div className="grid grid-cols-4 gap-2 py-2 text-center items-center border-b border-[#2b3a1a]/40">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-75">CHORD</span>
                    <span className="text-xl sm:text-2xl font-black font-mono">
                      {currentChordRoot}{currentChordType === ChordType.MAJOR ? '' : currentChordType}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-75">TEMPO</span>
                    <span className="text-lg sm:text-xl font-bold font-mono">
                      {tempo} <span className="text-xs">BPM</span>
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-75">SECTION</span>
                    <span className="text-xs sm:text-sm font-extrabold font-mono px-1 py-0.5 bg-[#2b3a1a]/30 rounded">
                      {currentSection}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase opacity-75">MEASURE / BEAT</span>
                    <div className="flex items-center justify-center gap-1 font-mono font-bold text-base sm:text-lg">
                      <span>{currentMeasure}</span>
                      <span className="opacity-60">:</span>
                      <span className="text-lg font-black">{currentBeat}</span>
                    </div>
                  </div>
                </div>

                {/* Beat Metronome Visual Dots (1 2 3 4) */}
                <div className="flex items-center justify-between py-1 px-2 bg-[#2b3a1a]/20 rounded my-1 text-[11px] font-mono">
                  <span className="font-bold opacity-80">BEAT:</span>
                  <div className="flex items-center gap-4">
                    {[1, 2, 3, 4].map((b) => (
                      <div key={b} className="flex items-center gap-1">
                        <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          currentBeat === b && isPlaying
                            ? 'bg-[#1a2510] text-[#8ea862]'
                            : 'border border-[#1a2510]/60 text-[#1a2510]/60'
                        }`}>
                          {b}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] opacity-75">4/4 TIME</span>
                </div>

                {/* LCD Bottom Row: Track Mixer Indicators & Mutes */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  {(['drums', 'bass', 'chords', 'pad'] as const).map((track) => {
                    const isMuted = trackMutes[track];
                    return (
                      <button
                        key={track}
                        onClick={() => toggleTrackMute(track)}
                        className={`flex flex-col items-center p-1 rounded transition border ${
                          isMuted ? 'border-[#1a2510]/30 opacity-40 bg-black/10' : 'border-[#1a2510]/60 bg-[#2b3a1a]/20'
                        }`}
                      >
                        <span className="text-[9px] font-extrabold uppercase">{track}</span>
                        <div className="flex items-end gap-0.5 h-4 my-0.5">
                          <span className={`w-1 rounded-t ${!isMuted && isPlaying ? 'bg-[#1a2510] h-3' : 'bg-[#1a2510]/40 h-1'}`} />
                          <span className={`w-1 rounded-t ${!isMuted && isPlaying ? 'bg-[#1a2510] h-4' : 'bg-[#1a2510]/40 h-1'}`} />
                          <span className={`w-1 rounded-t ${!isMuted && isPlaying ? 'bg-[#1a2510] h-2.5' : 'bg-[#1a2510]/40 h-1'}`} />
                        </div>
                        <span className="text-[8px] font-bold">{isMuted ? 'MUTE' : 'ON'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Selectors Below LCD */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                <button
                  onClick={() => setDisplayMode(DisplayMode.STYLE_SELECT)}
                  className={`panel-btn py-1 px-2 text-xs font-bold ${
                    displayMode === DisplayMode.STYLE_SELECT ? 'panel-btn-orange text-white' : 'text-slate-300'
                  }`}
                >
                  STYLE SELECT
                </button>
                <button
                  onClick={() => setDisplayMode(DisplayMode.VOICE_SELECT)}
                  className={`panel-btn py-1 px-2 text-xs font-bold ${
                    displayMode === DisplayMode.VOICE_SELECT ? 'panel-btn-teal text-white' : 'text-slate-300'
                  }`}
                >
                  VOICE SELECT
                </button>
                <button
                  onClick={applyOneTouchSetting}
                  className="panel-btn py-1 px-2 text-xs font-bold text-amber-300 flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  OTS (ONE TOUCH)
                </button>
                <button
                  onClick={() => {
                    const next = (selectedStyleIndex + 1) % styles.length;
                    setStyleIndex(next);
                  }}
                  className="panel-btn py-1 px-2 text-xs font-bold text-slate-300"
                >
                  NEXT STYLE &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (Col 9-12): Data Wheel, Keypad & Registration Memory */}
          <div className="lg:col-span-3 flex flex-col gap-3 psr-recess p-3 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-bold tracking-wider text-slate-400 uppercase font-mono">Data Entry & Memory</span>
              <span className="text-[10px] text-slate-500 font-mono">PSR CONTROL</span>
            </div>

            {/* Rotary Data Wheel */}
            <div className="flex items-center justify-around bg-slate-900/60 p-2 rounded border border-slate-800">
              <button
                onClick={() => adjustDataWheel(-1)}
                className="panel-btn w-9 h-9 flex items-center justify-center text-sm font-black text-slate-300"
              >
                &minus;
              </button>

              <div
                className="w-16 h-16 data-wheel relative flex items-center justify-center cursor-pointer shadow-xl"
                onMouseDown={handleWheelMouseDown}
                style={{ transform: `rotate(${wheelAngle}deg)` }}
                title="Arrastra o usa los botones +/- para cambiar valor"
              >
                <div className="data-wheel-divot" />
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/60" />
              </div>

              <button
                onClick={() => adjustDataWheel(1)}
                className="panel-btn w-9 h-9 flex items-center justify-center text-sm font-black text-slate-300"
              >
                +
              </button>
            </div>

            {/* Numeric Keypad (0-9) */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900/60 p-2 rounded border border-slate-800">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => inputNumeric(digit)}
                  className={`panel-btn py-1.5 text-xs font-bold text-slate-200 ${digit === '0' ? 'col-span-3' : ''}`}
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Digital Effects (Reverb, Chorus, DSP) */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Digital Effects</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={toggleReverb}
                  className={`panel-btn py-1.5 px-1 text-[11px] font-bold flex flex-col items-center gap-1 ${
                    reverbEnabled ? 'panel-btn-orange text-white' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${reverbEnabled ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  REVERB
                </button>

                <button
                  onClick={toggleChorus}
                  className={`panel-btn py-1.5 px-1 text-[11px] font-bold flex flex-col items-center gap-1 ${
                    chorusEnabled ? 'panel-btn-orange text-white' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${chorusEnabled ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  CHORUS
                </button>

                <button
                  onClick={toggleDsp}
                  className={`panel-btn py-1.5 px-1 text-[11px] font-bold flex flex-col items-center gap-1 ${
                    dspEnabled ? 'panel-btn-orange text-white' : 'text-slate-300'
                  }`}
                >
                  <span className={`led ${dspEnabled ? 'led-yellow-on' : 'led-yellow-off'}`} />
                  DSP DELAY
                </button>
              </div>
            </div>

            {/* Registration Memory (4 Banks + Store) */}
            <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded border border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>REGISTRATION MEMORY</span>
                <button
                  onClick={() => setStoreArmed(!storeArmed)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    storeArmed ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {storeArmed ? 'ARMED' : 'MEM STORE'}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((slot) => {
                  const hasData = !!registrations[slot];
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        if (storeArmed) {
                          storeRegistration(slot);
                          setStoreArmed(false);
                        } else {
                          loadRegistration(slot);
                        }
                      }}
                      className={`panel-btn py-2 text-xs font-bold flex flex-col items-center gap-1 ${
                        hasData ? 'border-amber-500/60 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      <span className={`led ${hasData ? 'led-green-on' : 'led-green-off'}`} />
                      M{slot}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Lower Row: Pitch Bend Wheel, Multi Pads & Quick Chords Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          
          {/* Pitch Bend Wheel */}
          <div className="md:col-span-2 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Pitch Bend</span>
            <div className="relative w-12 h-20 pitch-wheel rounded-md border border-slate-700 flex items-center justify-center cursor-ns-resize">
              <div className="w-10 h-3 bg-slate-400 rounded-sm shadow-md" />
              <input
                type="range"
                min="-200"
                max="200"
                defaultValue="0"
                className="absolute inset-0 opacity-0 cursor-ns-resize"
                onChange={(e) => setPitchBend(Number(e.target.value))}
                onMouseUp={() => setPitchBend(0)}
                onTouchEnd={() => setPitchBend(0)}
              />
            </div>
            <span className="text-[9px] text-slate-500 font-mono">BEND &plusmn;2</span>
          </div>

          {/* Multi Pads (4 Rubber Trigger Pads) */}
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Multi Pads (Phrase / Percussion)</span>
              <span className="text-[9px] text-emerald-400 font-mono">4 REALTIME PADS</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 1, label: 'PAD 1', desc: 'TOM ROLL' },
                { id: 2, label: 'PAD 2', desc: '808 BOOM' },
                { id: 3, label: 'PAD 3', desc: 'SCRATCH' },
                { id: 4, label: 'PAD 4', desc: 'SYNTH STAB' }
              ].map((pad) => {
                const isActive = activePads.has(pad.id);
                return (
                  <button
                    key={pad.id}
                    onMouseDown={() => triggerPad(pad.id)}
                    className={`multi-pad p-2 flex flex-col items-center justify-center gap-1 ${
                      isActive ? 'active border-amber-400' : ''
                    }`}
                  >
                    <span className={`led ${isActive ? 'led-red-on' : 'led-red-off'}`} />
                    <span className="text-[11px] font-black text-slate-200">{pad.label}</span>
                    <span className="text-[8px] text-slate-400 font-mono">{pad.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Chord Selector Bar for Accompaniment */}
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">Instant Chord Palette</span>
              <span className="text-[9px] text-slate-400 font-mono">AUTO ARRANGER DRIVER</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {QUICK_CHORDS.map((qc) => {
                const isSelected = currentChordRoot === qc.root && currentChordType === qc.type;
                return (
                  <button
                    key={qc.name}
                    onClick={() => {
                      setChord(qc.root, qc.type);
                      if (isSynchroStart && !isPlaying) togglePlay();
                    }}
                    className={`panel-btn py-1.5 text-xs font-bold rounded ${
                      isSelected ? 'panel-btn-orange text-white' : 'text-slate-300'
                    }`}
                  >
                    {qc.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 61-Key Virtual Piano Keyboard */}
        <div className="flex flex-col gap-1.5 bg-[#171a22] p-3 rounded-lg border border-slate-800 shadow-2xl overflow-x-auto">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-2 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="font-bold text-amber-400">CHORD ZONE (C2 - F#3)</span>
              <span className="text-[11px] text-slate-500">Toca para cambiar acordes de acompañamiento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span className="font-bold text-cyan-400">MELODY SOLO ZONE (G3 - C7)</span>
              <span className="text-[11px] text-slate-500">Toca para tocar la voz seleccionada ({currentVoice.name})</span>
            </div>
          </div>

          {/* Interactive Keyboard Canvas */}
          <div className="relative h-44 sm:h-52 w-full min-w-[800px] flex select-none bg-slate-900/80 rounded-b p-1">
            {ALL_KEYS.filter(k => !k.isBlack).map((whiteKey) => {
              const isChordZone = whiteKey.midi <= splitPoint;
              const isPressed = activeKeys.has(whiteKey.note);
              return (
                <div
                  key={whiteKey.note}
                  onMouseDown={() => pressKey(whiteKey.note, whiteKey.midi)}
                  onMouseUp={() => releaseKey(whiteKey.note, whiteKey.midi)}
                  onMouseEnter={(e) => { if (e.buttons === 1) pressKey(whiteKey.note, whiteKey.midi); }}
                  onMouseLeave={() => releaseKey(whiteKey.note, whiteKey.midi)}
                  onTouchStart={() => pressKey(whiteKey.note, whiteKey.midi)}
                  onTouchEnd={() => releaseKey(whiteKey.note, whiteKey.midi)}
                  className={`piano-key-white flex-1 h-full cursor-pointer flex flex-col justify-end items-center pb-2 ${
                    isPressed ? 'active' : ''
                  }`}
                  style={{
                    backgroundColor: isPressed
                      ? (isChordZone ? '#fef3c7' : '#cffafe')
                      : (isChordZone ? '#fcfaf2' : '#ffffff')
                  }}
                >
                  <span className={`text-[9px] font-bold font-mono ${isChordZone ? 'text-amber-800' : 'text-slate-600'}`}>
                    {whiteKey.note}
                  </span>
                  {whiteKey.midi === splitPoint && (
                    <span className="text-[8px] bg-red-600 text-white font-bold px-1 rounded absolute top-2">
                      SPLIT
                    </span>
                  )}
                </div>
              );
            })}

            {/* Black Keys overlaid absolute */}
            {ALL_KEYS.map((key) => {
              if (!key.isBlack) return null;
              // Calculate relative horizontal position based on neighboring white key index
              const whiteKeysBefore = ALL_KEYS.slice(0, ALL_KEYS.findIndex(k => k.midi === key.midi)).filter(k => !k.isBlack).length;
              const totalWhiteKeys = ALL_KEYS.filter(k => !k.isBlack).length;
              const leftPercent = ((whiteKeysBefore - 0.3) / totalWhiteKeys) * 100;
              const widthPercent = (0.6 / totalWhiteKeys) * 100;
              const isChordZone = key.midi <= splitPoint;
              const isPressed = activeKeys.has(key.note);

              return (
                <div
                  key={key.note}
                  onMouseDown={() => pressKey(key.note, key.midi)}
                  onMouseUp={() => releaseKey(key.note, key.midi)}
                  onMouseEnter={(e) => { if (e.buttons === 1) pressKey(key.note, key.midi); }}
                  onMouseLeave={() => releaseKey(key.note, key.midi)}
                  onTouchStart={() => pressKey(key.note, key.midi)}
                  onTouchEnd={() => releaseKey(key.note, key.midi)}
                  className={`piano-key-black absolute top-1 h-[60%] cursor-pointer flex flex-col justify-end items-center pb-1 ${
                    isPressed ? 'active' : ''
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    backgroundColor: isPressed ? (isChordZone ? '#78350f' : '#0891b2') : '#1e1e1e'
                  }}
                >
                  <span className="text-[7px] text-slate-400 font-mono">{key.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keyboard Shortcut Info Footer */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono px-2 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <span>TECLADO PC: <b>Espacio</b> = Start/Stop</span>
            <span className="hidden sm:inline">| Acordes: <b>A, S, D, F, G</b></span>
            <span className="hidden sm:inline">| Melodía: <b>Y, U, I, O, P</b></span>
          </div>
          <div className="flex items-center gap-2">
            <span>20 RITMOS ESTILO YAMAHA PSR-620</span>
            <span className="text-emerald-400 font-bold">&bull; TONE.JS AUDIO HI-FI</span>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
