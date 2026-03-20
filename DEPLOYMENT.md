# Copilot Chat PCF Control - Deployment Guide

## Prerequisites
- Node.js and npm installed
- .NET Framework 4.6.2+ installed  
- Power Platform CLI (`pac`) authenticated to your environment

## Version Files to Update
When releasing a new version, update these files **with the same version number**:

1. **Control Manifest** - `CopilotChatDirectLine/CopilotChatBeta/ControlManifest.Input.xml`
   - Update `version="X.X.X"` attribute in the `<control>` element
   - Update `default-value="X.X.X"` in the `ControlVersion` property
   - Update `description-key` in `ControlVersion` property

2. **Solution Manifest** - `CopilotChatDirectLine/Solutions/CopilotChatBetaSolution/src/Other/Solution.xml`
   - Update `<Version>X.X.X</Version>` element
   - **CRITICAL**: This version must be higher than the currently installed version

3. **index.ts** - `CopilotChatDirectLine/CopilotChatBeta/index.ts`
   - Update the version string in `getOutputs()` method

4. **Control.tsx** - `CopilotChatDirectLine/CopilotChatBeta/src/Control.tsx`
   - If adding/removing manifest properties, update the `ControlProps` interface to match

### Property Synchronization Rule
**Every property in ControlManifest.Input.xml MUST have a matching entry in the `ControlProps` interface in Control.tsx.** If they are out of sync, the control will crash with "This app ran into a problem."

## Clean Build (Recommended)
Before deploying, clean previous build artifacts:
```powershell
cd CopilotChatDirectLine
Remove-Item CopilotChatBeta\out -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item Solutions\CopilotChatBetaSolution\obj -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item Solutions\CopilotChatBetaSolution\bin -Recurse -Force -ErrorAction SilentlyContinue
```

## Build and Deploy Steps

### Step 1: Compile TypeScript to JavaScript
```powershell
cd CopilotChatDirectLine
npm run build
```
This compiles all TypeScript and bundles the control.

### Step 2: Build the PCF Project
```powershell
dotnet build CopilotChatBeta.pcfproj /p:Configuration=Release
```
This creates the control package.

### Step 3: Build the Solution Package
```powershell
cd Solutions/CopilotChatBetaSolution
dotnet build /p:Configuration=Release
```
This creates `bin/Release/CopilotChatBetaSolution.zip`.

### Step 4: Import to Power Platform
```powershell
pac solution import --path bin/Release/CopilotChatBetaSolution.zip --force-overwrite --publish-changes
```
The `--publish-changes` flag ensures the controls are immediately available.

### Step 5: Verify Deployment
```powershell
pac solution list | Select-String "CopilotStudio"
```
Should show the new version number.

## One-Liner for Full Deployment
From the `CopilotChatDirectLine` folder:
```powershell
npm run build; dotnet build CopilotChatBeta.pcfproj /p:Configuration=Release; cd Solutions/CopilotChatBetaSolution; dotnet build /p:Configuration=Release; pac solution import --path bin/Release/CopilotChatBetaSolution.zip --force-overwrite --publish-changes; pac solution list | Select-String "CopilotStudio"
```

## Troubleshooting

### "Solution Imported successfully" but version doesn't change
- Ensure `src/Other/Solution.xml` version matches the control version
- The solution version must be higher than what's installed

### Build fails with "directory in use"
- Close any open zip files or solution explorer
- Delete `obj/` folder: `Remove-Item obj -Recurse -Force`

### Control not updating in Power Apps
- Clear browser cache (Ctrl+Shift+R)
- Publish all customizations in Power Apps
- Wait 1-2 minutes for CDN propagation

## Configuration Values

| Property | Value |
|----------|-------|
| AuthMode | `Entra` or `Direct` |
| EntraClientId | Your Entra App Registration Client ID |
| EntraTenantId | Your Entra Tenant ID |
| EntraScope | `api://<YOUR_CLIENT_ID>/access_as_user` |
| BotId | Your Copilot Studio Bot ID (from Copilot Studio → Settings) |
| DirectLineSecret | Your Direct Line Secret (from Copilot Studio → Settings → Security) |
