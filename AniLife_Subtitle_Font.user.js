// ==UserScript==
// @name         AniLife Subtitle Font
// @namespace    local.anilife.subtitle.font
// @version      1.0
// @description  Change AniLife Artplayer subtitle font while keeping player size/color controls
// @match        https://anilife01.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const STYLE_ID = '__anilife_subtitle_font_style';

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .art-subtitle,
            .art-subtitle * {
                font-family:
                    "Noto Sans KR",
                    "Noto Sans CJK KR",
                    "SamsungOneKorean",
                    "Samsung Sans",
                    system-ui,
                    sans-serif !important;
                font-weight: 600 !important;
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    if (document.documentElement) {
        injectStyle();
    } else {
        document.addEventListener('DOMContentLoaded', injectStyle, { once: true });
    }
})();
