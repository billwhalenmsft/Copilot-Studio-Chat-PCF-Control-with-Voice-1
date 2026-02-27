# Copilot Studio Chat PCF Control with Voice

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Power Platform](https://img.shields.io/badge/Power%20Platform-PCF-purple.svg)](https://docs.microsoft.com/en-us/powerapps/developer/component-framework/overview)

> ⚠️ **DISCLAIMER**: This repository is provided for **demonstration and educational purposes only**. It is not an officially supported Microsoft product. Use of this code is at your own risk. Microsoft makes no warranties, express or implied, and assumes no liability for any issues arising from the use of this repository in production environments.

A Power Apps Component Framework (PCF) control that enables rich chat experiences with Microsoft Copilot Studio, featuring voice input/output and adaptive card support.

## Features

- ✅ **Modern Chat UI** - Clean, responsive chat interface built with Fluent Design
- ✅ **Voice Input** - Speech-to-text using browser Web Speech API or Azure Speech Services
- ✅ **Voice Output** - Text-to-speech with Azure Neural Voices or OpenAI TTS
- ✅ **Adaptive Cards** - Support for rich interactive cards from Copilot Studio
- ✅ **Mobile Support** - Works on iOS, Android, and desktop browsers
- ✅ **Direct Line Integration** - Connects to Copilot Studio via Direct Line API
- ✅ **Driving Mode** - Hands-free operation for field workers (Beta)
- ✅ **Multi-Language Support** - 34 languages with native Azure Neural voices (Beta)
- ✅ **Admin/Debug Mode** - In-app debug logging panel for troubleshooting (Beta)

## Screenshots

<img width="588" height="813" alt="image" src="https://github.com/user-attachments/assets/c01e38c2-f3c8-46d6-8859-cc10bea05ae6" />
<img width="498" height="754" alt="image" src="https://github.com/user-attachments/assets/0b55532a-b4ec-4fc5-bafe-c08df28c0dd4" />
<img width="494" height="746" alt="image" src="https://github.com/user-attachments/assets/c7a195d8-e84a-433c-b481-071d57fe390c" />


## Prerequisites

- **Power Apps Environment** with PCF controls enabled
- **Microsoft Copilot Studio** bot with Web channel configured
- **Power Platform CLI** (`pac`) installed
- **Node.js** (v16 or higher) and npm
- **.NET Framework 4.8.1** or higher

### Optional

- **Azure Speech Service** (for premium neural voices)
- **Azure Subscription** (if using Azure Speech Service)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/microsoft/Copilot-Studio-Chat-PCF-Control-with-Voice.git
cd Copilot-Studio-Chat-PCF-Control-with-Voice
```

### 2. Install Dependencies

```bash
cd CopilotChatDirectLine
npm install
```

### 3. Build the Control

```bash
# Build the PCF control
npm run build

# Or use Power Platform CLI
pac pcf push --publisher-prefix YOUR_PREFIX
```

### 4. Configure Copilot Studio

1. Open your Copilot Studio bot
2. Go to **Settings** > **Channels**
3. Add **Web** channel (if not already added)
4. Copy the **Direct Line Secret** from Channel Security

### 5. Add Control to Canvas App

1. Open Power Apps Studio
2. Create or open a Canvas App
3. Go to **Insert** > **Get more components** > **Code components**
4. Select **Copilot Studio Chat** control
5. Add control to your screen
6. **Important: Set layout properties** (see below)
7. Configure properties:
   - **DirectLineSecret**: Your Direct Line secret
   - **DirectLineEndpoint**: Leave default (`https://directline.botframework.com/v3/directline`)

### 📐 Recommended Layout Settings

For optimal display, configure these layout properties on the control:

| Property | Setting |
|----------|---------|
| **Flexible height** | ✅ On |
| **Align in container** | Custom → **Stretch** |

This ensures the chat control:
- Fills its container properly
- Responds to dynamic content height (messages, cards)
- Works correctly in responsive layouts

For detailed deployment instructions, see the [Deployment Guide](CopilotChatDirectLine/DEPLOYMENT.md).

## Deploy Azure Resources (Optional)

The control supports Azure Speech Services (for premium neural voices) and Azure OpenAI (for natural-sounding TTS). You can provision both resources with a single click:

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fmicrosoft%2FCopilot-Studio-Chat-PCF-Control-with-Voice%2Fmain%2Fazuredeploy.json)

### What Gets Deployed

| Resource | Type | Purpose |
|----------|------|---------|
| `{prefix}-speech` | Azure Speech Services | Premium neural voice TTS and speech-to-text |
| `{prefix}-openai` | Azure OpenAI | Natural OpenAI TTS voices (echo, alloy, nova, etc.) |
| Model deployment | OpenAI model (gpt-4o-mini default) | Language model for TTS and chat capabilities |

### Deployment Steps

1. Click the **Deploy to Azure** button above
2. Sign in to your Azure subscription
3. Fill in the parameters:
   - **Resource Prefix**: A unique name prefix (e.g., `contoso`) — creates `contoso-speech` and `contoso-openai`
   - **Location**: Region for Speech Services (e.g., `eastus`)
   - **OpenAI Location**: Region for Azure OpenAI (e.g., `eastus2`)
   - **OpenAI Model**: Choose model (default: `gpt-4o-mini`)
   - **Speech Service SKU**: `F0` (free tier) or `S0` (standard)
4. Click **Review + Create**, then **Create**
5. Wait for deployment to complete (~2-3 minutes)
6. Go to **Outputs** tab and copy these values into your Dynamics 365 environment variables:

| Output | Environment Variable |
|--------|---------------------|
| `speechKey` | `bw_SpeechKey` |
| `speechRegion` | `bw_SpeechRegion` |
| `openAIEndpoint` | `bw_OpenAIEndpoint` |
| `openAIKey` | `bw_OpenAIKey` |
| `openAIDeploymentName` | `bw_OpenAIDeployment` |

### Manual Setup

If you prefer to create resources manually:

#### Azure Speech Service

1. Create an Azure Speech Service resource in the [Azure Portal](https://portal.azure.com)
2. Copy your **KEY** and **REGION** from Keys and Endpoint
3. Set environment variables:
   - **bw_SpeechKey**: Your Speech Service key
   - **bw_SpeechRegion**: Your region code (e.g., `eastus`)

#### Azure OpenAI TTS

1. Create an Azure OpenAI resource with a model deployed
2. Set environment variables:
   - **bw_OpenAIEndpoint**: Your Azure OpenAI endpoint URL
   - **bw_OpenAIKey**: Your Azure OpenAI API key
   - **bw_OpenAIDeployment**: Deployment name (default: `gpt-4o-mini`)

### Available Voice Profiles (English)

#### OpenAI TTS Voices (Natural)

| Profile | Voice | Style | Best For |
|---------|-------|-------|----------|
| `openai-echo` | Echo | Warm, conversational | Default - friendly interactions |
| `openai-alloy` | Alloy | Neutral, balanced | General purpose |
| `openai-fable` | Fable | Expressive, narrative | Storytelling |
| `openai-onyx` | Onyx | Deep, authoritative | Professional settings |
| `openai-nova` | Nova | Warm, friendly | Customer service |
| `openai-shimmer` | Shimmer | Clear, optimistic | Upbeat interactions |

#### Azure Neural Voices

| Profile | Voice | Style | Best For |
|---------|-------|-------|----------|
| `jenny-friendly` | Jenny | Friendly | Default, warm conversations |
| `jenny-customerservice` | Jenny | Customer Service | Professional support |
| `aria-customerservice` | Aria | Customer Service | Business interactions |
| `aria-empathetic` | Aria | Empathetic | Sensitive topics |
| `guy-friendly` | Guy | Friendly | Male voice option |
| `davis-chat` | Davis | Chat | Casual conversations |
| `sara-friendly` | Sara | Friendly | Alternative female voice |

## Multi-Language Support (Beta)

The Beta control supports 34 languages for both speech recognition and text-to-speech. Users can select their preferred language from the Settings panel.

### Supported Languages

| Region | Languages |
|--------|-----------|
| **Americas** | English (US, CA), Spanish (CO, MX, AR, CL, PE, US), Portuguese (BR), French (CA) |
| **Europe** | English (UK), Spanish (ES), French (FR), German, Italian, Portuguese (PT), Dutch, Polish, Swedish, Norwegian, Danish, Finnish, Russian, Ukrainian, Czech, Greek |
| **Asia** | Chinese (Simplified, Traditional, HK), Japanese, Korean, Hindi, Thai, Vietnamese, Indonesian, Malay, Filipino |
| **Middle East** | Arabic (SA, EG, AE), Hebrew, Turkish |
| **Africa** | Afrikaans, Swahili |

### Language Selection Priority

1. **User's saved preference** - Persisted in localStorage from Settings
2. **Admin-configured default** - Set via `DefaultLanguage` property
3. **Browser auto-detection** - Falls back to browser locale

### Configuration

Set a default language via the control property:
- **DefaultLanguage**: BCP-47 language code (e.g., `en-US`, `es-MX`, `fr-FR`)

## Admin/Debug Mode (Beta)

The Beta control includes an Admin Mode toggle that enables a debug logging panel for troubleshooting.

### Features

- 🐛 **Debug Panel** - Full-screen overlay showing timestamped log entries
- 📋 **Log Categories** - Filter by level (info, warn, error, debug) or category (speech, audio, console)
- 📧 **Email Logs** - One-click export to email for support escalation
- 📋 **Copy to Clipboard** - Export formatted logs for pasting
- 🔄 **Auto-capture** - Intercepts all console.log/warn/error calls
- 💾 **Persistent** - Stores up to 500 log entries

### Enabling Admin Mode

**Option 1: Settings Panel (User Toggle)**
1. Open the Settings panel (⚙️ button)
2. Scroll to the bottom
3. Toggle **🛠️ Admin Mode** on
4. A debug button (🐛) appears in the toolbar

**Option 2: Admin Property (Pre-configured)**
- Set `EnableDebugLog` property to `Yes` in the control configuration

### Security Note

The debug panel can capture sensitive information. Use only for development/troubleshooting.

## Security Best Practices

### Sensitive Properties

The following control properties contain sensitive credentials that are visible in the Power Apps maker portal:

| Property | Description |
|----------|-------------|
| `DirectLineSecret` | Direct Line Secret from Copilot Studio |
| `SpeechKey` | Azure Speech Service subscription key |
| `OpenAIKey` | Azure OpenAI API key |

### Recommendations for Production

1. **Environment Variables** - Store secrets as Power Platform Environment Variables, optionally linked to Azure Key Vault
2. **Dataverse Secure Columns** - Store secrets in Dataverse columns with column-level security
3. **Role-Based Access** - Limit maker portal access to authorized administrators only

> ⚠️ Property descriptions now include 🔐 SENSITIVE warnings to remind administrators.

## Project Structure

```
├── CopilotChatDirectLine/          # PCF Control Source
│   ├── CopilotChatBeta/           # Beta version (latest features)
│   ├── CopilotChatGA/             # General Availability (stable)
│   └── package.json
│
├── CopilotChatPCFControl/         # Solution Package
│   └── src/
```

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Security

See [SECURITY.md](SECURITY.md) for information about reporting security vulnerabilities.

## Support

For support options, see [SUPPORT.md](SUPPORT.md).

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
