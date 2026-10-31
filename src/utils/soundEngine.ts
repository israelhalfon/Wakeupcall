// Web Audio API Synthesizer for Captain Morning (קפטן בוקר)

export type MelodyId = 'space_fanfare' | 'jungle_marimba' | 'superhero_rise' | 'sun_chimes';

export interface MelodyOption {
  id: MelodyId;
  name: string;
  subtitle: string;
  tempoLabel: string;
}

export const MELODIES: MelodyOption[] = [
  {
    id: 'space_fanfare',
    name: 'תרועת שיגור לחלל',
    subtitle: 'מנגינת סינתיסייזר קצבית ומלאת אנרגיה להמראה מהירה מהמיטה',
    tempoLabel: 'קצבי · 128 BPM',
  },
  {
    id: 'jungle_marimba',
    name: 'מרימבה בג׳ונגל השמש',
    subtitle: 'צלילי הקשה טרופיים שמחים שעושים חשק לרקוד על הבוקר',
    tempoLabel: 'שמח · 118 BPM',
  },
  {
    id: 'superhero_rise',
    name: 'המנון גיבורי הבוקר',
    subtitle: 'מנגינת ניצחון מתגברת שמעירה אלופים עם חיוך גדול',
    tempoLabel: 'הרואי · 132 BPM',
  },
  {
    id: 'sun_chimes',
    name: 'פעמוני קרני שמש',
    subtitle: 'צלילים הרמוניים עדינים שמתחזקים בהדרגה להתעוררות נעימה',
    tempoLabel: 'נעים · 105 BPM',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private loopTimer: number | null = null;
  private isPlayingAlarm = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'triangle',
    peakGain = 0.18
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playMelodySequence(melodyId: MelodyId) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (melodyId === 'space_fanfare') {
      // C5, E5, G5, C6 upbeat arpeggio
      const notes = [
        { f: 523.25, t: 0, d: 0.16 },
        { f: 659.25, t: 0.18, d: 0.16 },
        { f: 783.99, t: 0.36, d: 0.16 },
        { f: 1046.5, t: 0.54, d: 0.35 },
        { f: 783.99, t: 0.92, d: 0.16 },
        { f: 1046.5, t: 1.1, d: 0.45 },
      ];
      notes.forEach((n) => this.playNote(n.f, now + n.t, n.d, 'triangle', 0.2));
    } else if (melodyId === 'jungle_marimba') {
      // Pentatonic bouncy pattern
      const notes = [
        { f: 440, t: 0, d: 0.14 },
        { f: 554.37, t: 0.16, d: 0.14 },
        { f: 659.25, t: 0.32, d: 0.14 },
        { f: 880, t: 0.48, d: 0.22 },
        { f: 659.25, t: 0.72, d: 0.14 },
        { f: 880, t: 0.88, d: 0.28 },
        { f: 987.77, t: 1.18, d: 0.3 },
      ];
      notes.forEach((n) => this.playNote(n.f, now + n.t, n.d, 'sine', 0.24));
    } else if (melodyId === 'superhero_rise') {
      // Heroic fourths and fifths
      const notes = [
        { f: 392.0, t: 0, d: 0.2 },
        { f: 587.33, t: 0.22, d: 0.35 },
        { f: 523.25, t: 0.6, d: 0.15 },
        { f: 659.25, t: 0.78, d: 0.15 },
        { f: 783.99, t: 0.96, d: 0.5 },
      ];
      notes.forEach((n) => this.playNote(n.f, now + n.t, n.d, 'sawtooth', 0.12));
    } else {
      // Gentle sun chimes
      const notes = [
        { f: 587.33, t: 0, d: 0.4 },
        { f: 739.99, t: 0.25, d: 0.4 },
        { f: 880.0, t: 0.5, d: 0.45 },
        { f: 1174.66, t: 0.75, d: 0.6 },
      ];
      notes.forEach((n) => this.playNote(n.f, now + n.t, n.d, 'sine', 0.18));
    }
  }

  public startAlarmLoop(melodyId: MelodyId) {
    this.stopAlarmLoop();
    this.isPlayingAlarm = true;
    this.playMelodySequence(melodyId);
    this.loopTimer = window.setInterval(() => {
      if (this.isPlayingAlarm) {
        this.playMelodySequence(melodyId);
      }
    }, 2000);
  }

  public stopAlarmLoop() {
    this.isPlayingAlarm = false;
    if (this.loopTimer !== null) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public playStarCollect() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.playNote(880, now, 0.1, 'triangle', 0.2);
    this.playNote(1318.51, now + 0.08, 0.22, 'triangle', 0.22);
  }

  public playSuccessFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((freq, idx) => {
      this.playNote(freq, now + idx * 0.09, 0.35, 'triangle', 0.2);
    });
  }

  public playStepClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.playNote(660, ctx.currentTime, 0.08, 'sine', 0.15);
  }

  public speakHebrewGreeting(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 1.02;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors on browsers without Hebrew TTS
    }
  }
}

export const soundEngine = new SoundEngine();
