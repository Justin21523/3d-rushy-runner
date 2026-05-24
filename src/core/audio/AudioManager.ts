// src/core/audio/AudioManager.ts

import { Howl } from 'howler';

export class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;

  constructor() {
    // Preload some placeholder sounds (beep-based procedural in reality, but we'll use simple sine wave Howl)
    // In a real implementation, you'd create procedural audio using AudioContext, but for simplicity we'll use mock Howl with silent src
    this.sounds.set('ring', new Howl({ src: ['silence.mp3'] }));
    this.sounds.set('jump', new Howl({ src: ['silence.mp3'] }));
    this.sounds.set('dash', new Howl({ src: ['silence.mp3'] }));
    this.sounds.set('hit', new Howl({ src: ['silence.mp3'] }));
    this.sounds.set('death', new Howl({ src: ['silence.mp3'] }));
    this.sounds.set('respawn', new Howl({ src: ['silence.mp3'] }));
  }

  play(sound: string, volume = 1) {
    const s = this.sounds.get(sound);
    if (s) {
      s.volume(volume);
      s.play();
      this.playTone(sound);
    }
  }
  
  private playTone(sound: string) {
    // 簡單模擬，實際應用中可調用真實音檔
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.1;
    switch (sound) {
      case 'jump': osc.frequency.value = 300; osc.type = 'sine'; break;
      case 'dash': osc.frequency.value = 500; osc.type = 'sawtooth'; break;
      case 'hit': osc.frequency.value = 200; osc.type = 'square'; break;
      case 'death': osc.frequency.value = 150; osc.type = 'sawtooth'; break;
      case 'respawn': osc.frequency.value = 400; osc.type = 'sine'; break;
      default: osc.frequency.value = 440;
    }
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playMusic(src: string) {
    if (this.music) this.music.stop();
    this.music = new Howl({ src: [src], loop: true, volume: 0.5 });
    this.music.play();
  }

  stopMusic() {
    this.music?.stop();
  }
}