import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface UseVoiceTypingOptions {
  onTranscriptChange?: (text: string) => void;
  lang?: string;
}

export function useVoiceTyping({
  onTranscriptChange,
  lang = 'en-US'
}: UseVoiceTypingOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const initialBaseTextRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already stopping
      }
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    (currentInputText: string = '') => {
      setError(null);
      setInterimTranscript('');
      initialBaseTextRef.current = currentInputText.trim();

      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        setError('Voice typing is not supported in this browser. Please try Chrome, Edge, or Safari.');
        return;
      }

      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let interim = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }

          setInterimTranscript(interim);

          if (finalTranscript && onTranscriptChange) {
            const base = initialBaseTextRef.current;
            const updated = base
              ? `${base} ${finalTranscript.trim()}`
              : finalTranscript.trim();
            initialBaseTextRef.current = updated;
            onTranscriptChange(updated);
            setInterimTranscript('');
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          if (event.error === 'no-speech') {
            // Harmless silent pause, keep listening
            return;
          }
          if (event.error === 'not-allowed') {
            setError('Microphone access was denied. Please allow microphone permissions in your browser to use voice typing.');
          } else if (event.error === 'network') {
            setError('Network error with speech recognition service. Please check your connection.');
          } else {
            setError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
          setInterimTranscript('');
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not start microphone';
        setError(message);
        setIsListening(false);
      }
    },
    [lang, onTranscriptChange]
  );

  const toggleListening = useCallback(
    (currentInputText: string = '') => {
      if (isListening) {
        stopListening();
      } else {
        startListening(currentInputText);
      }
    },
    [isListening, startListening, stopListening]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isListening,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null)
  };
}
