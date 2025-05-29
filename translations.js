const translations = {
    'fr-FR': {
        ui: {
            title: 'ALEXIA - Assistant Vocal Multilingue',
            startButton: 'Commencer l\'enregistrement',
            stopButton: 'Arrêter l\'enregistrement',
            downloadAudio: 'Télécharger l\'audio',
            downloadReport: 'Télécharger le rapport',
            settings: 'Paramètres',
            practice: 'Exercices',
            stats: 'Statistiques',
            translateButton: 'Traduire',
            autoTranslate: 'Traduction automatique',
            translationPlaceholder: '[Zone de traduction]'
        },
        metrics: {
            speechRate: 'Vitesse de parole',
            emotion: 'Émotion détectée',
            clarity: 'Clarté',
            engagement: 'Engagement',
            wordsPerMinute: 'mots/minute',
            tone: 'Ton',
            pauses: 'Pauses',
            hesitations: 'Hésitations',
            vitesse: 'Vitesse',
            clarte: 'Clarté'
        },
        feedback: {
            tooFast: 'Essayez de parler un peu plus lentement',
            tooSlow: 'Vous pourriez augmenter légèrement votre débit',
            goodPace: 'Votre rythme est bon',
            useMorePauses: 'Ajoutez quelques pauses stratégiques',
            reducePauses: 'Essayez de réduire les pauses',
            goodStructure: 'Votre discours est bien structuré'
        },
        report: {
            date: 'Date',
            duration: 'Durée',
            sourceLanguage: 'Langue source',
            metrics: 'Métriques',
            transcription: 'Transcription',
            originalText: 'Texte original',
            translation: 'Traduction',
            reportTitle: 'Rapport d\'analyse vocale'
        }
    },
    'fon-BJ': {
        ui: {
            title: 'ALEXIA - Gbè Tunwun Tɔn',
            startButton: 'Bɛ jɛ gbè yí jí',
            stopButton: 'Gbɔ gbè yíyí',
            downloadAudio: 'Sɔ gbè ɖó',
            downloadReport: 'Sɔ wěma ɖó',
            settings: 'Tìtò lɛ̌',
            practice: 'Mɛ plɛnplɛn',
            stats: 'Nùxokplɔn lɛ̌',
            translateButton: 'Gbè ɖěvo',
            autoTranslate: 'Gbè ɖěvo ɖó',
            translationPlaceholder: '[Gbè ɖěvo ɖó]'
        },
        metrics: {
            speechRate: 'Gbè yíyí sín kpínkpɔn',
            emotion: 'Ayixa ɖé ɖò',
            clarity: 'Gbè sísí',
            engagement: 'Nùɖéɖé',
            wordsPerMinute: 'xó/hwe cɛ́',
            tone: 'Gbè sín kpákpá',
            pauses: 'Gbɔ́ɖókpɔ́',
            hesitations: 'Nùflɛ́',
            vitesse: 'Gbè yíyí sín kpínkpɔn',
            clarte: 'Gbè sísí'
        },
        feedback: {
            tooFast: 'Mi ɖó ná dó gbè bléblé',
            tooSlow: 'Mi ɖó ná dó gbè kpɛví kpɛví',
            goodPace: 'Gbè mítɔn nyɔ́',
            useMorePauses: 'Mi ná gbɔ́ɖó kpɔ́n',
            reducePauses: 'Mi ná dó gbè bɔ é má ná gbɔ́ɖó ǎ',
            goodStructure: 'Gbè mítɔn ɖó titó nyɔ́'
        },
        report: {
            date: 'Azǎn',
            duration: 'Gǎn',
            sourceLanguage: 'Gbè',
            metrics: 'Nùxokplɔn lɛ̌',
            transcription: 'Wěma',
            originalText: 'Gbè ɖaxó',
            translation: 'Gbè ɖěvo',
            reportTitle: 'Wěma Gbè Tunwun Tɔn'
        }
    },
    'en-US': {
        ui: {
            title: 'ALEXIA - Multilingual Voice Assistant',
            startButton: 'Start Recording',
            stopButton: 'Stop Recording',
            downloadAudio: 'Download Audio',
            downloadReport: 'Download Report',
            settings: 'Settings',
            practice: 'Practice',
            stats: 'Statistics',
            translateButton: 'Translate',
            autoTranslate: 'Auto-translate',
            translationPlaceholder: '[Translation area]'
        },
        metrics: {
            speechRate: 'Speech Rate',
            emotion: 'Detected Emotion',
            clarity: 'Clarity',
            engagement: 'Engagement',
            wordsPerMinute: 'words/minute',
            tone: 'Tone',
            pauses: 'Pauses',
            hesitations: 'Hesitations',
            vitesse: 'Speed',
            clarte: 'Clarity'
        },
        feedback: {
            tooFast: 'Try speaking a bit slower',
            tooSlow: 'You could increase your pace slightly',
            goodPace: 'Your pace is good',
            useMorePauses: 'Add some strategic pauses',
            reducePauses: 'Try to reduce pauses',
            goodStructure: 'Your speech is well structured'
        },
        report: {
            date: 'Date',
            duration: 'Duration',
            sourceLanguage: 'Source Language',
            metrics: 'Metrics',
            transcription: 'Transcription',
            originalText: 'Original Text',
            translation: 'Translation',
            reportTitle: 'Voice Analysis Report'
        }
    }
};

class TranslationManager {
    constructor() {
        this.currentLanguage = 'fr-FR';
        this.fallbackLanguage = 'en-US';
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            this.updateUILanguage();
            return true;
        }
        return false;
    }

    translate(key, category = 'ui') {
        const langData = translations[this.currentLanguage] || translations[this.fallbackLanguage];
        const categoryData = langData[category];
        return categoryData[key] || key;
    }

    updateUILanguage() {
        // Mettre à jour tous les éléments de l'interface
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const category = element.getAttribute('data-translate-category') || 'ui';
            element.textContent = this.translate(key, category);
        });

        // Mettre à jour le titre de la page
        document.title = this.translate('title');

        // Mettre à jour la direction du texte pour les langues RTL
        document.documentElement.dir = this.isRTL(this.currentLanguage) ? 'rtl' : 'ltr';
    }

    isRTL(language) {
        const rtlLanguages = ['ar', 'he', 'fa'];
        return rtlLanguages.includes(language.split('-')[0]);
    }

    getAvailableLanguages() {
        return Object.keys(translations).map(lang => ({
            code: lang,
            name: this.getLanguageName(lang)
        }));
    }

    getLanguageName(langCode) {
        const languageNames = {
            'fr-FR': 'Français',
            'en-US': 'English',
            'fon-BJ': 'Fongbè',
            // Ajouter d'autres langues ici
        };
        return languageNames[langCode] || langCode;
    }
}

// Export pour utilisation dans d'autres fichiers
window.TranslationManager = TranslationManager;
window.translations = translations; 