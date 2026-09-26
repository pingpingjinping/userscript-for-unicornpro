// ==UserScript==
// @name         AniLife Subtitle Font
// @namespace    local.anilife.subtitle.font
// @version      1.4
// @description  Force a visible black outline and raise AniLife Artplayer subtitles
// @match        https://anilife01.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const SHADOW = [
        '-2px -2px 1px rgba(0,0,0,.98)',
        '0 -2px 1px rgba(0,0,0,.98)',
        '2px -2px 1px rgba(0,0,0,.98)',
        '-2px 0 1px rgba(0,0,0,.98)',
        '2px 0 1px rgba(0,0,0,.98)',
        '-2px 2px 1px rgba(0,0,0,.98)',
        '0 2px 1px rgba(0,0,0,.98)',
        '2px 2px 1px rgba(0,0,0,.98)'
    ].join(',');

    function forceStyle(el) {
        if (!el || !el.style) return;

        el.style.setProperty(
            'font-family',
            '"Noto Sans KR","Noto Sans CJK KR","SamsungOneKorean","Samsung Sans",system-ui,sans-serif',
            'important'
        );
        el.style.setProperty('font-weight', '600', 'important');
        el.style.setProperty('-webkit-text-stroke-width', '2px', 'important');
        el.style.setProperty('-webkit-text-stroke-color', 'rgba(0,0,0,.98)', 'important');
        el.style.setProperty('paint-order', 'stroke fill', 'important');
        el.style.setProperty('text-shadow', SHADOW, 'important');

        if (el.classList && el.classList.contains('art-subtitle')) {
            el.style.setProperty('transform', 'translateY(-32px)', 'important');
        }
    }

    function apply() {
        const nodes = document.querySelectorAll('.art-subtitle, .art-subtitle *');
        for (const el of nodes) forceStyle(el);
    }

    function start() {
        apply();
        setInterval(apply, 500);
    }

    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();
