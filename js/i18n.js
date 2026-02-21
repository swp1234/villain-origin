class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko','en','ja','es','pt','zh','id','tr','de','fr','hi','ru'];
        this.currentLang = this.detectLanguage();
    }
    detectLanguage() {
        var saved = localStorage.getItem('app_language');
        if (saved && this.supportedLanguages.includes(saved)) return saved;
        var browser = (navigator.language || navigator.userLanguage).split('-')[0];
        if (this.supportedLanguages.includes(browser)) return browser;
        return 'en';
    }
    async loadTranslations(lang) {
        try {
            var r = await fetch('js/locales/' + lang + '.json');
            if (!r.ok) throw new Error('Not found');
            this.translations[lang] = await r.json();
            return true;
        } catch (e) {
            if (lang !== 'en') return this.loadTranslations('en');
            return false;
        }
    }
    t(key) {
        var keys = key.split('.');
        var v = this.translations[this.currentLang];
        for (var i = 0; i < keys.length; i++) {
            if (v && v[keys[i]] !== undefined) v = v[keys[i]]; else return key;
        }
        return v;
    }
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) return false;
        if (!this.translations[lang]) await this.loadTranslations(lang);
        this.currentLang = lang;
        localStorage.setItem('app_language', lang);
        document.documentElement.lang = lang;
        this.updateUI();
        return true;
    }
    updateUI() {
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var val = window.i18n.t(el.getAttribute('data-i18n'));
            if (val !== el.getAttribute('data-i18n')) el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
            var val = window.i18n.t(el.getAttribute('data-i18n-placeholder'));
            if (val !== el.getAttribute('data-i18n-placeholder')) el.placeholder = val;
        });
        var titleKey = window.i18n.t('meta.title');
        if (titleKey !== 'meta.title') document.title = titleKey;
        var meta = document.querySelector('meta[name="description"]');
        if (meta) { var d = window.i18n.t('meta.description'); if (d !== 'meta.description') meta.content = d; }
    }
    getCurrentLanguage() { return this.currentLang; }
}

try { window.i18n = new I18n(); } catch(e) { console.warn('i18n init failed:', e); }
