// ==UserScript==
// @name         AniLife Subtitle Font
// @namespace    local.anilife.subtitle.font
// @version      1.1
// @description  Add a clear outline to AniLife Artplayer subtitles while keeping player size/color controls
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

                /* Keep the site's subtitle color/size, add only a strong black outline. */
                -webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.95) !important;
                paint-order: stroke fill !important;
                text-shadow:
                    -1px -1px 1px rgba(0,0,0,.95),
                     0   -1px 1px rgba(0,0,0,.95),
                     1px -1px 1px rgba(0,0,0,.95),
                    -1px  0   1px rgba(0,0,0,.95),
                     1px  0   1px rgba(0,0,0,.95),
                    -1px  1px 1px rgba(0,0,0,.95),
                     0    1px 1px rgba(0,0,0,.95),
                     1px  1px 1px rgba(0,0,0,.95) !important;
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
