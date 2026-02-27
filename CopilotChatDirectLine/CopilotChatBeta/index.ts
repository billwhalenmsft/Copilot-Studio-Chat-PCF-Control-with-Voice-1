/**
 * CopilotChatBeta - PCF Standard Control Entry Point
 * Beta v1.3.3 with Language Selection support
 */

import Control, { ControlProps } from './src/Control';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

// PCF Context interface
interface IOutputs {
    Version?: string;
}

interface Mode {
    trackContainerResize: (track: boolean) => void;
}

interface Context<T> {
    mode: Mode;
    parameters: T;
}

export class CopilotStudioChatBeta {
    private _container: HTMLDivElement | undefined;
    private _notifyOutputChanged: (() => void) | undefined;
    private _transcript: string = "";
    private _lastPropsKey: string = "";

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance.
     * @param context The entire property bag available to control via Context Object
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready
     * @param state A piece of data that persists in one session for a single user
     * @param container The HTML container element for the control
     */
    init(
        context: Context<ControlProps>,
        notifyOutputChanged: () => void,
        state: unknown,
        container: HTMLDivElement
    ): void {
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;

        // Ensure the PCF container fills the allocated space in Canvas Apps
        container.style.width = '100%';
        container.style.height = '100%';

        // Request full container dimensions from the framework
        context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed.
     * @param context The entire property bag available to control via Context Object
     */
    updateView(context: Context<ControlProps>): void {
        // Skip redundant renders when raw prop values haven't changed
        const p = context.parameters;
        const propsKey = [
            p.AuthMode?.raw, p.DirectLineSecret?.raw?.substring(0, 10),
            p.DirectLineEndpoint?.raw, p.EntraClientId?.raw?.substring(0, 10),
            p.EntraTenantId?.raw, p.EntraScope?.raw, p.BotId?.raw
        ].join('|');
        if (propsKey === this._lastPropsKey) {
            return;
        }
        this._lastPropsKey = propsKey;

        const props = {
            callback: (transcript: string) => {
                this._transcript = transcript;
                this._notifyOutputChanged!();
            },
            context: context,
            ...context.parameters
        };
        
        ReactDOM.render(
            React.createElement(Control, props) as unknown as React.ReactElement,
            this._container as HTMLElement
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest
     */
    getOutputs(): IOutputs {
        return {
            Version: "1.5.7"
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree.
     */
    destroy(): void {
        if (this._container) {
            ReactDOM.unmountComponentAtNode(this._container);
        }
    }
}
