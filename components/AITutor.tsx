
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Language, User } from '../types';

interface Props {
  user: User;
  language: Language;
  context: string;
  onClose: () => void;
}

const AITutor: React.FC<Props> = ({ user, language, context, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // PCM Decoding Logic
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, message.serverContent!.outputTranscription!.text]);
            }
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsSpeaking(true);
              const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => console.error("Live API Error:", e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are a supportive academic tutor on darewast. Language: ${language}. Current context: ${context}. Keep responses brief and encouraging. User is ${user.name}, age ${user.age}.`,
          outputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[80vh]">
        <div className="p-8 bg-gradient-to-r from-dare-teal to-dare-purple text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${isSpeaking ? 'bg-white text-dare-teal scale-110' : 'bg-white/20'}`}>
              {isSpeaking ? '🎙️' : '🧠'}
            </div>
            <div>
              <h3 className="font-black text-xl leading-none mb-1">Live Tutor</h3>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Gemini 2.5 Flash Native Audio</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
          {!isActive && !isConnecting && (
            <div className="text-center space-y-6 py-10">
              <div className="w-24 h-24 bg-dare-teal/10 text-dare-teal mx-auto rounded-full flex items-center justify-center text-5xl">🎧</div>
              <div>
                <h4 className="text-2xl font-black mb-2 dark:text-white">Ready for a session?</h4>
                <p className="text-gray-500 max-w-xs mx-auto">Vocalize your questions. I can explain complex steps or help with pronunciation.</p>
              </div>
              <button 
                onClick={startSession}
                className="px-10 py-5 bg-dare-teal text-white rounded-[2rem] font-black text-xl shadow-xl shadow-dare-teal/20 hover:scale-105 active:scale-95 transition-all"
              >
                Connect Voice
              </button>
            </div>
          )}

          {isConnecting && (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="w-16 h-16 border-4 border-dare-purple border-t-transparent rounded-full animate-spin"></div>
              <p className="font-black text-dare-purple uppercase tracking-widest">Waking up the Brain...</p>
            </div>
          )}

          {isActive && (
            <div className="space-y-4">
              <div className="flex justify-center mb-10">
                <div className="flex gap-1 items-center h-12">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div 
                      key={i} 
                      className={`w-2 bg-dare-teal rounded-full transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'h-2 opacity-30'}`}
                      style={{ height: isSpeaking ? `${30 + Math.random() * 70}%` : '8px', animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {transcript.map((text, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 animate-fadeIn">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <div className="p-6 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
            <button 
              onClick={() => { sessionRef.current?.close(); setIsActive(false); }}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-red-600 transition-all"
            >
              End Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutor;
