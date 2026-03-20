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
    entraTenantId?: string;
    entraClientId?: string;
    entraClientSecret?: string;
    speechProxyEndpoint?: string;
    speechProxyApiKey?: string;
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

// Entra ID OAuth token cache for client credentials flow
let cachedEntraToken: { token: string; expiry: number } | null = null;

/**
 * Get an OAuth access token using client credentials flow.
 * Same pattern as Microsoft's Entra ID auth for Cognitive Services:
 * https://learn.microsoft.com/en-us/azure/ai-services/translator/how-to/microsoft-entra-id-auth
 */
async function getEntraToken(tenantId: string, clientId: string, clientSecret: string): Promise<string> {
    if (cachedEntraToken && Date.now() < cachedEntraToken.expiry) {
        console.log('🔑 Using cached Entra ID token');
        return cachedEntraToken.token;
    }

    console.log('🔑 Fetching new Entra ID token via client credentials flow...');
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
        client_id: clientId,
        scope: 'https://cognitiveservices.azure.com/.default',
        client_secret: clientSecret,
        grant_type: 'client_credentials'
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Entra token fetch failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    cachedEntraToken = {
        token: data.access_token,
        expiry: Date.now() + (data.expires_in - 300) * 1000  // refresh 5 min early
    };
    console.log('✅ Entra ID token obtained');
    return data.access_token;
}

export function useSpeak(options: UseSpeakOptions = {}): UseSpeakReturn {
    const {
        speechKey,
        speechRegion,
        openAIEndpoint,
        openAIKey,
        openAIDeployment = 'tts',
        entraTenantId,
        entraClientId,
        entraClientSecret,
        speechProxyEndpoint,
        speechProxyApiKey,
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
        const hasEntraAuth = !!(entraTenantId && entraClientId && entraClientSecret);
        const hasProxy = !!speechProxyEndpoint;
        const hasAzureSpeech = !!(hasProxy || hasEntraAuth || (speechKey && speechRegion));
        const hasOpenAI = !!(hasProxy || hasEntraAuth || (openAIEndpoint && openAIKey));
        
        // Determine if we should use multi-lingual Azure voice
        const useMultiLingual = currentVoiceId && currentLanguage && !currentLanguage.startsWith('en-');
        const isEnglish = currentLanguage.startsWith('en-');

        console.log('🎤 SPEAK - language:', currentLanguage, 'voiceId:', currentVoiceId, 'voiceProfile:', resolvedVoiceProfile, 'multiLingual:', useMultiLingual, 'azure:', hasAzureSpeech, 'openai:', hasOpenAI, 'proxy:', hasProxy, 'entra:', hasEntraAuth);

        if (isMobile && !audioUnlocked && (hasAzureSpeech || hasOpenAI)) {
            console.log('⚠️ Audio not unlocked on mobile');
            return;
        }

        try {
            // ==========================================
            // PROXY PATH — Azure Function with managed identity
            // ==========================================
            if (hasProxy) {
                const proxyBase = speechProxyEndpoint!.replace(/\/+$/, '');
                const proxyHeaders: Record<string, string> = {};
                if (speechProxyApiKey) {
                    proxyHeaders['x-api-key'] = speechProxyApiKey;
                }

                // Non-English or explicit voiceId: use Azure Speech via proxy
                if (useMultiLingual || (voiceConfig?.provider === 'azure') || currentVoiceId) {
                    const voiceName = voiceConfig?.provider === 'azure' ? voiceConfig.voice : (currentVoiceId || 'en-US-JennyNeural');
                    const style = voiceConfig?.style;
                    const ssml = style
                        ? `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${currentLanguage || 'en-US'}"><voice name="${voiceName}"><mstts:express-as style="${style}" styledegree="1.5"><prosody rate="1.1" pitch="0%">${escapeXml(text)}</prosody></mstts:express-as></voice></speak>`
                        : `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${currentLanguage || 'en-US'}"><voice name="${voiceName}"><prosody rate="1.0" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;
                    
                    console.log(`🔌 Proxy → Azure Speech: ${voiceName}`);
                    const response = await fetch(`${proxyBase}/api/azure-tts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/ssml+xml',
                            ...proxyHeaders
                        },
                        body: ssml
                    });
                    if (!response.ok) {
                        const errBody = await response.text().catch(() => '');
                        throw new Error(`Proxy Azure TTS error: ${response.status} ${errBody}`);
                    }
                    return playAudioFromResponse(response, audioRef);
                }

                // OpenAI voice via proxy
                if (voiceConfig?.provider === 'openai') {
                    console.log(`🔌 Proxy → OpenAI TTS: ${voiceConfig.voice}`);
                    const response = await fetch(`${proxyBase}/api/openai-tts`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...proxyHeaders
                        },
                        body: JSON.stringify({
                            input: text,
                            voice: voiceConfig.voice,
                            response_format: 'mp3',
                            speed: 1.0
                        })
                    });
                    if (!response.ok) {
                        const errBody = await response.text().catch(() => '');
                        throw new Error(`Proxy OpenAI TTS error: ${response.status} ${errBody}`);
                    }
                    return playAudioFromResponse(response, audioRef);
                }

                // Default proxy fallback: Azure Speech with Jenny
                console.log('🔌 Proxy → Azure Speech fallback: en-US-JennyNeural');
                const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US"><voice name="en-US-JennyNeural"><mstts:express-as style="chat" styledegree="1.5"><prosody rate="1.1" pitch="0%">${escapeXml(text)}</prosody></mstts:express-as></voice></speak>`;
                const response = await fetch(`${proxyBase}/api/azure-tts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/ssml+xml',
                        ...proxyHeaders
                    },
                    body: ssml
                });
                if (!response.ok) {
                    const errBody = await response.text().catch(() => '');
                    throw new Error(`Proxy Azure TTS error: ${response.status} ${errBody}`);
                }
                return playAudioFromResponse(response, audioRef);
            }

            // ==========================================
            // ENTRA ID PATH — OAuth client credentials flow
            // ==========================================
            if (hasEntraAuth) {
                const entraToken = await getEntraToken(entraTenantId!, entraClientId!, entraClientSecret!);
                const region = speechRegion || 'eastus';

                // Non-English: always use Azure Speech with the selected voice
                if (useMultiLingual) {
                    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${currentLanguage}"><voice name="${currentVoiceId}"><prosody rate="1.0" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;
                    const response = await fetch(
                        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${entraToken}`,
                                'Content-Type': 'application/ssml+xml',
                                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                            },
                            body: ssml
                        }
                    );
                    if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                    return playAudioFromResponse(response, audioRef);
                }

                // English + OpenAI voice selected
                if (voiceConfig?.provider === 'openai' && isEnglish && openAIEndpoint) {
                    const baseUrl = openAIEndpoint.replace(/\/$/, '');
                    const url = `${baseUrl}/openai/deployments/${openAIDeployment}/audio/speech?api-version=2024-02-15-preview`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${entraToken}`,
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

                // English + Azure voice selected (with SSML styling)
                if (voiceConfig?.provider === 'azure') {
                    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${currentLanguage || 'en-US'}"><voice name="${voiceConfig.voice}"><mstts:express-as style="${voiceConfig.style || 'chat'}" styledegree="1.5"><prosody rate="1.1" pitch="0%">${escapeXml(text)}</prosody></mstts:express-as></voice></speak>`;
                    const response = await fetch(
                        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${entraToken}`,
                                'Content-Type': 'application/ssml+xml',
                                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                            },
                            body: ssml
                        }
                    );
                    if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                    return playAudioFromResponse(response, audioRef);
                }

                // Fallback: voiceId set but no profile match
                if (currentVoiceId) {
                    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${currentLanguage}"><voice name="${currentVoiceId}"><prosody rate="1.0" pitch="0%">${escapeXml(text)}</prosody></voice></speak>`;
                    const response = await fetch(
                        `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${entraToken}`,
                                'Content-Type': 'application/ssml+xml',
                                'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
                            },
                            body: ssml
                        }
                    );
                    if (!response.ok) throw new Error(`Azure Speech error: ${response.status}`);
                    return playAudioFromResponse(response, audioRef);
                }

                // Default fallback with Entra: use OpenAI if endpoint configured, else Azure
                if (openAIEndpoint) {
                    const baseUrl = openAIEndpoint.replace(/\/$/, '');
                    const url = `${baseUrl}/openai/deployments/${openAIDeployment}/audio/speech?api-version=2024-02-15-preview`;
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${entraToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ model: openAIDeployment, input: text, voice: 'echo', response_format: 'mp3', speed: 1.0 })
                    });
                    if (!response.ok) throw new Error(`OpenAI TTS error: ${response.status}`);
                    return playAudioFromResponse(response, audioRef);
                }
            }

            // ==========================================
            // DIRECT PATH — API keys (existing behavior)
            // ==========================================

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
    }, [speechKey, speechRegion, openAIEndpoint, openAIKey, openAIDeployment, entraTenantId, entraClientId, entraClientSecret, speechProxyEndpoint, speechProxyApiKey, audioUnlocked]);

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
