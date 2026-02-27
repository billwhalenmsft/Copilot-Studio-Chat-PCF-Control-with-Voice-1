/**
 * Multi-lingual support configuration
 * Supports 30+ languages with Azure Speech voices for both STT and TTS
 */

// Language configuration interface
export interface LanguageConfig {
    code: string;           // BCP-47 language code (e.g., 'en-US')
    name: string;           // Display name
    nativeName: string;     // Name in the native language
    flag: string;           // Emoji flag
    region: string;         // Geographic region for grouping
    voices: VoiceConfig[];  // Available TTS voices
}

// Voice configuration for a language
export interface VoiceConfig {
    id: string;             // Unique voice ID
    name: string;           // Azure Neural voice name
    displayName: string;    // User-friendly name
    gender: 'male' | 'female';
    style?: string;         // Voice style (friendly, chat, etc.)
    isDefault?: boolean;    // Default voice for this language
}

// Supported languages organized by region
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
    // ==================== AMERICAS ====================
    {
        code: 'en-US',
        name: 'English (US)',
        nativeName: 'English',
        flag: '🇺🇸',
        region: 'Americas',
        voices: [
            { id: 'en-US-JennyNeural', name: 'en-US-JennyNeural', displayName: 'Jenny', gender: 'female', style: 'friendly', isDefault: true },
            { id: 'en-US-AriaNeural', name: 'en-US-AriaNeural', displayName: 'Aria', gender: 'female', style: 'chat' },
            { id: 'en-US-GuyNeural', name: 'en-US-GuyNeural', displayName: 'Guy', gender: 'male', style: 'friendly' },
            { id: 'en-US-DavisNeural', name: 'en-US-DavisNeural', displayName: 'Davis', gender: 'male', style: 'chat' },
            { id: 'en-US-SaraNeural', name: 'en-US-SaraNeural', displayName: 'Sara', gender: 'female', style: 'friendly' },
        ]
    },
    {
        code: 'en-CA',
        name: 'English (Canada)',
        nativeName: 'English',
        flag: '🇨🇦',
        region: 'Americas',
        voices: [
            { id: 'en-CA-ClaraNeural', name: 'en-CA-ClaraNeural', displayName: 'Clara', gender: 'female', isDefault: true },
            { id: 'en-CA-LiamNeural', name: 'en-CA-LiamNeural', displayName: 'Liam', gender: 'male' },
        ]
    },
    {
        code: 'es-CO',
        name: 'Spanish (Colombia)',
        nativeName: 'Español (Colombia)',
        flag: '🇨🇴',
        region: 'Americas',
        voices: [
            { id: 'es-CO-SalomeNeural', name: 'es-CO-SalomeNeural', displayName: 'Salomé', gender: 'female', isDefault: true },
            { id: 'es-CO-GonzaloNeural', name: 'es-CO-GonzaloNeural', displayName: 'Gonzalo', gender: 'male' },
        ]
    },
    {
        code: 'es-MX',
        name: 'Spanish (Mexico)',
        nativeName: 'Español (México)',
        flag: '🇲🇽',
        region: 'Americas',
        voices: [
            { id: 'es-MX-DaliaNeural', name: 'es-MX-DaliaNeural', displayName: 'Dalia', gender: 'female', isDefault: true },
            { id: 'es-MX-JorgeNeural', name: 'es-MX-JorgeNeural', displayName: 'Jorge', gender: 'male' },
            { id: 'es-MX-BeatrizNeural', name: 'es-MX-BeatrizNeural', displayName: 'Beatriz', gender: 'female' },
        ]
    },
    {
        code: 'es-AR',
        name: 'Spanish (Argentina)',
        nativeName: 'Español (Argentina)',
        flag: '🇦🇷',
        region: 'Americas',
        voices: [
            { id: 'es-AR-ElenaNeural', name: 'es-AR-ElenaNeural', displayName: 'Elena', gender: 'female', isDefault: true },
            { id: 'es-AR-TomasNeural', name: 'es-AR-TomasNeural', displayName: 'Tomás', gender: 'male' },
        ]
    },
    {
        code: 'es-CL',
        name: 'Spanish (Chile)',
        nativeName: 'Español (Chile)',
        flag: '🇨🇱',
        region: 'Americas',
        voices: [
            { id: 'es-CL-CatalinaNeural', name: 'es-CL-CatalinaNeural', displayName: 'Catalina', gender: 'female', isDefault: true },
            { id: 'es-CL-LorenzoNeural', name: 'es-CL-LorenzoNeural', displayName: 'Lorenzo', gender: 'male' },
        ]
    },
    {
        code: 'es-PE',
        name: 'Spanish (Peru)',
        nativeName: 'Español (Perú)',
        flag: '🇵🇪',
        region: 'Americas',
        voices: [
            { id: 'es-PE-CamilaNeural', name: 'es-PE-CamilaNeural', displayName: 'Camila', gender: 'female', isDefault: true },
            { id: 'es-PE-AlexNeural', name: 'es-PE-AlexNeural', displayName: 'Alex', gender: 'male' },
        ]
    },
    {
        code: 'es-US',
        name: 'Spanish (US)',
        nativeName: 'Español (EE.UU.)',
        flag: '🇺🇸',
        region: 'Americas',
        voices: [
            { id: 'es-US-PalomaNeural', name: 'es-US-PalomaNeural', displayName: 'Paloma', gender: 'female', isDefault: true },
            { id: 'es-US-AlonsoNeural', name: 'es-US-AlonsoNeural', displayName: 'Alonso', gender: 'male' },
        ]
    },
    {
        code: 'pt-BR',
        name: 'Portuguese (Brazil)',
        nativeName: 'Português (Brasil)',
        flag: '🇧🇷',
        region: 'Americas',
        voices: [
            { id: 'pt-BR-FranciscaNeural', name: 'pt-BR-FranciscaNeural', displayName: 'Francisca', gender: 'female', isDefault: true },
            { id: 'pt-BR-AntonioNeural', name: 'pt-BR-AntonioNeural', displayName: 'Antonio', gender: 'male' },
            { id: 'pt-BR-ThalitaNeural', name: 'pt-BR-ThalitaNeural', displayName: 'Thalita', gender: 'female' },
        ]
    },
    {
        code: 'fr-CA',
        name: 'French (Canada)',
        nativeName: 'Français (Canada)',
        flag: '🇨🇦',
        region: 'Americas',
        voices: [
            { id: 'fr-CA-SylvieNeural', name: 'fr-CA-SylvieNeural', displayName: 'Sylvie', gender: 'female', isDefault: true },
            { id: 'fr-CA-JeanNeural', name: 'fr-CA-JeanNeural', displayName: 'Jean', gender: 'male' },
            { id: 'fr-CA-AntoineNeural', name: 'fr-CA-AntoineNeural', displayName: 'Antoine', gender: 'male' },
        ]
    },

    // ==================== EUROPE ====================
    {
        code: 'en-GB',
        name: 'English (UK)',
        nativeName: 'English',
        flag: '🇬🇧',
        region: 'Europe',
        voices: [
            { id: 'en-GB-SoniaNeural', name: 'en-GB-SoniaNeural', displayName: 'Sonia', gender: 'female', isDefault: true },
            { id: 'en-GB-RyanNeural', name: 'en-GB-RyanNeural', displayName: 'Ryan', gender: 'male' },
            { id: 'en-GB-LibbyNeural', name: 'en-GB-LibbyNeural', displayName: 'Libby', gender: 'female' },
        ]
    },
    {
        code: 'es-ES',
        name: 'Spanish (Spain)',
        nativeName: 'Español (España)',
        flag: '🇪🇸',
        region: 'Europe',
        voices: [
            { id: 'es-ES-ElviraNeural', name: 'es-ES-ElviraNeural', displayName: 'Elvira', gender: 'female', isDefault: true },
            { id: 'es-ES-AlvaroNeural', name: 'es-ES-AlvaroNeural', displayName: 'Alvaro', gender: 'male' },
            { id: 'es-ES-AbrilNeural', name: 'es-ES-AbrilNeural', displayName: 'Abril', gender: 'female' },
        ]
    },
    {
        code: 'fr-FR',
        name: 'French (France)',
        nativeName: 'Français',
        flag: '🇫🇷',
        region: 'Europe',
        voices: [
            { id: 'fr-FR-DeniseNeural', name: 'fr-FR-DeniseNeural', displayName: 'Denise', gender: 'female', isDefault: true },
            { id: 'fr-FR-HenriNeural', name: 'fr-FR-HenriNeural', displayName: 'Henri', gender: 'male' },
            { id: 'fr-FR-BrigitteNeural', name: 'fr-FR-BrigitteNeural', displayName: 'Brigitte', gender: 'female' },
        ]
    },
    {
        code: 'de-DE',
        name: 'German',
        nativeName: 'Deutsch',
        flag: '🇩🇪',
        region: 'Europe',
        voices: [
            { id: 'de-DE-KatjaNeural', name: 'de-DE-KatjaNeural', displayName: 'Katja', gender: 'female', isDefault: true },
            { id: 'de-DE-ConradNeural', name: 'de-DE-ConradNeural', displayName: 'Conrad', gender: 'male' },
            { id: 'de-DE-AmalaNeural', name: 'de-DE-AmalaNeural', displayName: 'Amala', gender: 'female' },
        ]
    },
    {
        code: 'it-IT',
        name: 'Italian',
        nativeName: 'Italiano',
        flag: '🇮🇹',
        region: 'Europe',
        voices: [
            { id: 'it-IT-ElsaNeural', name: 'it-IT-ElsaNeural', displayName: 'Elsa', gender: 'female', isDefault: true },
            { id: 'it-IT-DiegoNeural', name: 'it-IT-DiegoNeural', displayName: 'Diego', gender: 'male' },
            { id: 'it-IT-IsabellaNeural', name: 'it-IT-IsabellaNeural', displayName: 'Isabella', gender: 'female' },
        ]
    },
    {
        code: 'pt-PT',
        name: 'Portuguese (Portugal)',
        nativeName: 'Português',
        flag: '🇵🇹',
        region: 'Europe',
        voices: [
            { id: 'pt-PT-RaquelNeural', name: 'pt-PT-RaquelNeural', displayName: 'Raquel', gender: 'female', isDefault: true },
            { id: 'pt-PT-DuarteNeural', name: 'pt-PT-DuarteNeural', displayName: 'Duarte', gender: 'male' },
        ]
    },
    {
        code: 'nl-NL',
        name: 'Dutch',
        nativeName: 'Nederlands',
        flag: '🇳🇱',
        region: 'Europe',
        voices: [
            { id: 'nl-NL-ColetteNeural', name: 'nl-NL-ColetteNeural', displayName: 'Colette', gender: 'female', isDefault: true },
            { id: 'nl-NL-MaartenNeural', name: 'nl-NL-MaartenNeural', displayName: 'Maarten', gender: 'male' },
        ]
    },
    {
        code: 'pl-PL',
        name: 'Polish',
        nativeName: 'Polski',
        flag: '🇵🇱',
        region: 'Europe',
        voices: [
            { id: 'pl-PL-AgnieszkaNeural', name: 'pl-PL-AgnieszkaNeural', displayName: 'Agnieszka', gender: 'female', isDefault: true },
            { id: 'pl-PL-MarekNeural', name: 'pl-PL-MarekNeural', displayName: 'Marek', gender: 'male' },
        ]
    },
    {
        code: 'sv-SE',
        name: 'Swedish',
        nativeName: 'Svenska',
        flag: '🇸🇪',
        region: 'Europe',
        voices: [
            { id: 'sv-SE-SofieNeural', name: 'sv-SE-SofieNeural', displayName: 'Sofie', gender: 'female', isDefault: true },
            { id: 'sv-SE-MattiasNeural', name: 'sv-SE-MattiasNeural', displayName: 'Mattias', gender: 'male' },
        ]
    },
    {
        code: 'nb-NO',
        name: 'Norwegian',
        nativeName: 'Norsk',
        flag: '🇳🇴',
        region: 'Europe',
        voices: [
            { id: 'nb-NO-PernilleNeural', name: 'nb-NO-PernilleNeural', displayName: 'Pernille', gender: 'female', isDefault: true },
            { id: 'nb-NO-FinnNeural', name: 'nb-NO-FinnNeural', displayName: 'Finn', gender: 'male' },
        ]
    },
    {
        code: 'da-DK',
        name: 'Danish',
        nativeName: 'Dansk',
        flag: '🇩🇰',
        region: 'Europe',
        voices: [
            { id: 'da-DK-ChristelNeural', name: 'da-DK-ChristelNeural', displayName: 'Christel', gender: 'female', isDefault: true },
            { id: 'da-DK-JeppeNeural', name: 'da-DK-JeppeNeural', displayName: 'Jeppe', gender: 'male' },
        ]
    },
    {
        code: 'fi-FI',
        name: 'Finnish',
        nativeName: 'Suomi',
        flag: '🇫🇮',
        region: 'Europe',
        voices: [
            { id: 'fi-FI-NooraNeural', name: 'fi-FI-NooraNeural', displayName: 'Noora', gender: 'female', isDefault: true },
            { id: 'fi-FI-HarriNeural', name: 'fi-FI-HarriNeural', displayName: 'Harri', gender: 'male' },
        ]
    },
    {
        code: 'ru-RU',
        name: 'Russian',
        nativeName: 'Русский',
        flag: '🇷🇺',
        region: 'Europe',
        voices: [
            { id: 'ru-RU-SvetlanaNeural', name: 'ru-RU-SvetlanaNeural', displayName: 'Svetlana', gender: 'female', isDefault: true },
            { id: 'ru-RU-DmitryNeural', name: 'ru-RU-DmitryNeural', displayName: 'Dmitry', gender: 'male' },
        ]
    },
    {
        code: 'uk-UA',
        name: 'Ukrainian',
        nativeName: 'Українська',
        flag: '🇺🇦',
        region: 'Europe',
        voices: [
            { id: 'uk-UA-PolinaNeural', name: 'uk-UA-PolinaNeural', displayName: 'Polina', gender: 'female', isDefault: true },
            { id: 'uk-UA-OstapNeural', name: 'uk-UA-OstapNeural', displayName: 'Ostap', gender: 'male' },
        ]
    },
    {
        code: 'cs-CZ',
        name: 'Czech',
        nativeName: 'Čeština',
        flag: '🇨🇿',
        region: 'Europe',
        voices: [
            { id: 'cs-CZ-VlastaNeural', name: 'cs-CZ-VlastaNeural', displayName: 'Vlasta', gender: 'female', isDefault: true },
            { id: 'cs-CZ-AntoninNeural', name: 'cs-CZ-AntoninNeural', displayName: 'Antonín', gender: 'male' },
        ]
    },
    {
        code: 'el-GR',
        name: 'Greek',
        nativeName: 'Ελληνικά',
        flag: '🇬🇷',
        region: 'Europe',
        voices: [
            { id: 'el-GR-AthinaNeural', name: 'el-GR-AthinaNeural', displayName: 'Athina', gender: 'female', isDefault: true },
            { id: 'el-GR-NestorasNeural', name: 'el-GR-NestorasNeural', displayName: 'Nestoras', gender: 'male' },
        ]
    },

    // ==================== ASIA-PACIFIC ====================
    {
        code: 'zh-CN',
        name: 'Chinese (Mandarin)',
        nativeName: '中文 (普通话)',
        flag: '🇨🇳',
        region: 'Asia-Pacific',
        voices: [
            { id: 'zh-CN-XiaoxiaoNeural', name: 'zh-CN-XiaoxiaoNeural', displayName: 'Xiaoxiao', gender: 'female', isDefault: true },
            { id: 'zh-CN-YunxiNeural', name: 'zh-CN-YunxiNeural', displayName: 'Yunxi', gender: 'male' },
            { id: 'zh-CN-YunyangNeural', name: 'zh-CN-YunyangNeural', displayName: 'Yunyang', gender: 'male' },
        ]
    },
    {
        code: 'zh-TW',
        name: 'Chinese (Taiwan)',
        nativeName: '中文 (台灣)',
        flag: '🇹🇼',
        region: 'Asia-Pacific',
        voices: [
            { id: 'zh-TW-HsiaoChenNeural', name: 'zh-TW-HsiaoChenNeural', displayName: 'HsiaoChen', gender: 'female', isDefault: true },
            { id: 'zh-TW-YunJheNeural', name: 'zh-TW-YunJheNeural', displayName: 'YunJhe', gender: 'male' },
        ]
    },
    {
        code: 'zh-HK',
        name: 'Chinese (Cantonese)',
        nativeName: '中文 (粵語)',
        flag: '🇭🇰',
        region: 'Asia-Pacific',
        voices: [
            { id: 'zh-HK-HiuMaanNeural', name: 'zh-HK-HiuMaanNeural', displayName: 'HiuMaan', gender: 'female', isDefault: true },
            { id: 'zh-HK-WanLungNeural', name: 'zh-HK-WanLungNeural', displayName: 'WanLung', gender: 'male' },
        ]
    },
    {
        code: 'ja-JP',
        name: 'Japanese',
        nativeName: '日本語',
        flag: '🇯🇵',
        region: 'Asia-Pacific',
        voices: [
            { id: 'ja-JP-NanamiNeural', name: 'ja-JP-NanamiNeural', displayName: 'Nanami', gender: 'female', isDefault: true },
            { id: 'ja-JP-KeitaNeural', name: 'ja-JP-KeitaNeural', displayName: 'Keita', gender: 'male' },
            { id: 'ja-JP-AoiNeural', name: 'ja-JP-AoiNeural', displayName: 'Aoi', gender: 'female' },
        ]
    },
    {
        code: 'ko-KR',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷',
        region: 'Asia-Pacific',
        voices: [
            { id: 'ko-KR-SunHiNeural', name: 'ko-KR-SunHiNeural', displayName: 'SunHi', gender: 'female', isDefault: true },
            { id: 'ko-KR-InJoonNeural', name: 'ko-KR-InJoonNeural', displayName: 'InJoon', gender: 'male' },
        ]
    },
    {
        code: 'hi-IN',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        flag: '🇮🇳',
        region: 'Asia-Pacific',
        voices: [
            { id: 'hi-IN-SwaraNeural', name: 'hi-IN-SwaraNeural', displayName: 'Swara', gender: 'female', isDefault: true },
            { id: 'hi-IN-MadhurNeural', name: 'hi-IN-MadhurNeural', displayName: 'Madhur', gender: 'male' },
        ]
    },
    {
        code: 'en-IN',
        name: 'English (India)',
        nativeName: 'English',
        flag: '🇮🇳',
        region: 'Asia-Pacific',
        voices: [
            { id: 'en-IN-NeerjaNeural', name: 'en-IN-NeerjaNeural', displayName: 'Neerja', gender: 'female', isDefault: true },
            { id: 'en-IN-PrabhatNeural', name: 'en-IN-PrabhatNeural', displayName: 'Prabhat', gender: 'male' },
        ]
    },
    {
        code: 'th-TH',
        name: 'Thai',
        nativeName: 'ไทย',
        flag: '🇹🇭',
        region: 'Asia-Pacific',
        voices: [
            { id: 'th-TH-PremwadeeNeural', name: 'th-TH-PremwadeeNeural', displayName: 'Premwadee', gender: 'female', isDefault: true },
            { id: 'th-TH-NiwatNeural', name: 'th-TH-NiwatNeural', displayName: 'Niwat', gender: 'male' },
        ]
    },
    {
        code: 'vi-VN',
        name: 'Vietnamese',
        nativeName: 'Tiếng Việt',
        flag: '🇻🇳',
        region: 'Asia-Pacific',
        voices: [
            { id: 'vi-VN-HoaiMyNeural', name: 'vi-VN-HoaiMyNeural', displayName: 'HoaiMy', gender: 'female', isDefault: true },
            { id: 'vi-VN-NamMinhNeural', name: 'vi-VN-NamMinhNeural', displayName: 'NamMinh', gender: 'male' },
        ]
    },
    {
        code: 'id-ID',
        name: 'Indonesian',
        nativeName: 'Bahasa Indonesia',
        flag: '🇮🇩',
        region: 'Asia-Pacific',
        voices: [
            { id: 'id-ID-GadisNeural', name: 'id-ID-GadisNeural', displayName: 'Gadis', gender: 'female', isDefault: true },
            { id: 'id-ID-ArdiNeural', name: 'id-ID-ArdiNeural', displayName: 'Ardi', gender: 'male' },
        ]
    },
    {
        code: 'ms-MY',
        name: 'Malay',
        nativeName: 'Bahasa Melayu',
        flag: '🇲🇾',
        region: 'Asia-Pacific',
        voices: [
            { id: 'ms-MY-YasminNeural', name: 'ms-MY-YasminNeural', displayName: 'Yasmin', gender: 'female', isDefault: true },
            { id: 'ms-MY-OsmanNeural', name: 'ms-MY-OsmanNeural', displayName: 'Osman', gender: 'male' },
        ]
    },
    {
        code: 'fil-PH',
        name: 'Filipino',
        nativeName: 'Filipino',
        flag: '🇵🇭',
        region: 'Asia-Pacific',
        voices: [
            { id: 'fil-PH-BlessicaNeural', name: 'fil-PH-BlessicaNeural', displayName: 'Blessica', gender: 'female', isDefault: true },
            { id: 'fil-PH-AngeloNeural', name: 'fil-PH-AngeloNeural', displayName: 'Angelo', gender: 'male' },
        ]
    },
    {
        code: 'en-AU',
        name: 'English (Australia)',
        nativeName: 'English',
        flag: '🇦🇺',
        region: 'Asia-Pacific',
        voices: [
            { id: 'en-AU-NatashaNeural', name: 'en-AU-NatashaNeural', displayName: 'Natasha', gender: 'female', isDefault: true },
            { id: 'en-AU-WilliamNeural', name: 'en-AU-WilliamNeural', displayName: 'William', gender: 'male' },
        ]
    },

    // ==================== MIDDLE EAST & AFRICA ====================
    {
        code: 'ar-SA',
        name: 'Arabic (Saudi)',
        nativeName: 'العربية',
        flag: '🇸🇦',
        region: 'Middle East & Africa',
        voices: [
            { id: 'ar-SA-ZariyahNeural', name: 'ar-SA-ZariyahNeural', displayName: 'Zariyah', gender: 'female', isDefault: true },
            { id: 'ar-SA-HamedNeural', name: 'ar-SA-HamedNeural', displayName: 'Hamed', gender: 'male' },
        ]
    },
    {
        code: 'ar-EG',
        name: 'Arabic (Egypt)',
        nativeName: 'العربية (مصر)',
        flag: '🇪🇬',
        region: 'Middle East & Africa',
        voices: [
            { id: 'ar-EG-SalmaNeural', name: 'ar-EG-SalmaNeural', displayName: 'Salma', gender: 'female', isDefault: true },
            { id: 'ar-EG-ShakirNeural', name: 'ar-EG-ShakirNeural', displayName: 'Shakir', gender: 'male' },
        ]
    },
    {
        code: 'ar-AE',
        name: 'Arabic (UAE)',
        nativeName: 'العربية (الإمارات)',
        flag: '🇦🇪',
        region: 'Middle East & Africa',
        voices: [
            { id: 'ar-AE-FatimaNeural', name: 'ar-AE-FatimaNeural', displayName: 'Fatima', gender: 'female', isDefault: true },
            { id: 'ar-AE-HamdanNeural', name: 'ar-AE-HamdanNeural', displayName: 'Hamdan', gender: 'male' },
        ]
    },
    {
        code: 'he-IL',
        name: 'Hebrew',
        nativeName: 'עברית',
        flag: '🇮🇱',
        region: 'Middle East & Africa',
        voices: [
            { id: 'he-IL-HilaNeural', name: 'he-IL-HilaNeural', displayName: 'Hila', gender: 'female', isDefault: true },
            { id: 'he-IL-AvriNeural', name: 'he-IL-AvriNeural', displayName: 'Avri', gender: 'male' },
        ]
    },
    {
        code: 'tr-TR',
        name: 'Turkish',
        nativeName: 'Türkçe',
        flag: '🇹🇷',
        region: 'Middle East & Africa',
        voices: [
            { id: 'tr-TR-EmelNeural', name: 'tr-TR-EmelNeural', displayName: 'Emel', gender: 'female', isDefault: true },
            { id: 'tr-TR-AhmetNeural', name: 'tr-TR-AhmetNeural', displayName: 'Ahmet', gender: 'male' },
        ]
    },
    {
        code: 'af-ZA',
        name: 'Afrikaans',
        nativeName: 'Afrikaans',
        flag: '🇿🇦',
        region: 'Middle East & Africa',
        voices: [
            { id: 'af-ZA-AdriNeural', name: 'af-ZA-AdriNeural', displayName: 'Adri', gender: 'female', isDefault: true },
            { id: 'af-ZA-WillemNeural', name: 'af-ZA-WillemNeural', displayName: 'Willem', gender: 'male' },
        ]
    },
    {
        code: 'sw-KE',
        name: 'Swahili',
        nativeName: 'Kiswahili',
        flag: '🇰🇪',
        region: 'Middle East & Africa',
        voices: [
            { id: 'sw-KE-ZuriNeural', name: 'sw-KE-ZuriNeural', displayName: 'Zuri', gender: 'female', isDefault: true },
            { id: 'sw-KE-RafikiNeural', name: 'sw-KE-RafikiNeural', displayName: 'Rafiki', gender: 'male' },
        ]
    },
];

// Get all unique regions for grouping
export const LANGUAGE_REGIONS = [...new Set(SUPPORTED_LANGUAGES.map(l => l.region))];

// Helper functions

/**
 * Get a language configuration by code
 */
export function getLanguageByCode(code: string): LanguageConfig | undefined {
    return SUPPORTED_LANGUAGES.find(l => l.code === code);
}

/**
 * Get the default voice for a language
 */
export function getDefaultVoice(languageCode: string): VoiceConfig | undefined {
    const language = getLanguageByCode(languageCode);
    if (!language) return undefined;
    return language.voices.find(v => v.isDefault) || language.voices[0];
}

/**
 * Get all voices for a language
 */
export function getVoicesForLanguage(languageCode: string): VoiceConfig[] {
    const language = getLanguageByCode(languageCode);
    return language?.voices || [];
}

/**
 * Get languages grouped by region
 */
export function getLanguagesByRegion(): Record<string, LanguageConfig[]> {
    return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
        if (!acc[lang.region]) acc[lang.region] = [];
        acc[lang.region].push(lang);
        return acc;
    }, {} as Record<string, LanguageConfig[]>);
}

/**
 * Detect the best matching language from browser locale
 */
export function detectBrowserLanguage(): string {
    // Try to get browser language
    const browserLang = navigator.language || (navigator as unknown as { userLanguage?: string }).userLanguage || 'en-US';
    
    // First, try exact match
    const exactMatch = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase() === browserLang.toLowerCase());
    if (exactMatch) return exactMatch.code;
    
    // Try matching just the language part (e.g., 'es' from 'es-419')
    const langPart = browserLang.split('-')[0].toLowerCase();
    
    // Priority order for partial matches (prefer more common variants)
    const priorityMap: Record<string, string> = {
        'en': 'en-US',
        'es': 'es-MX',  // Mexico is most common Spanish variant
        'pt': 'pt-BR',  // Brazil is most common Portuguese variant
        'zh': 'zh-CN',  // Simplified Chinese is most common
        'ar': 'ar-SA',  // Saudi Arabia for Arabic
        'fr': 'fr-FR',  // France French
        'de': 'de-DE',
        'it': 'it-IT',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
    };
    
    if (priorityMap[langPart]) {
        return priorityMap[langPart];
    }
    
    // Find first language that starts with the language part
    const partialMatch = SUPPORTED_LANGUAGES.find(l => l.code.toLowerCase().startsWith(langPart + '-'));
    if (partialMatch) return partialMatch.code;
    
    // Default to US English
    return 'en-US';
}

/**
 * Get sample greeting text for a language (for voice preview)
 */
export function getGreeting(languageCode: string): string {
    const greetings: Record<string, string> = {
        'en-US': "Hello, I'm your assistant. How can I help you today?",
        'en-GB': "Hello, I'm your assistant. How may I help you today?",
        'en-CA': "Hello, I'm your assistant. How can I help you today?",
        'en-AU': "G'day, I'm your assistant. How can I help you today?",
        'en-IN': "Hello, I'm your assistant. How can I help you today?",
        'es-CO': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-MX': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-ES': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-AR': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-CL': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-PE': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'es-US': "Hola, soy tu asistente. ¿Cómo puedo ayudarte hoy?",
        'pt-BR': "Olá, sou seu assistente. Como posso ajudar você hoje?",
        'pt-PT': "Olá, sou o seu assistente. Como posso ajudá-lo hoje?",
        'fr-FR': "Bonjour, je suis votre assistant. Comment puis-je vous aider aujourd'hui?",
        'fr-CA': "Bonjour, je suis votre assistant. Comment puis-je vous aider aujourd'hui?",
        'de-DE': "Hallo, ich bin Ihr Assistent. Wie kann ich Ihnen heute helfen?",
        'it-IT': "Ciao, sono il tuo assistente. Come posso aiutarti oggi?",
        'nl-NL': "Hallo, ik ben uw assistent. Hoe kan ik u vandaag helpen?",
        'pl-PL': "Cześć, jestem twoim asystentem. Jak mogę ci dzisiaj pomóc?",
        'sv-SE': "Hej, jag är din assistent. Hur kan jag hjälpa dig idag?",
        'nb-NO': "Hei, jeg er din assistent. Hvordan kan jeg hjelpe deg i dag?",
        'da-DK': "Hej, jeg er din assistent. Hvordan kan jeg hjælpe dig i dag?",
        'fi-FI': "Hei, olen avustajasi. Miten voin auttaa sinua tänään?",
        'ru-RU': "Здравствуйте, я ваш помощник. Чем могу помочь сегодня?",
        'uk-UA': "Привіт, я ваш помічник. Чим можу допомогти сьогодні?",
        'cs-CZ': "Dobrý den, jsem váš asistent. Jak vám mohu dnes pomoci?",
        'el-GR': "Γεια σας, είμαι ο βοηθός σας. Πώς μπορώ να σας βοηθήσω σήμερα;",
        'zh-CN': "您好，我是您的助手。今天有什么可以帮您的吗？",
        'zh-TW': "您好，我是您的助理。今天有什麼可以幫您的嗎？",
        'zh-HK': "你好，我係你嘅助理。今日有咩可以幫到你？",
        'ja-JP': "こんにちは、私はあなたのアシスタントです。今日はどのようにお手伝いできますか？",
        'ko-KR': "안녕하세요, 저는 당신의 어시스턴트입니다. 오늘 무엇을 도와드릴까요?",
        'hi-IN': "नमस्ते, मैं आपका सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?",
        'th-TH': "สวัสดีครับ ผมเป็นผู้ช่วยของคุณ วันนี้ผมช่วยอะไรคุณได้บ้างครับ?",
        'vi-VN': "Xin chào, tôi là trợ lý của bạn. Hôm nay tôi có thể giúp gì cho bạn?",
        'id-ID': "Halo, saya asisten Anda. Ada yang bisa saya bantu hari ini?",
        'ms-MY': "Hai, saya pembantu anda. Bagaimana saya boleh membantu anda hari ini?",
        'fil-PH': "Kumusta, ako ang iyong assistant. Paano kita matutulungan ngayon?",
        'ar-SA': "مرحباً، أنا مساعدك. كيف يمكنني مساعدتك اليوم؟",
        'ar-EG': "أهلاً، أنا مساعدك. كيف أقدر أساعدك النهاردة؟",
        'ar-AE': "مرحبا، أنا مساعدك. كيف يمكنني مساعدتك اليوم؟",
        'he-IL': "שלום, אני העוזר שלך. איך אני יכול לעזור לך היום?",
        'tr-TR': "Merhaba, ben asistanınızım. Bugün size nasıl yardımcı olabilirim?",
        'af-ZA': "Hallo, ek is jou assistent. Hoe kan ek jou vandag help?",
        'sw-KE': "Habari, mimi ni msaidizi wako. Ninawezaje kukusaidia leo?",
    };
    
    return greetings[languageCode] || greetings['en-US'];
}

/**
 * Check if a language code represents English
 */
export function isEnglish(languageCode: string): boolean {
    return languageCode.startsWith('en-');
}
