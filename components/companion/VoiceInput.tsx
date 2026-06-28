"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onResult, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");

      if (event.results[0].isFinal) {
        onResult(transcript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return (
    <div className="relative">
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        className={cn(
          "p-2.5 rounded-xl transition-all duration-200",
          isListening
            ? "bg-danger-100 text-danger-600 animate-pulse shadow-lg shadow-danger-200"
            : "bg-surface-100 text-surface-500 hover:bg-surface-200 hover:text-surface-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={isListening ? "Stop listening" : "Voice input"}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>

      {isListening && (
        <div className="absolute -top-2 right-0 -translate-y-full mb-2 px-3 py-1.5 rounded-lg bg-surface-800 text-white text-xs whitespace-nowrap animate-fade-in">
          Listening...
          <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-surface-800" />
        </div>
      )}

      {error && (
        <div className="absolute -top-2 right-0 -translate-y-full mb-2 px-3 py-1.5 rounded-lg bg-danger-50 text-danger-600 text-xs whitespace-nowrap border border-danger-200 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
