/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    ControlVersion: ComponentFramework.PropertyTypes.StringProperty;
    AuthMode: ComponentFramework.PropertyTypes.StringProperty;
    DirectLineSecret: ComponentFramework.PropertyTypes.StringProperty;
    DirectLineEndpoint: ComponentFramework.PropertyTypes.StringProperty;
    EntraClientId: ComponentFramework.PropertyTypes.StringProperty;
    EntraTenantId: ComponentFramework.PropertyTypes.StringProperty;
    EntraScope: ComponentFramework.PropertyTypes.StringProperty;
    BotId: ComponentFramework.PropertyTypes.StringProperty;
    SpeechKey: ComponentFramework.PropertyTypes.StringProperty;
    SpeechRegion: ComponentFramework.PropertyTypes.StringProperty;
    OpenAIEndpoint: ComponentFramework.PropertyTypes.StringProperty;
    OpenAIKey: ComponentFramework.PropertyTypes.StringProperty;
    OpenAIDeployment: ComponentFramework.PropertyTypes.StringProperty;
    ModalTitle: ComponentFramework.PropertyTypes.StringProperty;
    EnableAttachments: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    AttachmentIcon: ComponentFramework.PropertyTypes.StringProperty;
    DefaultLanguage: ComponentFramework.PropertyTypes.StringProperty;
    EnableDebugLog: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    DebugLogEmail: ComponentFramework.PropertyTypes.StringProperty;
}
export interface IOutputs {
    Version?: string;
}
