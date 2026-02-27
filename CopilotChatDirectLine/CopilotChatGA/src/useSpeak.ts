/**
 * useSpeak hook - Text-to-speech functionality supporting Azure Speech and OpenAI TTS
 */

import React from 'react';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

// Voice profile configuration
export interface VoiceProfile {
    provider: 'azure' | 'openai';
    voice: string;
    style?: string;
    description: string;
}

// Available voice profiles
export interface AvailableVoice {
    id: string;
    description: string;
    provider: 'azure' | 'openai';
}

// Voice profile mapping - combines Azure Speech and OpenAI voices
export const VOICE_PROFILES: Record<string, VoiceProfile> = {
    // Azure Speech voices
    'azure-jenny-friendly': {
        provider: 'azure',
        voice: 'en-US-JennyNeural',
        style: 'friendly',
        description: 'Jenny - Friendly'
    },
    'azure-jenny-chat': {
        provider: 'azure',
        voice: 'en-US-JennyNeural',
        style: 'chat',
        description: 'Jenny - Chat'
    },
    'azure-jenny-customerservice': {
        provider: 'azure',
        voice: 'en-US-JennyNeural',
        style: 'customerservice',
        description: 'Jenny - Customer Service'
    },
    'azure-aria-empathetic': {
        provider: 'azure',
        voice: 'en-US-AriaNeural',
        style: 'empathetic',
        description: 'Aria - Empathetic'
    },
    'azure-aria-chat': {
        provider: 'azure',
        voice: 'en-US-AriaNeural',
        style: 'chat',
        description: 'Aria - Chat'
    },
    'azure-guy-friendly': {
        provider: 'azure',
        voice: 'en-US-GuyNeural',
        style: 'friendly',
        description: 'Guy - Friendly'
    },
    'azure-davis-chat': {
        provider: 'azure',
        voice: 'en-US-DavisNeural',
        style: 'chat',
        description: 'Davis - Chat'
    },
    'azure-sara-friendly': {
        provider: 'azure',
        voice: 'en-US-SaraNeural',
        style: 'friendly',
        description: 'Sara - Friendly'
    },
    'azure-sara-chat': {
        provider: 'azure',
        voice: 'en-US-SaraNeural',
        style: 'chat',
        description: 'Sara - Chat'
    },
    // OpenAI GPT-4o voices (more natural/conversational)
    'openai-alloy': {
        provider: 'openai',
        voice: 'alloy',
        description: 'Alloy - Neutral, balanced'
    },
    'openai-echo': {
        provider: 'openai',
        voice: 'echo',
        description: 'Echo - Warm, conversational'
    },
    'openai-shimmer': {
        provider: 'openai',
        voice: 'shimmer',
        description: 'Shimmer - Clear, expressive'
    },
    'openai-nova': {
        provider: 'openai',
        voice: 'nova',
        description: 'Nova - Warm, engaging'
    },
    'openai-onyx': {
        provider: 'openai',
        voice: 'onyx',
        description: 'Onyx - Deep, authoritative'
    },
    'openai-fable': {
        provider: 'openai',
        voice: 'fable',
        description: 'Fable - Expressive, storytelling'
    }
};

// Legacy voice profile mapping for backward compatibility
const LEGACY_VOICE_MAP: Record<string, string> = {
    'jenny-friendly': 'azure-jenny-friendly',
    'jenny-customerservice': 'azure-jenny-customerservice',
    'aria-customerservice': 'azure-aria-empathetic',
    'aria-empathetic': 'azure-aria-empathetic',
    'guy-friendly': 'azure-guy-friendly',
    'davis-chat': 'azure-davis-chat',
    'sara-friendly': 'azure-sara-friendly'
};

// Get available voices based on configured providers
export function getAvailableVoices(hasAzureSpeech: boolean, hasOpenAI: boolean): AvailableVoice[] {
    const voices: AvailableVoice[] = [];

    Object.entries(VOICE_PROFILES).forEach(([id, config]) => {
        if (config.provider === 'azure' && hasAzureSpeech) {
            voices.push({ id, description: config.description, provider: 'azure' });
        } else if (config.provider === 'openai' && hasOpenAI) {
            voices.push({ id, description: config.description, provider: 'openai' });
        }
    });

    return voices;
}

// Detect if running on mobile
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Escape XML special characters for SSML
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Token cache to avoid repeated token fetches (for Azure Speech)
let cachedToken: { token: string; expiry: number } | null = null;

/**
 * Fetch an authorization token from Azure Speech Service.
 */
async function getAzureAuthToken(speechKey: string, speechRegion: string): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiry) {
        console.log('🔑 Using cached Azure Speech auth token');
        return cachedToken.token;
    }

    console.log('🔑 Fetching new Azure Speech auth token...');
    const tokenUrl = `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Length': '0'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token fetch failed: ${response.status} - ${errorText}`);
    }

    const token = await response.text();
    cachedToken = { token, expiry: Date.now() + 9 * 60 * 1000 };
    console.log('✅ Azure Speech auth token obtained');
    return token;
}

/**
 * Play audio using HTML Audio element (most reliable on mobile)
 * This approach starts playing as soon as enough data is buffered.
 */
async function playAudioFromResponse(
    response: Response,
    audioRef: React.MutableRefObject<HTMLAudioElement | null>
): Promise<void> {
    console.log('🎵 Starting audio playback...');
    const startTime = performance.now();

    // Get audio data as blob
    const audioBlob = await response.blob();
    const downloadTime = performance.now();
    console.log(`📥 Audio downloaded in ${(downloadTime - startTime).toFixed(0)}ms (${(audioBlob.size / 1024).toFixed(1)}KB)`);

    // Create blob URL
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Promise((resolve, reject) => {
        // Create new audio element for each playback (cleaner on mobile)
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Set up event handlers BEFORE setting src
        audio.onended = () => {
            console.log(`✅ Audio playback complete (total: ${(performance.now() - startTime).toFixed(0)}ms)`);
            URL.revokeObjectURL(audioUrl); // Clean up
            audioRef.current = null;
            resolve();
        };

        audio.onerror = (e) => {
            console.error('❌ Audio playback error:', e);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            reject(new Error('Audio playback failed'));
        };

        audio.oncanplaythrough = () => {
            console.log(`🔊 Playback starting in ${(performance.now() - startTime).toFixed(0)}ms`);
        };

        // Start playback
        audio.play().catch(err => {
            console.error('❌ Play failed:', err);
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            reject(err);
        });
    });
}

export interface UseSpeakOptions {
    speechKey?: string;
    speechRegion?: string;
    openAIEndpoint?: string;
    openAIKey?: string;
    openAIDeployment?: string;
    voiceProfile?: string;
    audioUnlocked?: boolean;
    // Multi-lingual support
    language?: string;         // BCP-47 language code (e.g., 'en-US', 'es-CO')
    voiceId?: string;          // Azure Neural voice ID (e.g., 'es-CO-SalomeNeural')
}

export interface UseSpeakReturn {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    pause: () => void;
    resume: () => void;
}

export function useSpeak(options: UseSpeakOptions = {}): UseSpeakReturn {
    const {
        speechKey,
        speechRegion,
        openAIEndpoint,
        openAIKey,
        openAIDeployment = 'tts',
        voiceProfile = 'azure-jenny-friendly',
        audioUnlocked = false,
        // Multi-lingual support
        language = 'en-US',
        voiceId = ''
    } = options;

    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const voiceProfileRef = React.useRef(voiceProfile);
    const languageRef = React.useRef(language);
    const voiceIdRef = React.useRef(voiceId);
    
    voiceProfileRef.current = voiceProfile;
    languageRef.current = language;
    voiceIdRef.current = voiceId;

    const speak = React.useCallback(async (text: string): Promise<void> => {
        const currentVoiceProfile = voiceProfileRef.current;
        const currentLanguage = languageRef.current;
        const currentVoiceId = voiceIdRef.current;

        // Handle legacy voice profile names
        let resolvedVoiceProfile = currentVoiceProfile;
        if (LEGACY_VOICE_MAP[currentVoiceProfile]) {
            resolvedVoiceProfile = LEGACY_VOICE_MAP[currentVoiceProfile];
        }

        const voiceConfig = VOICE_PROFILES[resolvedVoiceProfile];
        const hasAzureSpeech = !!(speechKey && speechRegion);
        const hasOpenAI = !!(openAIEndpoint && openAIKey);
        
        // Determine if we should use multi-lingual Azure voice
        const useMultiLingual = currentVoiceId && currentLanguage && !currentLanguage.startsWith('en-');
        const isEnglish = currentLanguage.startsWith('en-');

        console.log('🎤 SPEAK - language:', currentLanguage, 'voiceId:', currentVoiceId, 'voiceProfile:', resolvedVoiceProfile, 'multiLingual:', useMultiLingual, 'azure:', hasAzureSpeech, 'openai:', hasOpenAI);

        if (isMobile && !audioUnlocked && (hasAzureSpeech || hasOpenAI)) {
            console.log('⚠️ Audio not unlocked on mobile');
            return;
        }

        try {
            // For non-English languages, ALWAYS use Azure Speech with the selected voice
            if (useMultiLingual && hasAzureSpeech) {
                console.log(`🌍 Multi-lingual Azure Speech: ${currentVoiceId} (${currentLanguage})`);
                
                // Build SSML with the correct language and voice
                const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${currentLanguage}"><voice name="${currentVoiceId}"><prosody rate="1.0" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;

                const authToken = await getAzureAuthToken(speechKey!, speechRegion!);

                const response = await fetch(
                    `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/ssml+xml',
                            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                        },
                        body: ssml
                    }
                );

                if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                return playAudioFromResponse(response, audioRef);
            }

            // For English, use OpenAI if selected and available (more natural voices)
            if (voiceConfig?.provider === 'openai' && hasOpenAI && isEnglish) {
                console.log(`🎤 OpenAI TTS (streaming): ${voiceConfig.voice}`);
                const baseUrl = openAIEndpoint!.replace(/\/$/, '');
                const url = `${baseUrl}/openai/deployments/${openAIDeployment}/audio/speech?api-version=2024-02-15-preview`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'api-key': openAIKey!,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: openAIDeployment,
                        input: text,
                        voice: voiceConfig.voice,
                        response_format: 'mp3',
                        speed: 1.0
                    })
                });

                if (!response.ok) throw new Error(`OpenAI TTS error: ${response.status}`);
                return playAudioFromResponse(response, audioRef);
            }

            // Use Azure Speech for English with selected voice profile
            if (voiceConfig?.provider === 'azure' && hasAzureSpeech) {
                console.log(`🎤 Azure Speech: ${voiceConfig.voice} (${voiceConfig.style})`);

                const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${currentLanguage || 'en-US'}"><voice name="${voiceConfig.voice}"><mstts:express-as style="${voiceConfig.style || 'chat'}" styledegree="1.5"><prosody rate="1.1" pitch="0%">${escapeXml(text)}</prosody></mstts:express-as></voice></speak>`;

                const authToken = await getAzureAuthToken(speechKey!, speechRegion!);

                const response = await fetch(
                    `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/ssml+xml',
                            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                        },
                        body: ssml
                    }
                );

                if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                return playAudioFromResponse(response, audioRef);
            }

            // Multi-lingual Azure as fallback when voiceId is set
            if (currentVoiceId && hasAzureSpeech) {
                console.log(`🌍 Azure Speech fallback: ${currentVoiceId} (${currentLanguage})`);
                
                const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${currentLanguage}"><voice name="${currentVoiceId}"><prosody rate="1.0" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;

                const authToken = await getAzureAuthToken(speechKey!, speechRegion!);

                const response = await fetch(
                    `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Content-Type': 'application/ssml+xml',
                            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                        },
                        body: ssml
                    }
                );

                if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                return playAudioFromResponse(response, audioRef);
            }

            // Fallback: OpenAI for Azure voice profile when Azure not configured
            if (voiceConfig?.provider === 'azure' && !hasAzureSpeech && hasOpenAI) {
                console.log('⚠️ Azure not configured, using OpenAI fallback');
                const baseUrl = openAIEndpoint!.replace(/\/$/, '');
                const url = `${baseUrl}/openai/deployments/${openAIDeployment}/audio/speech?api-version=2024-02-15-preview`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'api-key': openAIKey!,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: openAIDeployment,
                        input: text,
                        voice: 'echo',
                        response_format: 'mp3',
                        speed: 1.0
                    })
                });
                if (!response.ok) throw new Error(`OpenAI TTS error: ${response.status}`);
                return playAudioFromResponse(response, audioRef);
            }
        } catch (error) {
            console.error('❌ TTS failed:', error);
        }

        // Browser fallback
        console.log('🔊 Using browser voice fallback');
        if (!window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = currentLanguage || 'en-US';
        utterance.rate = 1.1;

        const voices = window.speechSynthesis.getVoices();
        // Try to find a voice matching the language
        const langVoice = voices.find(v => v.lang.startsWith(currentLanguage.split('-')[0]));
        const preferredVoice = langVoice 
            || voices.find(v => v.name.includes('Natural') || v.name.includes('Neural'))
            || voices.find(v => v.lang.startsWith('en-US'));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, [speechKey, speechRegion, openAIEndpoint, openAIKey, openAIDeployment, audioUnlocked]);

    const stop = React.useCallback(() => {
        // Stop HTML Audio element
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        window.speechSynthesis?.cancel();
    }, []);

    const pause = React.useCallback(() => {
        if (audioRef.current && !audioRef.current.paused) audioRef.current.pause();
    }, []);

    const resume = React.useCallback(() => {
        if (audioRef.current?.paused) audioRef.current.play().catch(() => {});
    }, []);

    return { speak, stop, pause, resume };
}
