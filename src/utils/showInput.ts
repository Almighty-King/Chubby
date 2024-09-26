import { createApp, nextTick } from 'vue';
import GlobalInput from '../components/GlobalInput.vue';
import { SHEET_X } from './const';

export default class ShowInput {
    private static instance: ShowInput | null = null;
    private app: ReturnType<typeof createApp> | null = null;
    private dom: HTMLElement | null = null;
    private isClosing: boolean = false;
    private onClose: (value: string) => void = () => {};

    private constructor() {}

    public static getInstance(): ShowInput {
        if (!ShowInput.instance) {
            ShowInput.instance = new ShowInput();
        }
        return ShowInput.instance;
    }

    public show(
        value: string,
        target: string,
        position: { x: number; y: number; width: number; height: number },
        onClose: (value: string) => void
    ) {
        this.cleanup();
        this.onClose = onClose;
        const dpr = window.devicePixelRatio || 1;
        this.dom = document.createElement('div');
        this.dom.id = 'globalInput';
        this.dom.style.position = 'absolute';
        this.dom.style.left = position.x + SHEET_X / dpr + 'px';
        this.dom.style.top = position.y + 'px';
        // this.dom.style.width = position.width + 'px';
        this.dom.style.height = position.height + 'px';

        const container = document.getElementById(target);

        if (!container) {
            return;
        }

        container.appendChild(this.dom);

        this.app = createApp(GlobalInput, {
            modelValue: value,
            height: position.height,
            width: position.width,
            onClose: this.handleClose.bind(this),
            onEnter: this.handleClose.bind(this)
        });

        nextTick(() => {
            if (this.app && this.dom) {
                this.app.mount(this.dom);
            }
        });

        this.isClosing = false;
    }

    private handleClose(value: string) {
        if (this.isClosing) return;
        this.isClosing = true;
        nextTick(() => {
            this.cleanup();
            this.onClose(value);
        });
    }

    private cleanup() {
        if (this.app) {
            this.app.unmount();
            this.app = null;
        }
        if (this.dom) {
            this.dom.remove();
            this.dom = null;
        }
    }
}
