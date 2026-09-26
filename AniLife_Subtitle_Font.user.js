// ==UserScript==
// @name         AniLife Subtitle Font
// @namespace    local.anilife.subtitle.font
// @version      1.5
// @description  Force a visible black outline and raise AniLife subtitles only in fullscreen
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

    function forceTextStyle(el) {
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
    }

    function isFullscreen(player) {
        try {
            if (document.fullscreenElement || document.webkitFullscreenElement) return true;
        } catch {}

        if (player) {
            try {
                const classes = [...player.classList].join(' ').toLowerCase();
                if (classes.includes('fullscreen')) return true;
            } catch {}

            try {
                const r = player.getBoundingClientRect();
                const vw = window.innerWidth || document.documentElement.clientWidth || 0;
                const vh = window.innerHeight || document.documentElement.clientHeight || 0;

                if (
                    vw > 0 && vh > 0 &&
                    r.width >= vw * 0.90 &&
                    r.height >= vh * 0.80 &&
                    r.top <= vh * 0.08
                ) {
                    return true;
                }
            } catch {}
        }

        return false;
    }

    function apply() {
        const subtitle = document.querySelector('.art-subtitle');
        if (!subtitle) return;

        const player =
            subtitle.closest('.art-video-player') ||
            document.querySelector('.art-video-player');

        const fullscreen = isFullscreen(player);

        // Keep outline/font styling in both normal and fullscreen modes.
        forceTextStyle(subtitle);

        const lines = subtitle.querySelectorAll('.art-subtitle-line');

        for (const line of lines) {
            forceTextStyle(line);

            // Only move the rendered subtitle line in fullscreen.
            if (fullscreen) {
                line.style.setProperty('transform', 'translateY(-32px)', 'important');
            } else {
                line.style.removeProperty('transform');
            }
        }

        // Do not shift the subtitle container in normal mode.
        subtitle.style.removeProperty('transform');
        subtitle.style.removeProperty('bottom');
    }

    function start() {
        apply();

        // Re-apply because Artplayer can recreate or overwrite subtitle nodes/styles.
        setInterval(apply, 300);

        document.addEventListener('fullscreenchange', apply);
        document.addEventListener('webkitfullscreenchange', apply);
        window.addEventListener('resize', apply);
        window.addEventListener('orientationchange', apply);
    }

    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();
