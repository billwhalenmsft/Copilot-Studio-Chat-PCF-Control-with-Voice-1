/**
 * Control - Main entry point component for the PCF control
 * 
 * Supports two authentication modes:
 * - Direct: Uses Direct Line secret directly (simpler, less secure)
 * - Entra: Uses Microsoft Entra ID authentication (recommended for production)
 */

import React from 'react';
import { getDirectLineToken } from './utils/auth';
import { CopilotChatService, AuthenticatedUserContext } from './services/CopilotChatService';
import { EntraAuthService, createEntraAuthService } from './services/EntraAuthService';
import ChatWindow from './ChatWindow';
import {
    saveConversationState,
    loadConversationState,
    clearConversationState
} from './utils/storage';

// PCF Property interface
interface PropertyValue<T> {
    raw: T;
}

// Auth mode type
type AuthModeType = 'Direct' | 'Entra';

export interface ControlProps {
    // Authentication Mode
    AuthMode?: PropertyValue<string>;
    
    // Control Version (read-only, visible in properties panel)
    ControlVersion?: PropertyValue<string>;
    
    // Direct Line Configuration
    DirectLineSecret?: PropertyValue<string>;
    DirectLineEndpoint?: PropertyValue<string>;
    
    // Entra ID Configuration
    EntraClientId?: PropertyValue<string>;
    EntraTenantId?: PropertyValue<string>;
    EntraScope?: PropertyValue<string>;
    BotId?: PropertyValue<string>;
    
    // Azure Speech Service Configuration
    SpeechKey?: PropertyValue<string>;
    SpeechRegion?: PropertyValue<string>;
    
    // Azure OpenAI TTS Configuration
    OpenAIEndpoint?: PropertyValue<string>;
    OpenAIKey?: PropertyValue<string>;
    OpenAIDeployment?: PropertyValue<string>;
    
    // UI Configuration
    ModalTitle?: PropertyValue<string>;
    EnableAttachments?: PropertyValue<boolean>;
    AttachmentIcon?: PropertyValue<string>;
    DefaultLanguage?: PropertyValue<string>;
    EnableDebugLog?: PropertyValue<boolean>;
    DebugLogEmail?: PropertyValue<string>;
}

const ChatDirectLineControl: React.FC<ControlProps> = (props) => {
    const [chatService, setChatService] = React.useState<CopilotChatService | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isInitializing, setIsInitializing] = React.useState(true);
    const [isReconnected, setIsReconnected] = React.useState(false);
    const [authService, setAuthService] = React.useState<EntraAuthService | null>(null);
    const [needsAuth, setNeedsAuth] = React.useState(false);
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);
    const initRef = React.useRef(false);

    // Determine auth mode from props
    const authMode: AuthModeType = (props.AuthMode?.raw as AuthModeType) || 'Direct';

    // Mobile detection - iOS ITP and Power Apps Mobile webview block
    // cross-origin Direct Line session cookies, causing "Missing session cookie" errors
    const isMobilePlatform = React.useMemo(() => {
        try { return /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || ''); }
        catch { return false; }
    }, []);

    // Auto-fallback to Direct mode on mobile platforms
    const effectiveAuthMode: AuthModeType = (authMode === 'Entra' && isMobilePlatform) ? 'Direct' : authMode;

    React.useEffect(() => {
        const initializeChat = async (): Promise<void> => {
            // Prevent redundant initialization from Canvas App re-renders
            if (initRef.current) {
                console.log('⏭️ Skipping redundant initialization');
                return;
            }
            initRef.current = true;

            console.log('=== CONTROL INITIALIZING ===');
            console.log('AuthMode:', authMode, effectiveAuthMode !== authMode ? `(effective: ${effectiveAuthMode})` : '');
            console.log('DirectLineSecret:', props.DirectLineSecret ? 'Present' : 'Missing');
            console.log('DirectLineEndpoint:', props.DirectLineEndpoint?.raw || 'Using default');
            console.log('EntraClientId:', props.EntraClientId ? 'Present' : 'Missing');
            console.log('EntraTenantId:', props.EntraTenantId?.raw || 'Not configured');
            console.log('EntraScope:', props.EntraScope?.raw || 'Not configured');
            console.log('SpeechKey:', props.SpeechKey ? 'Present' : 'Missing (will use browser voices)');
            console.log('SpeechRegion:', props.SpeechRegion?.raw || 'Not configured');

            try {
                let token: string;
                const endpoint = props.DirectLineEndpoint?.raw || undefined;

                if (effectiveAuthMode === 'Entra') {
                    // Entra authentication mode
                    console.log('🔐 Using Entra ID authentication mode');
                    
                    const clientId = props.EntraClientId?.raw;
                    const tenantId = props.EntraTenantId?.raw;
                    const scope = props.EntraScope?.raw;
                    const botId = props.BotId?.raw;

                    if (!clientId || !tenantId || !scope) {
                        console.error('Entra configuration incomplete!');
                        setError('Entra authentication requires Client ID, Tenant ID, and Scope');
                        setIsInitializing(false);
                        return;
                    }

                    // Create Entra auth service
                    const entraService = createEntraAuthService(clientId, tenantId, scope, botId || '');
                    setAuthService(entraService);

                    // Check for callback from OAuth redirect
                    const callbackResult = entraService.handleAuthCallback();
                    
                    if (callbackResult.error) {
                        console.error('Auth callback error:', callbackResult.error);
                        setError(`Authentication failed: ${callbackResult.error}`);
                        setIsInitializing(false);
                        return;
                    }

                    if (callbackResult.code) {
                        // Exchange code for tokens
                        console.log('🔑 Exchanging authorization code for tokens...');
                        try {
                            await entraService.exchangeCodeForToken(callbackResult.code);
                            console.log('✅ Entra authentication successful');
                        } catch (err) {
                            console.error('Token exchange failed:', err);
                            setError('Failed to complete authentication. Please try again.');
                            setNeedsAuth(true);
                            setIsInitializing(false);
                            return;
                        }
                    } else if (callbackResult.token) {
                        // Implicit flow token - handled by exchange
                        console.log('🔑 Token from implicit flow received');
                    } else if (entraService.canSilentAuth()) {
                        // Try to get valid token (will refresh if needed)
                        console.log('🔑 Attempting silent authentication...');
                        try {
                            const accessToken = await entraService.getValidAccessToken();
                            if (accessToken) {
                                console.log('✅ Silent authentication successful');
                            } else {
                                // Silent auth failed, need user interaction
                                console.log('🔐 Silent auth failed, user needs to authenticate');
                                setNeedsAuth(true);
                                setIsInitializing(false);
                                return;
                            }
                        } catch (err) {
                            console.error('Silent auth error:', err);
                            setNeedsAuth(true);
                            setIsInitializing(false);
                            return;
                        }
                    } else {
                        // No tokens available, need to authenticate
                        console.log('🔐 No persisted session, user needs to authenticate');
                        setNeedsAuth(true);
                        setIsInitializing(false);
                        return;
                    }

                    // For Entra mode, we still use Direct Line secret for the bot connection
                    // but we now have the authenticated user's identity
                    const secret = props.DirectLineSecret?.raw;
                    if (!secret) {
                        console.error('Direct Line secret is required even in Entra mode!');
                        setError('Direct Line secret is required. Entra authentication identifies the user, Direct Line connects to the bot.');
                        setIsInitializing(false);
                        return;
                    }
                    
                    console.log('🔗 Getting Direct Line token with authenticated user...');
                    token = await getDirectLineToken(secret);
                    
                    // Get the Entra access token for SSO with the bot
                    const entraAccessToken = await entraService.getValidAccessToken();
                    
                    // Build user context for SSO
                    const userContext: AuthenticatedUserContext = {
                        id: `entra-user-${Date.now()}`,  // Will be replaced with actual user ID from token
                        name: 'Authenticated User',
                        aadToken: entraAccessToken || undefined
                    };
                    
                    console.log('✅ Entra auth complete, Direct Line token received');
                    console.log('🔐 SSO enabled - bot will receive user token automatically');
                    
                    // Create service with user context for SSO
                    const service = new CopilotChatService(token, endpoint, userContext);
                    
                    // Set up state change callback for persistence
                    service.setStateChangeCallback((conversationId, watermark) => {
                        saveConversationState(conversationId, watermark);
                    });

                    // Try to reconnect to existing conversation
                    const savedState = loadConversationState();
                    let reconnected = false;

                    if (savedState) {
                        console.log('🔄 Found saved conversation, attempting reconnection...');
                        reconnected = await service.reconnectConversation(
                            savedState.conversationId,
                            savedState.watermark
                        );
                        if (!reconnected) {
                            console.log('⚠️ Reconnection failed, clearing saved state');
                            clearConversationState();
                        }
                    }

                    if (!reconnected) {
                        console.log('Starting new conversation...');
                        await service.startConversation();
                        console.log('Conversation started successfully');

                        // Trigger the bot greeting
                        await service.triggerConversationStart();
                    } else {
                        setIsReconnected(true);
                    }

                    setChatService(service);
                    setIsInitializing(false);
                    return;  // Exit after Entra flow completes
                } else {
                    // Direct authentication mode (existing behavior)
                    console.log('🔑 Using Direct Line authentication mode');
                    
                    const secret = props.DirectLineSecret?.raw;
                    if (!secret) {
                        console.error('Direct Line secret is missing!');
                        setError('Direct Line secret is required for Direct authentication mode');
                        setIsInitializing(false);
                        return;
                    }

                    console.log('Getting Direct Line token...');
                    token = await getDirectLineToken(secret);
                }

                console.log('Token received:', token.substring(0, 20) + '...');
                console.log('Creating CopilotChatService with endpoint:', endpoint || 'default');

                const service = new CopilotChatService(token, endpoint);

                // Set up state change callback for persistence
                service.setStateChangeCallback((conversationId, watermark) => {
                    saveConversationState(conversationId, watermark);
                });

                // Try to reconnect to existing conversation
                const savedState = loadConversationState();
                let reconnected = false;

                if (savedState) {
                    console.log('🔄 Found saved conversation, attempting reconnection...');
                    reconnected = await service.reconnectConversation(
                        savedState.conversationId,
                        savedState.watermark
                    );
                    if (!reconnected) {
                        console.log('⚠️ Reconnection failed, clearing saved state');
                        clearConversationState();
                    }
                }

                if (!reconnected) {
                    console.log('Starting new conversation...');
                    await service.startConversation();
                    console.log('Conversation started successfully');
                } else {
                    console.log('✅ Reconnected to existing conversation');
                }

                setIsReconnected(reconnected);
                setChatService(service);
                setIsInitializing(false);
                console.log('=== CONTROL READY ===');
            } catch (err) {
                console.error('Failed to initialize chat:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize chat');
                setIsInitializing(false);
                initRef.current = false;  // Allow retry on failure
            }
        };

        initializeChat();
    }, [props.DirectLineSecret?.raw, props.DirectLineEndpoint?.raw, effectiveAuthMode, props.EntraClientId?.raw, props.EntraTenantId?.raw, props.EntraScope?.raw, props.BotId?.raw]);

    // Handle sign-in button click
    const handleSignIn = async (): Promise<void> => {
        if (!authService) return;
        
        setIsAuthenticating(true);
        try {
            // Try popup first (better for mobile with cookie restrictions)
            const code = await authService.initiateAuthPopup();
            
            // Exchange code for tokens
            await authService.exchangeCodeForToken(code);
            
            // Get Direct Line token using the secret (not from Entra)
            const secret = props.DirectLineSecret?.raw;
            if (!secret) {
                throw new Error('Direct Line secret is required');
            }
            const token = await getDirectLineToken(secret);
            const endpoint = props.DirectLineEndpoint?.raw || undefined;
            
            // Get the Entra access token for SSO with the bot
            const entraAccessToken = await authService.getValidAccessToken();
            
            // Build user context for SSO - this is critical for token exchange!
            const userContext: AuthenticatedUserContext = {
                id: `entra-user-${Date.now()}`,
                name: 'Authenticated User',
                aadToken: entraAccessToken || undefined
            };
            
            console.log('🔐 SSO enabled - passing Entra token to bot');
            
            // Initialize chat service WITH userContext for SSO
            const service = new CopilotChatService(token, endpoint, userContext);
            
            service.setStateChangeCallback((conversationId, watermark) => {
                saveConversationState(conversationId, watermark);
            });
            
            await service.startConversation();
            setChatService(service);
            setNeedsAuth(false);
            setIsAuthenticating(false);
            console.log('=== CONTROL READY (after auth with SSO) ===');
        } catch (err) {
            console.error('Popup auth failed, falling back to redirect:', err);
            // Fall back to redirect flow (will navigate away from page)
            try {
                await authService.initiateAuth();
            } catch (redirectErr) {
                console.error('Redirect auth failed:', redirectErr);
                setError('Authentication failed. Please try again.');
                setIsAuthenticating(false);
            }
        }
    };

    // Consistent full-size root wrapper so the control always fills its allocated
    // container in Canvas Apps.  Without this the PCF host div collapses to
    // content-size and snaps to the upper-left, breaking the Display properties panel.
    const rootStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f2f1',
        fontFamily: '"Segoe UI", "Helvetica Neue", sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
    };

    if (isInitializing) {
        return (
            <div style={rootStyle}>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    Initializing chat...
                </div>
            </div>
        );
    }

    if (needsAuth) {
        return (
            <div style={rootStyle}>
                <div style={{ 
                    padding: '40px', 
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ fontSize: '24px' }}>🔐</div>
                    <div style={{ fontSize: '16px', color: '#333' }}>
                        Sign in required to use the assistant
                    </div>
                    <button
                        onClick={handleSignIn}
                        disabled={isAuthenticating}
                        style={{
                            padding: '12px 32px',
                            fontSize: '16px',
                            backgroundColor: isAuthenticating ? '#ccc' : '#0078d4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isAuthenticating ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isAuthenticating ? (
                            <>
                                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                                Signing in...
                            </>
                        ) : (
                            <>Sign in with Microsoft</>
                        )}
                    </button>
                    <div style={{ fontSize: '12px', color: '#666', maxWidth: '300px' }}>
                        You will be redirected to Microsoft to sign in securely.
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={rootStyle}>
                <div style={{ padding: '20px', color: 'red' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!chatService) {
        return (
            <div style={rootStyle}>
                <div style={{ padding: '20px' }}>
                    Chat service not available
                </div>
            </div>
        );
    }

    return (
        <div style={{ ...rootStyle, justifyContent: 'stretch', alignItems: 'stretch' }}>
            <ChatWindow
                chatService={chatService}
                speechKey={props.SpeechKey?.raw || undefined}
                speechRegion={props.SpeechRegion?.raw || undefined}
                openAIEndpoint={props.OpenAIEndpoint?.raw || undefined}
                openAIKey={props.OpenAIKey?.raw || undefined}
                openAIDeployment={props.OpenAIDeployment?.raw || 'tts'}
                isReconnected={isReconnected}
                modalTitle={props.ModalTitle?.raw || undefined}
                enableAttachments={props.EnableAttachments?.raw === true}
                attachmentIcon={(props.AttachmentIcon?.raw as 'paperclip' | 'camera' | 'document' | 'plus') || 'paperclip'}
                defaultLanguage={props.DefaultLanguage?.raw || undefined}
                enableDebugLog={props.EnableDebugLog?.raw === true}
                debugLogEmail={props.DebugLogEmail?.raw || undefined}
                authMode={effectiveAuthMode}
            />
        </div>
    );
};

export default ChatDirectLineControl;
