import type { AudioSettings, AudioEventSettings } from '../types/machine';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private fileCache: Map<string, AudioBuffer> = new Map();

  // Lazy init so we don't block on load or require interaction immediately
  private getContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
    }
    return this.ctx;
  }

  public async loadAudioFile(url: string): Promise<void> {
    if (this.fileCache.has(url)) return;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.fileCache.set(url, audioBuffer);
    } catch (e) {
      console.error('Failed to load audio file:', url, e);
    }
  }

  public playEvent(eventSets: AudioEventSettings, globalSettings: AudioSettings) {
    if (!eventSets.enabled || globalSettings.masterVolume === 0) return;
    
    const volume = eventSets.volume * globalSettings.masterVolume;

    if (eventSets.type === 'file' && eventSets.fileUrl) {
      this.playBuffer(eventSets.fileUrl, volume);
    } else {
      this.playSynthPreset(eventSets.synthPreset || 'mechanical', volume);
    }
  }

  private playBuffer(url: string, volume: number) {
    const buffer = this.fileCache.get(url);
    if (!buffer) return;

    const ctx = this.getContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  }

  private playSynthPreset(preset: string, volume: number) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;
    
    // Smooth attack and release to prevent clicking
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.02);

    switch (preset) {
      case 'mechanical':
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      
      case 'click':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
        break;

      case 'coin':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, t); // B5
        osc.frequency.setValueAtTime(1318.51, t + 0.1); // E6
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;

      case 'fanfare':
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t); // A4
        osc.frequency.setValueAtTime(554.37, t + 0.15); // C#5
        osc.frequency.setValueAtTime(659.25, t + 0.3); // E5
        osc.frequency.setValueAtTime(880, t + 0.45); // A5
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
        osc.start(t);
        osc.stop(t + 1.0);
        break;

      default:
        // simple beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
    }
  }

  public updateBackgroundMusic(settings: AudioSettings) {
    if (settings.bgmEnabled && settings.bgmFileUrl && settings.masterVolume > 0) {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(settings.bgmFileUrl);
        this.bgmAudio.loop = true;
      } else if (this.bgmAudio.src !== settings.bgmFileUrl) {
        this.bgmAudio.src = settings.bgmFileUrl;
      }
      this.bgmAudio.volume = settings.bgmVolume * settings.masterVolume;
      // Audio might be blocked by browser policy until interaction
      this.bgmAudio.play().catch(e => console.log('BGM Play blocked by browser:', e));
    } else {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
    }
  }
}

export const audioEngine = new AudioEngine();
