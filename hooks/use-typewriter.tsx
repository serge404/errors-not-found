import { useEffect, useState } from 'react';

export function useTypewriter(text: string, speed = 60) {
    const [typed, setTyped] = useState("");
  
    useEffect(() => {
      let i = 0;
      if (text.length === 0) return;  // Handle case where there's no text to type
  
      // Start typing immediately
      setTyped(text[0]);
  
      const interval = setInterval(() => {
        i++;
        setTyped((prev) => prev + text[i]);
        if (i >= text.length - 1) clearInterval(interval); // Stop after the last character
      }, speed);
  
      return () => clearInterval(interval);
    }, [text, speed]);
  
    return typed;
  }