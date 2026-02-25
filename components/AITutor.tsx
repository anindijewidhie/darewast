
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Language, User } from '../types';
import { translations } from '../translations';

interface Props {
  user: User;
  language: Language;
  context: string;
  onClose: () => void;
}

const AITutor: React.FC<Props> = ({ user, language, context, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const t = (key: string) => translations[language]?.[key] || translations['English'][key] || key;

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
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

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
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
    const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextRef.current = outputCtx;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-4), message.serverContent!.outputTranscription!.text]);
            }
            if (message.serverContent?.modelTurn) {
               const textPart = message.serverContent.modelTurn.parts.find(p => p.text);
               if (textPart?.text) {
                 setTranscript(prev => [...prev.slice(-4), textPart.text!]);
               }
            }
            const base64Audio = message.serverContent?.modelTurn?.parts.find(p => p.inlineData)?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              setIsSpeaking(true);
              const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) source.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live API Error:", e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are darewast AITutor. Subject: ${context}. Language: ${language}. User: ${user.name}. 
          ${user.accessibility?.iddSupport ? 'IDD SUPPORT ACTIVE: Use literal language, speak clearly at 0.8x speed, use highly incremental steps.' : 'Be encouraging and clear.'}`,
          outputAudioTranscription: {},
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const handleSendText = () => {
    if (!textInput.trim() || !sessionPromiseRef.current) return;
    const text = textInput;
    setTextInput('');
    setTranscript(prev => [...prev.slice(-4), `You: ${text}`]);
    sessionPromiseRef.current.then(session => {
      // Sending text as a turn in the live session
      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
      });
    });
  };

  useEffect(() => {
    return () => { audioContextRef.current?.close(); };
  }, []);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col h-[80vh]">
        <div className="p-10 bg-gradient-to-br from-dare-teal via-dare-purple to-dare-gold text-white flex justify-between items-center relative">
          <div className="absolute inset-0 bg-white/5 opacity-10 pattern-grid-lg"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl transition-all duration-500 ${isSpeaking ? 'bg-white text-dare-teal scale-110 shadow-dare-teal/50' : 'bg-white/20'}`}>
              {isSpeaking ? '🎙️' : '🧠'}
            </div>
            <div>
              <h3 className="font-black text-2xl tracking-tighter mb-1">darewast Live Tutor</h3>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`}></div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80">{isActive ? 'Universal Link Active' : 'Disconnected'}</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition-all relative z-10 text-2xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {!isActive && !isConnecting ? (
            <div className="text-center space-y-10 py-12 animate-fadeIn">
              <div className="w-32 h-32 bg-dare-teal/10 text-dare-teal mx-auto rounded-[3rem] flex items-center justify-center text-6xl shadow-inner animate-float">📚</div>
              <div className="max-w-xs mx-auto">
                <h4 className="text-3xl font-black mb-4 dark:text-white tracking-tight">Vocal Mastery Link</h4>
                <p className="text-gray-500 font-medium leading-relaxed">Real-time guidance node for adaptive understanding. Optimized for all learning requirements.</p>
              </div>
              <button onClick={startSession} className="px-14 py-7 bg-dare-teal text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-dare-teal/30 hover:scale-105 active:scale-95 transition-all">Initialize Mastery Link</button>
            </div>
          ) : isConnecting ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-fadeIn">
              <div className="relative"><div className="w-24 h-24 border-[8px] border-dare-purple/20 border-t-dare-purple rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center text-3xl">📡</div></div>
              <p className="font-black text-dare-purple uppercase tracking-[0.5em] text-[10px] animate-pulse">Detecting Academic Nodes...</p>
            </div>
          ) : (
            <div className="space-y-10 animate-fadeIn">
              <div className="flex justify-center h-24 items-center gap-2">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                  <div key={i} className={`w-1.5 bg-dare-teal rounded-full transition-all duration-300 ${isSpeaking ? 'animate-bounce' : 'h-2 opacity-20'}`} style={{ height: isSpeaking ? `${40 + Math.random() * 60}%` : '10px', animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
              <div className="space-y-6">
                {transcript.map((text, i) => (
                  <div key={i} className={`p-8 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] border border-gray-100 dark:border-slate-700 animate-fadeIn ${i === transcript.length - 1 ? 'ring-2 ring-dare-teal/30 scale-105' : 'opacity-60'}`}>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-200 leading-relaxed italic">"{text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isActive && (
          <div className="p-10 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-800 space-y-6">
            <div className="flex gap-4">
              <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Ask a question..."
                className="flex-1 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold focus:border-dare-teal outline-none transition-all"
              />
              <button 
                onClick={handleSendText}
                className="px-8 py-4 bg-dare-teal text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Send
              </button>
            </div>
            <button onClick={onClose} className="w-full py-6 bg-rose-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl">Terminate Mastery Link</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutor;
