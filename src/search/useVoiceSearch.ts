import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

interface VoiceSearchOptions {
  lang: Language;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string) => void;
  autoStopMs?: number;
}

export interface VoiceSearchState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  clearTranscript: () => void;
}

// Browser Web Speech API SpeechRecognition interface
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useVoiceSearch({
  lang,
  onResult,
  onError,
  autoStopMs = 8000,
}: VoiceSearchOptions): VoiceSearchState {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  // Check browser compatibility on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Recognition already stopped
      }
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setErrorMessage(null);
  }, []);

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');

    if (typeof window === 'undefined') return;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      const msg =
        lang === 'ar'
          ? 'ميزة البحث الصوتي غير مدعومة في هذا المتصفح. استخدم متصفح Chrome أو Safari.'
          : 'Voice search is not supported in this browser. Please use Chrome, Edge or Safari.';
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Select proper Speech API language tag
      recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        // Fallback auto-stop if silence
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          stopListening();
        }, autoStopMs);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;
          if (res.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          setTranscript(currentFinal);
          setInterimTranscript('');
          onResult?.(currentFinal, true);
        } else if (currentInterim) {
          setInterimTranscript(currentInterim);
          onResult?.(currentInterim, false);
        }
      };

      recognition.onerror = (event: any) => {
        let errStr = '';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errStr =
            lang === 'ar'
              ? 'تم رفض الإذن بالوصول للميكروفون. يرجى تفعيل إذن الميكروفون.'
              : 'Microphone access was denied. Please allow microphone permissions.';
        } else if (event.error === 'no-speech') {
          errStr =
            lang === 'ar'
              ? 'لم يتم التقاط أي صوت. جرب التحدث مجدداً.'
              : 'No speech was detected. Please try speaking again.';
        } else if (event.error === 'network') {
          errStr =
            lang === 'ar'
              ? 'خطأ في شبكة التعرف الصوتي.'
              : 'Network communication error during speech recognition.';
        } else {
          errStr =
            lang === 'ar'
              ? `خطأ في التعرف الصوتي: ${event.error}`
              : `Voice recognition notice: ${event.error}`;
        }
        setErrorMessage(errStr);
        onError?.(errStr);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };

      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition start failed:', err);
      const errStr =
        lang === 'ar'
          ? 'تعذر بدء التعرف الصوتي في هذه البيئة.'
          : 'Could not initialize speech recognition in this container environment.';
      setErrorMessage(errStr);
      onError?.(errStr);
      setIsListening(false);
    }
  }, [lang, autoStopMs, onResult, onError, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
  };
}
