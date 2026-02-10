/**
 * useDebugLog hook - In-app debug logging with email capability
 */

import React from 'react';

export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'debug';
    category: string;
    message: string;
    data?: any;
}

export interface UseDebugLogOptions {
    enabled: boolean;
    maxEntries?: number;
    emailAddress?: string;
}

export interface UseDebugLogReturn {
    logs: LogEntry[];
    log: (category: string, message: string, data?: any) => void;
    warn: (category: string, message: string, data?: any) => void;
    error: (category: string, message: string, data?: any) => void;
    debug: (category: string, message: string, data?: any) => void;
    clearLogs: () => void;
    exportLogs: () => string;
    emailLogs: () => void;
    isEnabled: boolean;
    emailAddress?: string;
}

// Global log storage to capture logs across component re-renders
let globalLogs: LogEntry[] = [];
let globalEnabled = false;
let globalEmailAddress: string | undefined;
let globalMaxEntries = 500;

// Intercept console methods when debug is enabled
let originalConsoleLog: typeof console.log;
let originalConsoleWarn: typeof console.warn;
let originalConsoleError: typeof console.error;
let interceptorsInstalled = false;

function installConsoleInterceptors() {
    if (interceptorsInstalled) return;
    
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;
    originalConsoleError = console.error;
    
    console.log = (...args: any[]) => {
        originalConsoleLog.apply(console, args);
        if (globalEnabled) {
            addLogEntry('info', 'console', args.map(a => formatArg(a)).join(' '));
        }
    };
    
    console.warn = (...args: any[]) => {
        originalConsoleWarn.apply(console, args);
        if (globalEnabled) {
            addLogEntry('warn', 'console', args.map(a => formatArg(a)).join(' '));
        }
    };
    
    console.error = (...args: any[]) => {
        originalConsoleError.apply(console, args);
        if (globalEnabled) {
            addLogEntry('error', 'console', args.map(a => formatArg(a)).join(' '));
        }
    };
    
    interceptorsInstalled = true;
}

function formatArg(arg: any): string {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    if (arg instanceof Error) return `${arg.name}: ${arg.message}`;
    try {
        return JSON.stringify(arg, null, 0);
    } catch {
        return String(arg);
    }
}

function addLogEntry(level: LogEntry['level'], category: string, message: string, data?: any) {
    const entry: LogEntry = {
        timestamp: new Date(),
        level,
        category,
        message,
        data
    };
    
    globalLogs.push(entry);
    
    // Trim old entries if exceeding max
    if (globalLogs.length > globalMaxEntries) {
        globalLogs = globalLogs.slice(-globalMaxEntries);
    }
}

function formatTimestamp(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 23);
}

function getLevelIcon(level: LogEntry['level']): string {
    switch (level) {
        case 'info': return 'ℹ️';
        case 'warn': return '⚠️';
        case 'error': return '❌';
        case 'debug': return '🔍';
        default: return '📝';
    }
}

export function useDebugLog(options: UseDebugLogOptions): UseDebugLogReturn {
    const { enabled, maxEntries = 500, emailAddress } = options;
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Update global settings
    React.useEffect(() => {
        globalEnabled = enabled;
        globalEmailAddress = emailAddress;
        globalMaxEntries = maxEntries;
        
        if (enabled) {
            installConsoleInterceptors();
            addLogEntry('info', 'debug', '🚀 Debug logging enabled');
        }
    }, [enabled, emailAddress, maxEntries]);
    
    const log = React.useCallback((category: string, message: string, data?: any) => {
        if (!globalEnabled) return;
        addLogEntry('info', category, message, data);
        forceUpdate();
    }, []);
    
    const warn = React.useCallback((category: string, message: string, data?: any) => {
        if (!globalEnabled) return;
        addLogEntry('warn', category, message, data);
        forceUpdate();
    }, []);
    
    const error = React.useCallback((category: string, message: string, data?: any) => {
        if (!globalEnabled) return;
        addLogEntry('error', category, message, data);
        forceUpdate();
    }, []);
    
    const debug = React.useCallback((category: string, message: string, data?: any) => {
        if (!globalEnabled) return;
        addLogEntry('debug', category, message, data);
        forceUpdate();
    }, []);
    
    const clearLogs = React.useCallback(() => {
        globalLogs = [];
        forceUpdate();
    }, []);
    
    const exportLogs = React.useCallback((): string => {
        const header = `=== Copilot Chat Debug Log ===
Generated: ${new Date().toISOString()}
Device: ${navigator.userAgent}
Entries: ${globalLogs.length}
${'='.repeat(50)}

`;
        
        const logLines = globalLogs.map(entry => {
            const time = formatTimestamp(entry.timestamp);
            const icon = getLevelIcon(entry.level);
            const dataStr = entry.data ? `\n    Data: ${JSON.stringify(entry.data)}` : '';
            return `[${time}] ${icon} [${entry.category}] ${entry.message}${dataStr}`;
        }).join('\n');
        
        return header + logLines;
    }, []);
    
    const emailLogs = React.useCallback(() => {
        const to = globalEmailAddress || '';
        const subject = encodeURIComponent(`Copilot Chat Debug Log - ${new Date().toLocaleDateString()}`);
        const body = encodeURIComponent(exportLogs());
        
        // Use mailto: which works on mobile devices
        const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
        
        // Try to open mail client
        window.location.href = mailtoUrl;
    }, [exportLogs]);
    
    return {
        logs: globalLogs,
        log,
        warn,
        error,
        debug,
        clearLogs,
        exportLogs,
        emailLogs,
        isEnabled: enabled,
        emailAddress
    };
}

// Debug Panel Component
export interface DebugPanelProps {
    logs: LogEntry[];
    onClose: () => void;
    onClear: () => void;
    onEmail: () => void;
    onExport: () => string;
    emailAddress?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
    logs,
    onClose,
    onClear,
    onEmail,
    onExport,
    emailAddress
}) => {
    const [filter, setFilter] = React.useState<string>('all');
    const [copied, setCopied] = React.useState(false);
    const logsEndRef = React.useRef<HTMLDivElement>(null);
    
    // Auto-scroll to bottom when new logs arrive
    React.useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs.length]);
    
    const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(l => l.level === filter || l.category === filter);
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(onExport());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = onExport();
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const getLevelColor = (level: LogEntry['level']): string => {
        switch (level) {
            case 'info': return '#0078d4';
            case 'warn': return '#ff8c00';
            case 'error': return '#d13438';
            case 'debug': return '#6b6b6b';
            default: return '#333';
        }
    };
    
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 20000,
            display: 'flex',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '12px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 15px',
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #333'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>🐛 Debug Logs</span>
                    <span style={{ color: '#888' }}>({logs.length} entries)</span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0 5px'
                    }}
                >
                    ✕
                </button>
            </div>
            
            {/* Filter bar */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 15px',
                backgroundColor: '#222',
                flexWrap: 'wrap'
            }}>
                {['all', 'info', 'warn', 'error', 'debug', 'speech', 'audio'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '4px 12px',
                            borderRadius: '4px',
                            border: filter === f ? '1px solid #0078d4' : '1px solid #444',
                            backgroundColor: filter === f ? '#0078d4' : '#333',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '11px',
                            textTransform: 'capitalize'
                        }}
                    >
                        {f}
                    </button>
                ))}
            </div>
            
            {/* Logs container */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '10px 15px'
            }}>
                {filteredLogs.length === 0 ? (
                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No logs yet. Interact with the chat to generate logs.
                    </div>
                ) : (
                    filteredLogs.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                padding: '4px 0',
                                borderBottom: '1px solid #2a2a2a',
                                wordBreak: 'break-word'
                            }}
                        >
                            <span style={{ color: '#666' }}>
                                {formatTimestamp(entry.timestamp).substring(11)}
                            </span>
                            {' '}
                            <span>{getLevelIcon(entry.level)}</span>
                            {' '}
                            <span style={{ 
                                color: getLevelColor(entry.level),
                                fontWeight: 'bold'
                            }}>
                                [{entry.category}]
                            </span>
                            {' '}
                            <span style={{ color: '#ddd' }}>{entry.message}</span>
                            {entry.data && (
                                <div style={{ 
                                    color: '#888', 
                                    fontSize: '10px',
                                    marginLeft: '20px',
                                    marginTop: '2px'
                                }}>
                                    {JSON.stringify(entry.data)}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={logsEndRef} />
            </div>
            
            {/* Action buttons */}
            <div style={{
                display: 'flex',
                gap: '10px',
                padding: '15px',
                backgroundColor: '#1a1a1a',
                borderTop: '1px solid #333',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={handleCopy}
                    style={{
                        flex: 1,
                        minWidth: '80px',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: copied ? '#107c10' : '#444',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                
                <button
                    onClick={onEmail}
                    style={{
                        flex: 1,
                        minWidth: '80px',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#0078d4',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    📧 Email{emailAddress ? '' : ' (No address set)'}
                </button>
                
                <button
                    onClick={onClear}
                    style={{
                        flex: 1,
                        minWidth: '80px',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#d13438',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🗑️ Clear
                </button>
            </div>
            
            {emailAddress && (
                <div style={{
                    padding: '5px 15px 10px',
                    backgroundColor: '#1a1a1a',
                    color: '#666',
                    fontSize: '10px',
                    textAlign: 'center'
                }}>
                    Logs will be sent to: {emailAddress}
                </div>
            )}
        </div>
    );
};

export default useDebugLog;
