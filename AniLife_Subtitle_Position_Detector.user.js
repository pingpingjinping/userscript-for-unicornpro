// ==UserScript==
// @name         AniLife Subtitle Position Detector
// @namespace    local.anilife.subtitle.position
// @version      1.0
// @description  Inspect AniLife Artplayer subtitle layout and computed position
// @match        https://anilife01.tv/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const PANEL_ID = '__anilife_sub_pos_detector';

    function fmtRect(r) {
        return `x=${Math.round(r.x)} y=${Math.round(r.y)} w=${Math.round(r.width)} h=${Math.round(r.height)}`;
    }

    function desc(el, idx) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();

        let name = el.tagName.toLowerCase();
        if (el.id) name += '#' + el.id;
        if (el.classList.length) name += '.' + [...el.classList].join('.');

        const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45);

        return [
            `[${idx}] ${name}`,
            `rect: ${fmtRect(r)}`,
            `position: ${cs.position}`,
            `top: ${cs.top}`,
            `bottom: ${cs.bottom}`,
            `left: ${cs.left}`,
            `right: ${cs.right}`,
            `transform: ${cs.transform}`,
            `translate: ${cs.translate}`,
            `margin-top: ${cs.marginTop}`,
            `margin-bottom: ${cs.marginBottom}`,
            `line-height: ${cs.lineHeight}`,
            `display: ${cs.display}`,
            txt ? `text: "${txt}"` : 'text: (none)'
        ].join('\n');
    }

    function collect() {
        const root = document.querySelector('.art-subtitle');

        const lines = [
            'SUBTITLE POSITION CHECK',
            'HOST: ' + location.hostname,
            'viewport: ' + innerWidth + 'x' + innerHeight,
            ''
        ];

        if (!root) {
            lines.push('.art-subtitle: NOT FOUND');
            return lines.join('\n');
        }

        const nodes = [root, ...root.querySelectorAll('*')];
        lines.push('nodes: ' + nodes.length);
        lines.push('');

        nodes.slice(0, 8).forEach((el, i) => {
            lines.push(desc(el, i));
            lines.push('');
        });

        return lines.join('\n');
    }

    function ensurePanel() {
        let box = document.getElementById(PANEL_ID);
        if (box) return box;
        if (!document.documentElement) return null;

        box = document.createElement('pre');
        box.id = PANEL_ID;

        Object.assign(box.style, {
            position: 'fixed',
            zIndex: '2147483647',
            left: '6px',
            top: '6px',
            width: 'min(92vw, 620px)',
            maxHeight: '70vh',
            overflow: 'auto',
            margin: '0',
            padding: '10px',
            background: 'rgba(0,0,0,.88)',
            color: '#00ff80',
            font: '10px/1.35 monospace',
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
