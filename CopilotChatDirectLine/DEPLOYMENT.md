# Power Platform PCF Control Deployment Guide

This document describes how to build and deploy the Copilot Studio Chat PCF controls to Power Platform.

## Prerequisites

- **Power Platform CLI** (`pac`) - [Install Guide](https://docs.microsoft.com/en-us/power-platform/developer/cli/introduction)
- **Node.js** (v16+) and npm
- **.NET SDK** (6.0+)
- Power Platform environment with PCF controls enabled

## Solution Structure

```
CopilotChatDirectLine/
├── CopilotChatGA/              # GA (stable) control
├── CopilotChatBeta/            # Beta control with experimental features
├── Solutions/
│   └── CopilotChatBetaSolution/  # Power Platform solution project
│       ├── src/Other/Solution.xml
│       └── CopilotChatBetaSolution.cdsproj
```

## Publisher Information

| Property | Value |
|----------|-------|
| Publisher Name | BillWhalenSolutionEngineering |
| Publisher Prefix | bw |
| Customization Prefix | 94067 |

**Important:** The publisher must match what's already deployed to the target environment for solution upgrades to work.

---

## Build & Deploy Steps

### Step 1: Authenticate to Power Platform

```powershell
# List available environments
pac auth list

# Create new auth profile (if needed)
pac auth create --url https://YOUR-ORG.crm.dynamics.com

# Select existing profile
pac auth select --index 1
```

### Step 2: Build PCF Controls

```powershell
cd CopilotChatDirectLine

# Install dependencies (first time only)
npm install

# Build the controls
npm run build
```

### Step 3: Build Solution Package

```powershell
cd Solutions/CopilotChatBetaSolution

# Build the solution ZIP
dotnet build --configuration Release
```

The solution ZIP will be created at: `bin/Release/CopilotChatBetaSolution.zip`

### Step 4: Deploy to Power Platform

```powershell
# Import and publish the solution
pac solution import --path "bin\Release\CopilotChatBetaSolution.zip" --publish-changes --force-overwrite
```

### Step 5: Verify Deployment

```powershell
# List solutions to verify version
pac solution list | Select-String "CopilotStudioChat"
```

---

## Version Management

### Updating Versions

When making changes, update versions in these files:

1. **Control Manifest** (`CopilotChatBeta/ControlManifest.Input.xml`):
   ```xml
   <control ... version="1.4.5" ...>
   ```

2. **Solution XML** (`Solutions/CopilotChatBetaSolution/src/Other/Solution.xml`):
   ```xml
   <Version>1.4.5</Version>
   ```

**Note:** Both versions should match. Increment during each deployment for cache busting.

---

## Solution Configuration

### Solution.xml Key Settings

```xml
<ImportExportXml version="9.2.24054.197">
  <SolutionManifest>
    <UniqueName>CopilotStudioChatPCF</UniqueName>
    <LocalizedNames>
      <LocalizedName description="Copilot Studio Chat PCF Control" languagecode="1033" />
    </LocalizedNames>
    <Version>1.4.5</Version>
    <Managed>0</Managed>  <!-- 0 = Unmanaged -->
    <Publisher>
      <UniqueName>BillWhalenSolutionEngineering</UniqueName>
      <LocalizedNames>
        <LocalizedName description="Bill Whalen Solution Engineering" languagecode="1033" />
      </LocalizedNames>
      <CustomizationPrefix>bw</CustomizationPrefix>
      <CustomizationOptionValuePrefix>94067</CustomizationOptionValuePrefix>
    </Publisher>
  </SolutionManifest>
</ImportExportXml>
```

### cdsproj Key Settings

```xml
<PropertyGroup>
  <SolutionPackageType>Unmanaged</SolutionPackageType>
</PropertyGroup>
```

**Important:** If deploying to an environment with an existing unmanaged solution, the `SolutionPackageType` must be `Unmanaged`.

---

## Adding Control to Canvas App

### 1. Import Code Component

1. Open Power Apps Studio
2. Go to **Insert** → **Get more components** → **Code** tab
3. Select **CopilotStudioChatBeta** (or GA version)
4. Click **Import**

### 2. Add to Screen

1. From **Insert** → **Code components**, drag the control onto your screen
2. Position and size as needed

### 3. Recommended Layout Settings

For best display, set these properties on the control:

| Property | Value |
|----------|-------|
| **Flexible height** | On |
| **Align in container** | Custom → Stretch |

This ensures the chat control fills its container and responds to dynamic content height.

### 4. Configure Control Properties

**Required (Direct Mode):**
- `DirectLineSecret` - From Copilot Studio Web channel

**Required (Entra Mode):**
- `AuthMode` = "Entra"
- `EntraClientId` - App Registration Client ID
- `EntraTenantId` - Azure AD Tenant ID  
- `EntraScope` - API scope (e.g., `profile openid`)
- `BotId` - Copilot Studio Bot ID

**Optional:**
- `SpeechKey` / `SpeechRegion` - Azure Speech Service
- `OpenAIEndpoint` / `OpenAIKey` / `OpenAIDeployment` - Azure OpenAI TTS
- `DefaultLanguage` - e.g., "en-US", "es-MX"
- `EnableDebugLog` - Show debug panel
- `EnableAttachments` - Allow file uploads

---

## Troubleshooting

### "This app ran into a problem" Error

**Cause:** Manifest properties don't match what the code expects.

**Fix:** 
1. Compare `ControlManifest.Input.xml` with `Control.tsx` props interface
2. Ensure all props used in code have corresponding manifest entries
3. Rebuild and redeploy

### Publisher Mismatch Error

**Cause:** Solution publisher doesn't match existing deployed solution.

**Fix:**
1. Export existing solution to find publisher details:
   ```powershell
   pac solution export --name CopilotStudioChatPCF --path ./exported
   ```
2. Extract ZIP and check `Solution.xml` for publisher info
3. Update local `Solution.xml` to match

### Managed vs Unmanaged Conflict

**Cause:** Trying to import unmanaged over managed (or vice versa).

**Fix:**
1. Check existing solution type: `pac solution list`
2. Set matching `<SolutionPackageType>` in `.cdsproj`
3. Set matching `<Managed>` value in `Solution.xml` (0=Unmanaged, 1=Managed)

### Control Not Updating After Deploy

**Cause:** Browser/Power Apps caching.

**Fix:**
1. Increment version numbers in manifest and Solution.xml
2. Clear browser cache (Ctrl+Shift+Del)
3. In Power Apps: Remove control from screen, re-add from Code components

---

## Quick Reference Commands

```powershell
# Full rebuild and deploy from CopilotChatDirectLine folder
npm run build; `
cd Solutions/CopilotChatBetaSolution; `
dotnet build --configuration Release; `
pac solution import --path "bin\Release\CopilotChatBetaSolution.zip" --publish-changes --force-overwrite; `
pac solution list | Select-String "CopilotStudioChat"
```

```powershell
# Clean build (delete generated files first)
Remove-Item -Recurse -Force CopilotChatBeta/obj, CopilotChatBeta/generated, CopilotChatGA/obj, CopilotChatGA/generated -ErrorAction SilentlyContinue
npm run build
```

---

## Entra ID App Registration Setup

For Entra authentication mode, configure the **client** app registration:

### Required Settings

```powershell
# SPA Redirect URIs
https://YOUR-ORG.crm.dynamics.com/main.aspx
https://YOUR-ORG.crm.dynamics.com/

# Public Client Redirect URI
https://login.microsoftonline.com/common/oauth2/nativeclient

# Enable settings
isFallbackPublicClient = true
Implicit grant: ID tokens = enabled, Access tokens = enabled
```

### API Permissions

- Microsoft Graph → User.Read (delegated)

### PowerShell Commands

```powershell
# Update app registration via Graph API
$token = az account get-access-token --resource https://graph.microsoft.com --query accessToken -o tsv
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
$body = @{
    spa = @{ redirectUris = @("https://YOUR-ORG.crm.dynamics.com/main.aspx", "https://YOUR-ORG.crm.dynamics.com/") }
    publicClient = @{ redirectUris = @("https://login.microsoftonline.com/common/oauth2/nativeclient") }
    isFallbackPublicClient = $true
} | ConvertTo-Json -Depth 3
Invoke-RestMethod -Method PATCH -Uri "https://graph.microsoft.com/v1.0/applications(appId='YOUR-APP-ID')" -Headers $headers -Body $body
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.4.5 | 2026-02-19 | Entra auth session persistence (localStorage) |
| 1.4.4 | 2026-02-19 | Added EnableDebugLog, DebugLogEmail to Beta |
| 1.4.0 | 2026-02-19 | Added DefaultLanguage, EnableDebugLog to GA |
| 1.3.8 | - | Last stable GA release before Entra changes |
