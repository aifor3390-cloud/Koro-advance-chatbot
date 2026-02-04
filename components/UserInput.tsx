
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Paperclip, StopCircle, X, FileText, Video, Image as ImageIcon, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Language, Attachment } from '../types';

interface UserInputProps {
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  disabled: boolean;
  placeholder: string;
  language: Language;
}

export const UserInput: React.FC<UserInputProps> = ({ onSend, onStop, disabled, placeholder, language }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((input.trim() || selectedAttachments.length > 0) && !disabled) {
      onSend(input, selectedAttachments.length > 0 ? selectedAttachments : undefined);
      setInput('');
      setSelectedAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      if (isCameraOpen) {
        toggleCamera();
      } else if (disabled) {
        e.preventDefault();
        onStop?.();
      }
    }
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: Attachment[] = await Promise.all(
      files.map(async (file) => {
        return new Promise<Attachment>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64String = (event.target?.result as string).split(',')[1];
            let type: 'image' | 'video' | 'document' = 'document';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';

            resolve({
              id: Math.random().toString(36).substr(2, 9),
              type,
              data: base64String,
              mimeType: file.type,
              name: file.name,
              size: file.size
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );
    setSelectedAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleCamera = async () => {
    if (isCameraOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraOpen(false);
      setIsCameraLoading(false);
      setCameraError(null);
    } else {
      setCameraError(null);
      setIsCameraLoading(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported by your browser or connection.");
        setIsCameraLoading(false);
        return;
      }

      try {
        // First try with preferred facing mode
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' },
            audio: false 
          });
        } catch (innerErr) {
          // Fallback to basic video access if specific constraints fail
          console.warn("Preferred camera constraints failed, trying fallback...", innerErr);
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false 
          });
        }

        streamRef.current = stream;
        setIsCameraOpen(true);
        setIsCameraLoading(false);

        // Ensure ref is available and set source
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => {
              console.error("Video play failed", e);
              setCameraError("Could not start video stream preview.");
            });
          }
        }, 50);
      } catch (err: any) {
        console.error("Camera access error:", err);
        setIsCameraLoading(false);
        setIsCameraOpen(false);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError("Camera access denied. Please check your browser's site permissions.");
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError("Requested device not found. Ensure your camera is connected.");
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError("Camera is busy. Another app might be using it.");
        } else if (err.name === 'OverconstrainedError') {
          setCameraError("Your camera doesn't support the required video settings.");
        } else {
          setCameraError(`Camera Error: ${err.message || 'Unable to access device'}`);
        }
      }
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !streamRef.current) return;
    
    const video = videoRef.current;
    // Check if video is actually playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError("Camera stream not ready yet. Please wait.");
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = dataUrl.split(',')[1];
      
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        type: 'image',
        data: base64,
        mimeType: 'image/jpeg',
        name: `Koro_Capture_${new Date().getTime()}.jpg`,
        size: Math.round((base64.length * 3) / 4)
      };
      
      setSelectedAttachments(prev => [...prev, newAttachment]);
      toggleCamera(); // Close camera after taking photo
    } catch (err) {
      console.error("Capture error:", err);
      setCameraError("Failed to freeze current frame.");
    }
  };

  const removeAttachment = (id: string) => {
    setSelectedAttachments(prev => prev.filter(a => a.id !== id));
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'ur' ? 'ur-PK' : language === 'ar' ? 'ar-SA' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="relative group">
      {/* Camera Preview Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md transition-all duration-300">
          <div className="relative w-full max-w-2xl bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-auto bg-black max-h-[70vh] object-contain scale-x-[-1]" 
            />
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
              <div className="bg-indigo-600/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 flex items-center space-x-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Vision Active</span>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-10">
              <button 
                type="button"
                onClick={toggleCamera}
                className="p-5 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full transition-all hover:scale-110 active:scale-90 border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <button 
                type="button"
                onClick={takePhoto}
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.4)] active:scale-95 group/capture"
              >
                <div className="w-20 h-20 border-4 border-zinc-100 rounded-full flex items-center justify-center transition-all group-hover/capture:border-indigo-500">
                  <div className="w-14 h-14 bg-zinc-900/5 rounded-full" />
                </div>
              </button>

              <div className="w-16" /> {/* Layout balancer */}
            </div>
          </div>
          <p className="mt-6 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Tap circle to capture neural snapshot</p>
        </div>
      )}

      {/* Camera Error Message with Clear UI */}
      {cameraError && !isCameraOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-4 p-5 bg-red-500/10 border border-red-500/30 rounded-3xl backdrop-blur-xl text-red-500 shadow-2xl">
            <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Hardware Conflict</p>
              <p className="text-xs font-bold leading-relaxed opacity-90">{cameraError}</p>
            </div>
            <div className="flex flex-col space-y-1">
               <button 
                onClick={() => { setCameraError(null); toggleCamera(); }}
                className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
                title="Retry connection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCameraError(null)} 
                className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Preview Area */}
      {selectedAttachments.length > 0 && (
        <div className="absolute bottom-full mb-4 left-0 w-full overflow-x-auto flex space-x-3 pb-4 animate-in fade-in slide-in-from-bottom-2 no-scrollbar">
          {selectedAttachments.map((att) => (
            <div key={att.id} className="relative shrink-0 w-28 h-28 bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden group/thumb transition-all hover:scale-105 ring-1 ring-zinc-200 dark:ring-zinc-800/50">
              {att.type === 'image' ? (
                <img src={`data:${att.mimeType};base64,${att.data}`} className="w-full h-full object-cover" alt="Preview" />
              ) : att.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-indigo-500">
                  <Video className="w-10 h-10" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-indigo-500 p-2 text-center">
                  <FileText className="w-10 h-10" />
                  <p className="text-[10px] truncate w-full mt-2 px-1 font-bold dark:text-zinc-300">{att.name}</p>
                </div>
              )}
              <button 
                onClick={() => removeAttachment(att.id)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-red-500 shadow-lg border border-white/10"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form 
        onSubmit={disabled ? (e) => e.preventDefault() : handleSubmit}
        className={`
          relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl transition-all duration-500 
          focus-within:ring-4 focus-within:ring-indigo-500/10 overflow-hidden
          ${isCameraLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
          className="hidden" 
        />
        <div className="flex items-end p-3 pl-5">
          <div className="flex items-center space-x-1 mb-1">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-3 text-zinc-400 hover:text-indigo-500 transition-all shrink-0 disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl"
              title="Attach Logic Files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={toggleCamera}
              disabled={disabled}
              className={`p-3 transition-all shrink-0 disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl ${cameraError ? 'text-red-400 animate-pulse' : 'text-zinc-400 hover:text-indigo-500'}`}
              title="Activate Neural Vision"
            >
              {isCameraLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Synchronizing voice input..." : placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-0 py-4 px-3 focus:outline-none focus:ring-0 resize-none text-slate-800 dark:text-zinc-100 max-h-[200px] text-[16px] disabled:opacity-50 font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          />

          <div className="flex items-center space-x-2 p-1">
             <button
               type="button"
               onClick={toggleVoice}
               disabled={disabled}
               className={`p-3.5 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse' : 'text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50'}`}
             >
               {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
             </button>
             <button
               type={disabled ? "button" : "submit"}
               onClick={disabled ? onStop : undefined}
               disabled={!disabled && !input.trim() && selectedAttachments.length === 0}
               className={`
                 p-3.5 rounded-2xl transition-all
                 ${disabled 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50' 
                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 disabled:shadow-none'}
               `}
               title={disabled ? "Abort Synchronization" : "Commit to Neural Buffer"}
             >
               {disabled ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
             </button>
          </div>
        </div>
      </form>
    </div>
  );
};
