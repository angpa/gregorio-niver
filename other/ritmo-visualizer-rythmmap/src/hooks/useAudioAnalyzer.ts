/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

export interface AudioData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  volume: number;
  isBeat: boolean;
  bpm: number;
  beatHistory: number[]; // Array of timestamps
}

export function useAudioAnalyzer() {
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [beatHistory, setBeatHistory] = useState<number[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const timeArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Internal state
  const sessionStartTimeRef = useRef<number>(0);
  const beatHistoryRef = useRef<number[]>([]);
  const lastBeatTimeRef = useRef<number>(0);
  const beatCooldownRef = useRef<number>(200); // ms
  const volumeThresholdRef = useRef<number>(0.15);
  const peakHistoryRef = useRef<number[]>([]);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      timeArrayRef.current = new Uint8Array(bufferLength);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    sessionStartTimeRef.current = performance.now();
    beatHistoryRef.current = [];
    setBeatHistory([]);
  };

  const startMicrophone = async () => {
    setIsLoading(true);
    initAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sourceRef.current) sourceRef.current.disconnect();
      
      const source = audioContextRef.current!.createMediaStreamSource(stream);
      source.connect(analyzerRef.current!);
      sourceRef.current = source;
      setIsPlaying(true);
      setIsLoading(false);
      analyze();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setIsLoading(false);
    }
  };

  const startFile = (file: File) => {
    stop(); // Stop any current playback
    setIsLoading(true);
    initAudio();
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        
        if (sourceRef.current) sourceRef.current.disconnect();
        
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyzerRef.current!);
        analyzerRef.current!.connect(audioContextRef.current!.destination);
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
        setIsLoading(false);
        analyze();
      } catch (err) {
        console.error('Error decoding audio file:', err);
        setIsPlaying(false);
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const analyze = () => {
    if (!analyzerRef.current || !dataArrayRef.current || !timeArrayRef.current) return;

    analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
    analyzerRef.current.getByteTimeDomainData(timeArrayRef.current);

    // Calculate volume
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
    }
    const volume = sum / (dataArrayRef.current.length * 255);

    // Basic Beat Detection (Peak spotting in low frequencies)
    // We look at the first few bins (bass frequencies)
    const bassBins = dataArrayRef.current.slice(0, 10);
    const bassAvg = bassBins.reduce((a, b) => a + b, 0) / bassBins.length / 255;
    
    let isBeat = false;
    const now = performance.now();
    if (bassAvg > volumeThresholdRef.current && now - lastBeatTimeRef.current > beatCooldownRef.current) {
      isBeat = true;
      lastBeatTimeRef.current = now;
      
      const relativeTime = (now - sessionStartTimeRef.current) / 1000;
      beatHistoryRef.current.push(relativeTime);
      setBeatHistory([...beatHistoryRef.current]);

      // Basic BPM estimation
      if (peakHistoryRef.current.length > 0) {
          const diff = now - peakHistoryRef.current[peakHistoryRef.current.length - 1];
          if (diff > 300 && diff < 1500) { // realistic BPM range 40-200
              // we don't do complex BPM here, just a rough hint
          }
      }
      peakHistoryRef.current.push(now);
      if (peakHistoryRef.current.length > 10) peakHistoryRef.current.shift();
    }

    setAudioData({
      frequencyData: new Uint8Array(dataArrayRef.current),
      timeData: new Uint8Array(timeArrayRef.current),
      volume,
      isBeat,
      bpm: 0, // Placeholder
      beatHistory: beatHistoryRef.current,
    });

    animationFrameRef.current = requestAnimationFrame(analyze);
  };

  const stop = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (sourceRef.current) {
        if ('stop' in sourceRef.current) (sourceRef.current as AudioBufferSourceNode).stop();
        sourceRef.current.disconnect();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { audioData, isPlaying, isLoading, beatHistory, startMicrophone, startFile, stop };
}
