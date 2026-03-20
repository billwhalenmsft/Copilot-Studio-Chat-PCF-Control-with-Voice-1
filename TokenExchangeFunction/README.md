# Token Exchange Function for Copilot Studio SSO

This Azure Function enables seamless Single Sign-On (SSO) for the Copilot Chat PCF Control in Power Apps Mobile (iOS/Android) and Web.

## Why This Is Needed

Power Apps Mobile has third-party cookie restrictions that prevent traditional OAuth popup/redirect flows from working reliably. The Token Exchange URL approach enables:

- ✅ **Seamless SSO** - No sign-in prompts for users already authenticated in Power Apps
- ✅ **Mobile Compatible** - Works on iOS and Android without device settings changes
- ✅ **Enterprise Ready** - Proper token validation for security

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Power Apps    │     │  Copilot Studio │     │ Token Exchange  │
│     Mobile      │────▶│      Bot        │────▶│    Function     │
│  (User Token)   │     │  (OAuthCard)    │     │   (Validate)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. User opens Power Apps (already authenticated)
2. PCF sends user's Entra token with messages
3. When bot needs auth, it calls Token Exchange URL
4. Function validates token against Entra ID
5. Bot receives validated user identity - no sign-in prompt!

## Deployment Steps

### 1. Deploy the Azure Function

```bash
# Navigate to this directory
cd TokenExchangeFunction

# Install dependencies
npm install

# Build TypeScript
npm run build

# Login to Azure
az login

# Create a resource group (if needed)
az group create --name rg-copilot-sso --location eastus

# Create the Function App
az functionapp create \
  --name copilot-token-exchange-<unique-suffix> \
  --storage-account <storage-account-name> \
  --consumption-plan-location eastus \
  --resource-group rg-copilot-sso \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4

# Deploy the function
func azure functionapp publish copilot-token-exchange-<unique-suffix>
```

### 2. Configure Function App Settings

In Azure Portal → Function App → Configuration → Application settings:

| Setting | Value |
|---------|-------|
| `ENTRA_CLIENT_ID` | Your Entra App Registration Client ID |
| `ENTRA_TENANT_ID` | Your Entra Tenant ID |

Or via CLI:
```bash
az functionapp config appsettings set \
  --name copilot-token-exchange-<unique-suffix> \
  --resource-group rg-copilot-sso \
  --settings ENTRA_CLIENT_ID=<YOUR_CLIENT_ID> ENTRA_TENANT_ID=<YOUR_TENANT_ID>
```

### 3. Get the Function URL

After deployment, get your function URL:
```
https://copilot-token-exchange-<unique-suffix>.azurewebsites.net/api/tokenexchange
```

### 4. Configure Copilot Studio

1. Go to **Copilot Studio** → Your Agent
2. **Settings** → **Security** → **Authentication**
3. In **Token exchange URL (required for SSO)**, enter your function URL:
   ```
   https://copilot-token-exchange-<unique-suffix>.azurewebsites.net/api/tokenexchange
   ```
4. Click **Save**

### 5. Test the Flow

1. Open Power Apps Mobile on iOS/Android
2. Navigate to your Model-Driven App with the PCF control
3. The control should:
   - NOT show a sign-in prompt
   - Automatically use the user's identity
   - Display the user's name in the chat

## Local Development

```bash
# Install dependencies
npm install

# Start the function locally
npm start

# The function will be available at:
# http://localhost:7071/api/tokenexchange
```

For local testing, you can use Postman or curl:
```bash
curl -X POST http://localhost:7071/api/tokenexchange \
  -H "Content-Type: application/json" \
  -d '{"token": "<your-entra-token>"}'
```

## Troubleshooting

### "Token validation failed: jwt expired"
The user's token has expired. Power Apps should provide a fresh token.

### "Token validation failed: jwt audience invalid"
The token was issued for a different app. Check that `ENTRA_CLIENT_ID` matches your App Registration.

### "Token validation failed: jwt issuer invalid"
The token is from a different tenant. Check that `ENTRA_TENANT_ID` is correct.

## Security Considerations

- The function uses `authLevel: "anonymous"` because Copilot Studio needs to call it server-to-server
- Token validation ensures only tokens from your tenant/app are accepted
- Consider adding Azure Front Door or API Management for additional protection in production
