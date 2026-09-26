// ==UserScript==
// @name         Video P2P Block
// @namespace    local.video.p2pblock
// @version      1.0
// @description  Block WebRTC P2P on selected video players/sites
// @match        https://player.bunny-frame.online/*
// @match        https://anilife01.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const page = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

    function BlockedRTCPeerConnection() {
        throw new Error('[P2P Block] RTCPeerConnection blocked');
    }

    function block(name) {
        try {
            Object.defineProperty(page, name, {
                configurable: false,
                writable: false,
                value: BlockedRTCPeerConnection
            });
            return;
        } catch {}

        try {
            page[name] = BlockedRTCPeerConnection;
        } catch {}
    }

    block('RTCPeerConnection');
    block('webkitRTCPeerConnection');
})();
