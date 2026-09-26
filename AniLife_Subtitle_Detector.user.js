// ==UserScript==
// @name         AniLife Subtitle Detector
// @namespace    local.anilife.subtitle.detector
// @version      1.0
// @description  Detect AniLife subtitle implementation (TextTrack/WebVTT/DOM captions)
// @match        https://anilife01.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const page = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
    const PANEL_ID = '__anilife_subtitle_detector';

    function short(s, n = 70) {
        s = String(s || '').replace(/\s+/g, ' ').trim();
        return s.length > n ? s.slice(0, n - 1) + '…' : s;
    }

    function describeElement(el) {
        if (!el) return '';
        let out = el.tagName ? el.tagName.toLowerCase() : '?';
        if (el.id) out += '#' + el.id;
        if (el.classList && el.classList.length) {
            out += '.' + [...el.classList].slice(0, 4).join('.');
        }
        const txt = short(el.textContent, 55);
        if (txt) out += ' → "' + txt + '"';
        return out;
    }

    function collect() {
        const videos = [...document.querySelectorAll('video')];
        const tracks = [...document.querySelectorAll('track')];

        const lines = [];
        lines.push('SUBTITLE CHECK');
        lines.push('HOST: ' + location.hostname);
        lines.push('Videos: ' + videos.length);
        lines.push('<track>: ' + tracks.length);

        let totalTextTracks = 0;
        let activeCueCount = 0;

        videos.forEach((video, vi) => {
            let tt = [];
            try {
                tt = [...video.textTracks];
            } catch {}

            totalTextTracks += tt.length;
            lines.push('');
            lines.push('VIDEO ' + (vi + 1) + ' textTracks: ' + tt.length);

            tt.forEach((t, ti) => {
                let active = 0;
                let cues = 0;
                try { active = t.activeCues ? t.activeCues.length : 0; } catch {}
                try { cues = t.cues ? t.cues.length : 0; } catch {}
                activeCueCount += active;

                lines.push(
                    '  [' + ti + '] ' +
                    'kind=' + (t.kind || '-') +
                    ' label=' + (t.label || '-') +
                    ' lang=' + (t.language || '-') +
                    ' mode=' + (t.mode || '-') +
                    ' cues=' + cues +
                    ' active=' + active
                );

                if (active > 0) {
                    try {
                        const cueText = [...t.activeCues]
                            .map(c => short(c.text, 80))
                            .filter(Boolean)
                            .join(' | ');
                        if (cueText) lines.push('      cue: ' + cueText);
                    } catch {}
                }
            });
        });

        lines.push('');
        lines.push('Total textTracks: ' + totalTextTracks);
        lines.push('Active cues: ' + activeCueCount);

        if (tracks.length) {
            lines.push('');
            lines.push('TRACK TAGS:');
            tracks.slice(0, 8).forEach((t, i) => {
                let src = '';
                try {
                    src = t.src ? new URL(t.src, location.href).href : '';
                } catch {
                    src = t.src || '';
                }
                lines.push(
                    '  [' + i + '] ' +
                    'kind=' + (t.kind || '-') +
                    ' label=' + (t.label || '-') +
                    ' lang=' + (t.srclang || '-') +
                    (src ? ' src=' + short(src, 100) : '')
                );
            });
        }

        const selectors = [
            '.vjs-text-track-display',
            '.vjs-text-track-cue',
            '.jw-captions',
            '.jw-text-track-container',
            '.plyr__captions',
            '[class*="subtitle" i]',
            '[class*="caption" i]',
            '[class*="cue" i]',
            '[id*="subtitle" i]',
            '[id*="caption" i]'
        ];

        const candidates = [];
        const seen = new Set();

        for (const sel of selectors) {
            let found = [];
            try { found = [...document.querySelectorAll(sel)]; } catch {}
            for (const el of found) {
                if (seen.has(el)) continue;
                seen.add(el);

                const cs = page.getComputedStyle ? page.getComputedStyle(el) : null;
                const visible = !cs || (
                    cs.display !== 'none' &&
                    cs.visibility !== 'hidden' &&
                    cs.opacity !== '0'
                );

                candidates.push({
                    el,
                    visible
                });
            }
        }

        lines.push('');
        lines.push('DOM subtitle candidates: ' + candidates.length);

        candidates.slice(0, 10).forEach((x, i) => {
            lines.push(
                '  [' + i + '] ' +
                (x.visible ? 'VISIBLE ' : 'hidden  ') +
                describeElement(x.el)
            );
        });

        let cueSelectorSupport = 'unknown';
        try {
            cueSelectorSupport = CSS.supports('selector(video::cue)') ? 'yes' : 'no';
        } catch {}
        lines.push('');
        lines.push('video::cue selector: ' + cueSelectorSupport);

        return lines.join('\n');
    }

    function ensurePanel() {
        if (!document.documentElement) return null;

        let box = document.getElementById(PANEL_ID);
        if (box) return box;

        box = document.createElement('pre');
        box.id = PANEL_ID;

        Object.assign(box.style, {
            position: 'fixed',
            zIndex: '2147483647',
            right: '8px',
            bottom: '8px',
            width: 'min(90vw, 520px)',
            maxHeight: '55vh',
            overflow: 'auto',
            margin: '0',
            padding: '10px',
            background: 'rgba(0,0,0,.86)',
            color: '#00ff80',
            font: '11px/1.35 monospace',
            borderRadius: '8px',
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
        });

        document.documentElement.appendChild(box);
        return box;
    }

    function refresh() {
        const box = ensurePanel();
        if (!box) return;

        const next = collect();
        if (box.textContent !== next) box.textContent = next;
    }

    function start() {
        refresh();
        setInterval(refresh, 1000);
    }

    if (document.documentElement) {
        start();
    } else {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    }
})();
