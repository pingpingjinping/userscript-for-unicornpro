// ==UserScript==
// @name         P2P Detector - All Frames
// @namespace    local.p2pdetector
// @version      1.0
// @description  Detect WebRTC, DataChannel, WebSocket and iframe hosts
// @match        http://*/*
// @match        https://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const page = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

    const state = {
        rtc: 0,
        dataChannels: 0,
        websockets: 0,
        iframes: new Set(),
        lastText: ''
    };

    function buildText() {
        const frames = [...state.iframes];
        return (
            'P2P CHECK\n' +
            'HOST: ' + location.hostname + '\n' +
            'RTC: ' + state.rtc + '\n' +
            'DataChannel: ' + state.dataChannels + '\n' +
            'WebSocket: ' + state.websockets + '\n' +
            'iframe:\n' +
            (frames.length ? frames.join('\n') : '(없음)')
        );
    }

    function update() {
        const box = document.getElementById('__p2p_detector');
        if (!box) return;

        const text = buildText();
        if (text === state.lastText) return;

        state.lastText = text;
        box.textContent = text;
    }

    const NativeRTC =
        page.RTCPeerConnection ||
        page.webkitRTCPeerConnection;

    if (NativeRTC) {
        const WrappedRTC = new Proxy(NativeRTC, {
            construct(target, args, newTarget) {
                state.rtc++;

                const pc = Reflect.construct(target, args, newTarget);

                const original = pc.createDataChannel?.bind(pc);
                if (original) {
                    pc.createDataChannel = function (...a) {
                        state.dataChannels++;
                        update();
                        return original(...a);
                    };
                }

                update();
                return pc;
            }
        });

        try {
            page.RTCPeerConnection = WrappedRTC;
            if ('webkitRTCPeerConnection' in page) {
                page.webkitRTCPeerConnection = WrappedRTC;
            }
        } catch {}
    }

    const NativeWS = page.WebSocket;

    if (NativeWS) {
        page.WebSocket = new Proxy(NativeWS, {
            construct(target, args, newTarget) {
                state.websockets++;
                update();
                return Reflect.construct(target, args, newTarget);
            }
        });
    }

    function scanFrames() {
        let changed = false;

        for (const f of document.querySelectorAll('iframe')) {
            try {
                const src = f.src || f.getAttribute('src');
                if (!src) continue;

                const host = new URL(src, location.href).hostname;
                if (host && !state.iframes.has(host)) {
                    state.iframes.add(host);
                    changed = true;
                }
            } catch {}
        }

        if (changed) update();
    }

    function initUI() {
        if (!document.documentElement) return;
        if (document.getElementById('__p2p_detector')) return;

        const box = document.createElement('pre');
        box.id = '__p2p_detector';

        Object.assign(box.style, {
            position: 'fixed',
            zIndex: '2147483647',
            right: '8px',
            bottom: '8px',
            maxWidth: '80vw',
            maxHeight: '40vh',
            overflow: 'auto',
            margin: '0',
            padding: '8px',
            background: 'rgba(0,0,0,.82)',
            color: '#00ff80',
            font: '11px monospace',
            borderRadius: '7px',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap'
        });

        document.documentElement.appendChild(box);
        scanFrames();
        update();

        setInterval(scanFrames, 2000);
    }

    if (document.documentElement) {
        initUI();
    } else {
        document.addEventListener('DOMContentLoaded', initUI, { once: true });
    }
})();
