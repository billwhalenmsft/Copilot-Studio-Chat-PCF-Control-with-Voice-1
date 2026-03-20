/**
 * Token Exchange Function for Copilot Studio SSO
 * 
 * This Azure Function validates Entra ID tokens for Copilot Studio.
 * Configure the URL in Copilot Studio → Settings → Security → Authentication → Token Exchange URL
 * 
 * Environment Variables Required:
 * - ENTRA_CLIENT_ID: Your App Registration Client ID
 * - ENTRA_TENANT_ID: Your Entra Tenant ID
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// Configuration from environment
const CLIENT_ID = process.env.ENTRA_CLIENT_ID || "";
const TENANT_ID = process.env.ENTRA_TENANT_ID || "";

// JWKS client for validating tokens
const jwks = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000 // 10 minutes
});

/**
 * Get the signing key from Microsoft's JWKS endpoint
 */
function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
    jwks.getSigningKey(header.kid, (err, key) => {
        if (err) {
            callback(err, undefined);
            return;
        }
        const signingKey = key?.getPublicKey();
        callback(null, signingKey);
    });
}

/**
 * Validate an Entra ID token
 */
async function validateToken(token: string): Promise<{ valid: boolean; payload?: jwt.JwtPayload; error?: string }> {
    return new Promise((resolve) => {
        const options: jwt.VerifyOptions = {
            audience: CLIENT_ID,
            issuer: [
                `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
                `https://sts.windows.net/${TENANT_ID}/`
            ],
            algorithms: ["RS256"]
        };

        jwt.verify(token, getKey, options, (err, decoded) => {
            if (err) {
                console.error("Token validation error:", err.message);
                resolve({ valid: false, error: err.message });
            } else {
                resolve({ valid: true, payload: decoded as jwt.JwtPayload });
            }
        });
    });
}

/**
 * Token Exchange HTTP Trigger
 * 
 * Copilot Studio calls this endpoint to validate tokens during SSO.
 * 
 * Request format (from Copilot Studio):
 * POST /api/tokenexchange
 * Content-Type: application/json
 * {
 *   "token": "<user's Entra ID token>",
 *   "connectionName": "<OAuth connection name from bot>",
 *   "userId": "<user ID>"
 * }
 * 
 * Response format:
 * 200 OK: { "token": "<validated token>" }
 * 400/401: { "error": "<error message>" }
 */
export async function tokenExchange(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Token exchange request received");

    // Validate configuration
    if (!CLIENT_ID || !TENANT_ID) {
        context.error("Missing configuration: ENTRA_CLIENT_ID or ENTRA_TENANT_ID");
        return {
            status: 500,
            jsonBody: { error: "Server configuration error" }
        };
    }

    try {
        // Parse request body
        const body = await request.json() as { token?: string; connectionName?: string; userId?: string };
        
        if (!body.token) {
            context.warn("No token provided in request");
            return {
                status: 400,
                jsonBody: { error: "Token is required" }
            };
        }

        context.log(`Validating token for connection: ${body.connectionName || "unknown"}`);

        // Validate the token
        const result = await validateToken(body.token);

        if (!result.valid) {
            context.warn(`Token validation failed: ${result.error}`);
            return {
                status: 401,
                jsonBody: { error: `Token validation failed: ${result.error}` }
            };
        }

        context.log(`Token validated successfully for user: ${result.payload?.sub || result.payload?.oid || "unknown"}`);

        // Return the validated token (Copilot Studio expects the same token back on success)
        return {
            status: 200,
            jsonBody: {
                token: body.token,
                // Include user info for the bot
                userId: result.payload?.sub || result.payload?.oid,
                userName: result.payload?.name,
                userEmail: result.payload?.preferred_username || result.payload?.email
            }
        };

    } catch (error) {
        context.error("Token exchange error:", error);
        return {
            status: 500,
            jsonBody: { error: "Internal server error" }
        };
    }
}

// Register the function
app.http("tokenexchange", {
    methods: ["POST"],
    authLevel: "anonymous", // Copilot Studio needs to call this without auth
    handler: tokenExchange
});
