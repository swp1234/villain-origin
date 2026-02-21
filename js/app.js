/* ========================================
   Villain Origin Test - App Logic
   16 binary choice pairs
   6 villain origin archetypes
   Rapid-fire tap mechanic
   ======================================== */

(function() {
    'use strict';

    // --- i18n helpers (try-catch) ---
    function getI18n() {
        try {
            if (typeof i18n !== 'undefined' && i18n) return i18n;
        } catch (e) { /* ignore */ }
        return null;
    }

    function t(key, fallback) {
        try {
            var inst = getI18n();
            if (inst && typeof inst.t === 'function') {
                var val = inst.t(key);
                if (val && val !== key) return val;
            }
        } catch (e) { /* ignore */ }
        return fallback || key;
    }

    function fmt(template, values) {
        var result = template;
        for (var k in values) {
            if (values.hasOwnProperty(k)) {
                result = result.replace(new RegExp('\\{' + k + '\\}', 'g'), values[k]);
            }
        }
        return result;
    }

    function $(id) { return document.getElementById(id); }

    // --- Archetype IDs ---
    // betrayed, mastermind, anarchist, fallenHero, phantom, conqueror
    var ARCHETYPES = ['betrayed', 'mastermind', 'anarchist', 'fallenHero', 'phantom', 'conqueror'];

    var ARCHETYPE_COLORS = {
        betrayed:   '#1a237e',
        mastermind: '#4a148c',
        anarchist:  '#b71c1c',
        fallenHero: '#5d4037',
        phantom:    '#263238',
        conqueror:  '#880e4f'
    };

    var ARCHETYPE_ICONS = {
        betrayed:   '\uD83D\uDC94',
        mastermind: '\uD83E\uDDE0',
        anarchist:  '\uD83D\uDD25',
        fallenHero: '\u2694\uFE0F',
        phantom:    '\uD83D\uDC7B',
        conqueror:  '\uD83D\uDC51'
    };

    // --- 16 Binary Pairs ---
    // Each pair: left choice emoji+text, right choice emoji+text
    // left/right scoring: arrays of archetype indices that get +1
    // Indices: 0=betrayed, 1=mastermind, 2=anarchist, 3=fallenHero, 4=phantom, 5=conqueror
    var pairs = [
        {
            key: 'p1',
            leftEmoji: '\uD83D\uDD25', rightEmoji: '\uD83D\uDD4A\uFE0F',
            leftScore:  [0, 2, 5],     // betrayed, anarchist, conqueror
            rightScore: [3, 4]         // fallenHero, phantom
        },
        {
            key: 'p2',
            leftEmoji: '\uD83D\uDC51', rightEmoji: '\uD83E\uDD1D',
            leftScore:  [1, 5],        // mastermind, conqueror
            rightScore: [0, 3]         // betrayed, fallenHero
        },
        {
            key: 'p3',
            leftEmoji: '\uD83E\uDDE0', rightEmoji: '\uD83D\uDCAA',
            leftScore:  [1, 4],        // mastermind, phantom
            rightScore: [2, 5]         // anarchist, conqueror
        },
        {
            key: 'p4',
            leftEmoji: '\uD83C\uDF11', rightEmoji: '\uD83D\uDC3A',
            leftScore:  [0, 4],        // betrayed, phantom
            rightScore: [1, 5]         // mastermind, conqueror
        },
        {
            key: 'p5',
            leftEmoji: '\uD83C\uDFAD', rightEmoji: '\uD83D\uDC80',
            leftScore:  [1, 4],        // mastermind, phantom
            rightScore: [2, 3]         // anarchist, fallenHero
        },
        {
            key: 'p6',
            leftEmoji: '\u26A1',       rightEmoji: '\uD83D\uDD50',
            leftScore:  [2, 5],        // anarchist, conqueror
            rightScore: [1, 4]         // mastermind, phantom
        },
        {
            key: 'p7',
            leftEmoji: '\uD83D\uDD12', rightEmoji: '\uD83C\uDF2A\uFE0F',
            leftScore:  [1, 5],        // mastermind, conqueror
            rightScore: [2, 3]         // anarchist, fallenHero
        },
        {
            key: 'p8',
            leftEmoji: '\uD83D\uDC94', rightEmoji: '\uD83E\uDD1E',
            leftScore:  [0, 4],        // betrayed, phantom
            rightScore: [3, 2]         // fallenHero, anarchist
        },
        {
            key: 'p9',
            leftEmoji: '\uD83D\uDCDC', rightEmoji: '\uD83D\uDD13',
            leftScore:  [1, 5],        // mastermind, conqueror
            rightScore: [2, 3]         // anarchist, fallenHero
        },
        {
            key: 'p10',
            leftEmoji: '\uD83C\uDFAF', rightEmoji: '\uD83C\uDFB2',
            leftScore:  [1, 4],        // mastermind, phantom
            rightScore: [2, 5]         // anarchist, conqueror
        },
        {
            key: 'p11',
            leftEmoji: '\uD83D\uDE24', rightEmoji: '\u2744\uFE0F',
            leftScore:  [0, 2, 5],     // betrayed, anarchist, conqueror
            rightScore: [1, 4]         // mastermind, phantom
        },
        {
            key: 'p12',
            leftEmoji: '\uD83D\uDDE1\uFE0F', rightEmoji: '\uD83D\uDEE1\uFE0F',
            leftScore:  [2, 5],        // anarchist, conqueror
            rightScore: [0, 3]         // betrayed, fallenHero
        },
        {
            key: 'p13',
            leftEmoji: '\uD83D\uDC41\uFE0F', rightEmoji: '\uD83E\uDEF6',
            leftScore:  [4, 5],        // phantom, conqueror
            rightScore: [0, 3]         // betrayed, fallenHero
        },
        {
            key: 'p14',
            leftEmoji: '\uD83C\uDF0D', rightEmoji: '\uD83C\uDFE0',
            leftScore:  [2, 3],        // anarchist, fallenHero
            rightScore: [0, 4]         // betrayed, phantom
        },
        {
            key: 'p15',
            leftEmoji: '\u231B',       rightEmoji: '\uD83D\uDD2E',
            leftScore:  [0, 3],        // betrayed, fallenHero
            rightScore: [1, 5]         // mastermind, conqueror
        },
        {
            key: 'p16',
            leftEmoji: '\uD83D\uDCA3', rightEmoji: '\uD83C\uDFD7\uFE0F',
            leftScore:  [2, 5],        // anarchist, conqueror
            rightScore: [1, 3]         // mastermind, fallenHero
        }
    ];

    // --- State ---
    var currentPair = 0;
    var scores = { betrayed: 0, mastermind: 0, anarchist: 0, fallenHero: 0, phantom: 0, conqueror: 0 };
    var choices = [];
    var isTransitioning = false;
    var comboCount = 0;
    var lastChoiceTime = 0;

    // --- DOM caching ---
    var startScreen = $('startScreen');
    var quizScreen = $('quizScreen');
    var resultScreen = $('resultScreen');
    var startBtn = $('startBtn');
    var progressFill = $('progressFill');
    var progressText = $('progressText');
    var comboCounter = $('comboCounter');
    var binaryCards = $('binaryCards');
    var choiceLeft = $('choiceLeft');
    var choiceRight = $('choiceRight');
    var leftEmoji = $('leftEmoji');
    var leftText = $('leftText');
    var rightEmoji = $('rightEmoji');
    var rightText = $('rightText');
    var archetypeIcon = $('archetypeIcon');
    var archetypeName = $('archetypeName');
    var archetypeNarrative = $('archetypeNarrative');
    var traitBars = $('traitBars');
    var retakeBtn = $('retakeBtn');
    var shareTwitterBtn = $('shareTwitter');
    var shareCopyBtn = $('shareCopy');
    var themeToggle = $('themeToggle');
    var themeIcon = $('themeIcon');
    var langBtn = $('langBtn');
    var langDropdown = $('langDropdown');
    var currentLangLabel = $('currentLang');

    // --- Language name map ---
    var langNames = {
        ko: '\uD55C\uAD6D\uC5B4', en: 'English', zh: '\u4E2D\u6587',
        hi: '\u0939\u093F\u0928\u094D\u0926\u0940', ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
        ja: '\u65E5\u672C\u8A9E', es: 'Espa\u00F1ol', pt: 'Portugu\u00EAs',
        id: 'Indonesia', tr: 'T\u00FCrk\u00E7e', de: 'Deutsch', fr: 'Fran\u00E7ais'
    };

    // --- Get winning archetype ---
    function getWinningArchetype() {
        var maxScore = -1;
        var winner = 'betrayed';
        for (var key in scores) {
            if (scores.hasOwnProperty(key) && scores[key] > maxScore) {
                maxScore = scores[key];
                winner = key;
            }
        }
        return winner;
    }

    // --- Screen management ---
    function showScreen(screen) {
        startScreen.style.display = 'none';
        quizScreen.style.display = 'none';
        resultScreen.style.display = 'none';
        startScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        resultScreen.classList.remove('active');
        screen.style.display = '';
        screen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Theme toggle ---
    function initTheme() {
        var saved = localStorage.getItem('theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        }
        updateThemeIcon();
    }

    function updateThemeIcon() {
        var current = document.documentElement.getAttribute('data-theme');
        if (themeIcon) {
            themeIcon.textContent = current === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            var next = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            updateThemeIcon();
        });
    }

    // --- Language selector ---
    function initLangSelector() {
        if (!langBtn || !langDropdown) return;

        langBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            langDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (!langDropdown.contains(e.target) && e.target !== langBtn) {
                langDropdown.classList.remove('active');
            }
        });

        var langOptions = langDropdown.querySelectorAll('.lang-option');
        langOptions.forEach(function(option) {
            option.addEventListener('click', function() {
                var lang = this.getAttribute('data-lang');
                langDropdown.classList.remove('active');

                var inst = getI18n();
                if (inst && typeof inst.setLanguage === 'function') {
                    inst.setLanguage(lang).then(function() {
                        if (currentLangLabel) {
                            currentLangLabel.textContent = langNames[lang] || lang;
                        }
                        refreshCurrentView();
                    }).catch(function() {});
                }
            });
        });

        var inst = getI18n();
        if (inst && currentLangLabel) {
            currentLangLabel.textContent = langNames[inst.currentLang] || inst.currentLang;
        }
    }

    // --- Refresh current view after language change ---
    function refreshCurrentView() {
        if (quizScreen.classList.contains('active')) {
            renderPair();
        } else if (resultScreen.classList.contains('active')) {
            renderResult();
        }
    }

    // --- Start quiz ---
    function startQuiz() {
        currentPair = 0;
        scores = { betrayed: 0, mastermind: 0, anarchist: 0, fallenHero: 0, phantom: 0, conqueror: 0 };
        choices = [];
        isTransitioning = false;
        comboCount = 0;
        lastChoiceTime = 0;
        if (comboCounter) {
            comboCounter.classList.remove('active');
            comboCounter.textContent = '';
        }
        showScreen(quizScreen);
        renderPair();

        if (typeof gtag === 'function') {
            gtag('event', 'quiz_start', { event_category: 'villain-origin' });
        }
    }

    // --- Render current pair ---
    function renderPair() {
        var p = pairs[currentPair];
        var pNum = currentPair + 1;
        var total = pairs.length;

        // Update progress
        var pct = (currentPair / total) * 100;
        progressFill.style.width = pct + '%';
        progressText.textContent = pNum + ' / ' + total;

        // Set card content via i18n
        leftEmoji.textContent = p.leftEmoji;
        rightEmoji.textContent = p.rightEmoji;
        leftText.textContent = t('pairs.' + p.key + '.left', 'Left');
        rightText.textContent = t('pairs.' + p.key + '.right', 'Right');
    }

    // --- Handle choice ---
    function makeChoice(side) {
        if (isTransitioning) return;
        isTransitioning = true;

        var p = pairs[currentPair];
        var scoreArr = side === 'left' ? p.leftScore : p.rightScore;

        // Apply scores
        for (var i = 0; i < scoreArr.length; i++) {
            var archKey = ARCHETYPES[scoreArr[i]];
            scores[archKey]++;
        }

        // Store choice
        choices.push({ pairIndex: currentPair, side: side });

        // Combo tracking
        var now = Date.now();
        if (lastChoiceTime > 0 && (now - lastChoiceTime) < 2000) {
            comboCount++;
        } else {
            comboCount = 1;
        }
        lastChoiceTime = now;
        updateCombo();

        // Whoosh animation
        binaryCards.classList.remove('whoosh-left', 'whoosh-right', 'slide-in');
        binaryCards.classList.add(side === 'left' ? 'whoosh-left' : 'whoosh-right');

        // After animation, show next or result
        setTimeout(function() {
            if (currentPair < pairs.length - 1) {
                currentPair++;
                renderPair();
                binaryCards.classList.remove('whoosh-left', 'whoosh-right');
                binaryCards.classList.add('slide-in');
                setTimeout(function() {
                    binaryCards.classList.remove('slide-in');
                    isTransitioning = false;
                }, 350);
            } else {
                // Quiz complete
                progressFill.style.width = '100%';
                showScreen(resultScreen);
                renderResult();
                isTransitioning = false;
            }
        }, 380);
    }

    // --- Update combo counter ---
    function updateCombo() {
        if (!comboCounter) return;
        if (comboCount >= 2) {
            comboCounter.textContent = fmt(t('quiz.combo', '{count}x COMBO'), { count: comboCount });
            comboCounter.classList.add('active');
            comboCounter.classList.remove('bump');
            void comboCounter.offsetWidth; // force reflow
            comboCounter.classList.add('bump');
        }
    }

    // --- Render result ---
    function renderResult() {
        var winner = getWinningArchetype();
        var color = ARCHETYPE_COLORS[winner];
        var icon = ARCHETYPE_ICONS[winner];

        // Archetype icon
        archetypeIcon.textContent = icon;
        archetypeIcon.style.filter = 'drop-shadow(0 0 20px ' + color + ')';

        // Archetype name
        archetypeName.textContent = t('archetypes.' + winner + '.name', winner);
        archetypeName.style.color = color;

        // Narrative
        archetypeNarrative.textContent = t('archetypes.' + winner + '.narrative', '');

        // Result card border color
        var resultCard = resultScreen.querySelector('.result-card');
        if (resultCard) {
            resultCard.style.borderColor = color + '55';
            resultCard.style.boxShadow = '0 0 40px ' + color + '22';
        }

        // Trait breakdown bars
        renderTraitBars();

        // GA4 event
        if (typeof gtag === 'function') {
            gtag('event', 'quiz_complete', {
                event_category: 'villain-origin',
                event_label: winner,
                value: scores[winner]
            });
        }
    }

    // --- Render trait bars ---
    function renderTraitBars() {
        traitBars.innerHTML = '';

        // Find max score for normalization
        var maxScore = 0;
        for (var key in scores) {
            if (scores.hasOwnProperty(key) && scores[key] > maxScore) {
                maxScore = scores[key];
            }
        }
        if (maxScore === 0) maxScore = 1;

        // Sort archetypes by score descending
        var sorted = ARCHETYPES.slice().sort(function(a, b) {
            return scores[b] - scores[a];
        });

        for (var i = 0; i < sorted.length; i++) {
            var archKey = sorted[i];
            var score = scores[archKey];
            var pct = Math.round((score / maxScore) * 100);
            var color = ARCHETYPE_COLORS[archKey];

            var row = document.createElement('div');
            row.className = 'trait-bar-row';

            var label = document.createElement('div');
            label.className = 'trait-bar-label';
            var nameSpan = document.createElement('span');
            nameSpan.textContent = ARCHETYPE_ICONS[archKey] + ' ' + t('archetypes.' + archKey + '.name', archKey);
            var scoreSpan = document.createElement('span');
            scoreSpan.textContent = score;
            label.appendChild(nameSpan);
            label.appendChild(scoreSpan);

            var track = document.createElement('div');
            track.className = 'trait-bar-track';

            var fill = document.createElement('div');
            fill.className = 'trait-bar-fill';
            fill.style.backgroundColor = color;

            track.appendChild(fill);
            row.appendChild(label);
            row.appendChild(track);
            traitBars.appendChild(row);

            // Animate fill with delay
            (function(fillEl, pctVal) {
                setTimeout(function() {
                    fillEl.style.width = pctVal + '%';
                }, 200 + i * 150);
            })(fill, pct);
        }
    }

    // --- Share: Twitter ---
    function shareTwitter() {
        var winner = getWinningArchetype();
        var arcName = t('archetypes.' + winner + '.name', winner);
        var text = fmt(t('share.text', 'My villain origin is "{archetype}"! What made you the villain?'), {
            archetype: arcName
        });
        var url = 'https://dopabrain.com/villain-origin/';
        window.open(
            'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url),
            '_blank',
            'noopener'
        );
        if (typeof gtag === 'function') {
            gtag('event', 'share', { method: 'twitter', content_type: 'quiz_result' });
        }
    }

    // --- Share: Copy URL ---
    function copyUrl() {
        var url = 'https://dopabrain.com/villain-origin/';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
                showCopiedFeedback();
            }).catch(function() {
                fallbackCopy(url);
            });
        } else {
            fallbackCopy(url);
        }
        if (typeof gtag === 'function') {
            gtag('event', 'share', { method: 'copy', content_type: 'quiz_result' });
        }
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showCopiedFeedback(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    function showCopiedFeedback() {
        if (!shareCopyBtn) return;
        var original = shareCopyBtn.textContent;
        shareCopyBtn.textContent = t('share.copied', 'Copied!');
        setTimeout(function() {
            shareCopyBtn.textContent = t('share.copyUrl', 'Copy Link');
        }, 2000);
    }

    // --- Hide loader ---
    function hideLoader() {
        var loader = $('app-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    // --- Bind events ---
    function bindEvents() {
        if (startBtn) {
            startBtn.addEventListener('click', startQuiz);
        }

        if (choiceLeft) {
            choiceLeft.addEventListener('click', function() {
                makeChoice('left');
            });
        }

        if (choiceRight) {
            choiceRight.addEventListener('click', function() {
                makeChoice('right');
            });
        }

        if (retakeBtn) {
            retakeBtn.addEventListener('click', function() {
                showScreen(startScreen);
            });
        }

        if (shareTwitterBtn) {
            shareTwitterBtn.addEventListener('click', shareTwitter);
        }

        if (shareCopyBtn) {
            shareCopyBtn.addEventListener('click', copyUrl);
        }

        // Keyboard support for binary choices
        document.addEventListener('keydown', function(e) {
            if (!quizScreen.classList.contains('active')) return;
            if (e.key === 'ArrowLeft' || e.key === '1') {
                makeChoice('left');
            } else if (e.key === 'ArrowRight' || e.key === '2') {
                makeChoice('right');
            }
        });
    }

    // --- Init ---
    function init() {
        initTheme();
        initLangSelector();
        bindEvents();

        var inst = getI18n();
        if (inst && typeof inst.loadTranslations === 'function') {
            inst.loadTranslations(inst.currentLang).then(function() {
                if (typeof inst.updateUI === 'function') {
                    inst.updateUI();
                }
                if (currentLangLabel) {
                    currentLangLabel.textContent = langNames[inst.currentLang] || inst.currentLang;
                }
                hideLoader();
            }).catch(function() {
                hideLoader();
            });
        } else {
            hideLoader();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
