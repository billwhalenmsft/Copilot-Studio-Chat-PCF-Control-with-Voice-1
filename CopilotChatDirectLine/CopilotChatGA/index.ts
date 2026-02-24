/**
 * CopilotChatGA - PCF Standard Control Entry Point
 * Stable v1.2.8 release
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

export class CopilotStudioChatGA {
    private _container: HTMLDivElement | undefined;
    private _notifyOutputChanged: (() => void) | undefined;
    private _transcript: string = "";

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
        // Request full container dimensions from the framework
        context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed.
     * @param context The entire property bag available to control via Context Object
     */
    updateView(context: Context<ControlProps>): void {
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
            Version: "1.4.0"
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
