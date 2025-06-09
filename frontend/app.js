// Ajout d'un log global pour vérifier le chargement du script
console.log('Chargement de app.js');

if (
  window.location.pathname.endsWith('auth.html') &&
  localStorage.getItem('authToken')
) {
  document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;'><div class='status-message success'>Déjà connecté. Redirection...</div></div>";
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
  throw new Error('Redirection immédiate depuis auth.html car déjà connecté');
}

class ALEXIA {
    constructor() {
        console.log('ALEXIA: constructeur appelé');
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.startTime = null;
        this.timerInterval = null;
        this.maxDuration = 120000; // 2 minutes en millisecondes
        this.pauseThreshold = 1000; // 1 seconde de silence = pause
        this.lastSpeechTime = null;
        this.pauseCount = 0;
        this.hesitationCount = 0;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = null;
        this.totalWords = 0;
        this.totalSpeakingTime = 0;
        this.lastPauseTime = null;
        this.isPaused = false;
        this.accumulatedText = '';
        this.currentLanguage = 'fr-FR'; // Langue par défaut

        // Traductions de l'interface
        this.uiTranslations = {
            'fr-FR': {
                startRecording: 'Commencer l\'enregistrement',
                stopRecording: 'Arrêter l\'enregistrement',
                ready: 'Prêt',
                speechRate: 'Débit de parole',
                emotion: 'Émotion',
                clarity: 'Clarté',
                engagement: 'Engagement',
                voiceTone: 'Ton de voix',
                pauses: 'Pauses',
                hesitations: 'Hésitations',
                downloadAudio: 'Télécharger l\'audio',
                downloadReport: 'Télécharger le rapport',
                selectLanguage: 'Sélectionner une langue...',
                selectTargetLanguage: 'Sélectionner une langue cible...',
                translationInProgress: 'Traduction en cours...',
                translationError: 'Erreur de traduction. Veuillez réessayer.',
                translationPlaceholder: '[Zone de traduction]',
                fieldMode: 'Mode Entretien de Terrain',
                locationPlaceholder: 'Lieu de l\'entretien',
                interviewerPlaceholder: 'Nom de l\'enquêteur',
                intervieweePlaceholder: 'Identifiant de l\'interviewé',
                contextPlaceholder: 'Contexte de l\'entretien',
                tagsPlaceholder: 'Tags (séparés par des virgules)',
                notesPlaceholder: 'Notes rapides...',
                addMarker: 'Ajouter un marqueur temporel',
                noiseLevel: 'Niveau de bruit',
                gpsCoordinates: 'Coordonnées GPS',
                commonExpressions: 'Expressions courantes...'
            },
            'en-US': {
                startRecording: 'Start Recording',
                stopRecording: 'Stop Recording',
                ready: 'Ready',
                speechRate: 'Speech Rate',
                emotion: 'Emotion',
                clarity: 'Clarity',
                engagement: 'Engagement',
                voiceTone: 'Voice Tone',
                pauses: 'Pauses',
                hesitations: 'Hesitations',
                downloadAudio: 'Download Audio',
                downloadReport: 'Download Report',
                selectLanguage: 'Select a language...',
                selectTargetLanguage: 'Select target language...',
                translationInProgress: 'Translation in progress...',
                translationError: 'Translation error. Please try again.',
                translationPlaceholder: '[Translation area]',
                fieldMode: 'Field Interview Mode',
                locationPlaceholder: 'Interview location',
                interviewerPlaceholder: 'Interviewer name',
                intervieweePlaceholder: 'Interviewee ID',
                contextPlaceholder: 'Interview context',
                tagsPlaceholder: 'Tags (comma separated)',
                notesPlaceholder: 'Quick notes...',
                addMarker: 'Add time marker',
                noiseLevel: 'Noise level',
                gpsCoordinates: 'GPS coordinates',
                commonExpressions: 'Common expressions...'
            }
        };

        // Configuration des langues de reconnaissance vocale
        this.speechRecognitionLanguages = [
            { code: 'fr-FR', name: 'Français' },
            { code: 'en-US', name: 'Anglais (US)' },
            { code: 'en-GB', name: 'Anglais (GB)' },
            { code: 'es-ES', name: 'Espagnol' },
            { code: 'de-DE', name: 'Allemand' },
            { code: 'it-IT', name: 'Italien' },
            { code: 'pt-BR', name: 'Portugais (Brésil)' },
            { code: 'ru-RU', name: 'Russe' },
            { code: 'ja-JP', name: 'Japonais' },
            { code: 'ko-KR', name: 'Coréen' },
            { code: 'zh-CN', name: 'Chinois (Mandarin)' },
            { code: 'ar-SA', name: 'Arabe' },
            { code: 'hi-IN', name: 'Hindi' }
        ];

        // Liste complète des langues disponibles pour la traduction
        this.availableLanguages = [
            { code: 'fon', name: 'Fongbé', priority: true },
            { code: 'yo', name: 'Yoruba', priority: true },
            { code: 'ha', name: 'Haoussa', priority: true },
            { code: 'sw', name: 'Swahili', priority: true },
            { code: 'zu', name: 'Zoulou', priority: true },
            { code: 'af', name: 'Afrikaans' },
            { code: 'sq', name: 'Albanais' },
            { code: 'am', name: 'Amharique' },
            { code: 'ar', name: 'Arabe' },
            { code: 'hy', name: 'Arménien' },
            { code: 'az', name: 'Azéri' },
            { code: 'eu', name: 'Basque' },
            { code: 'be', name: 'Biélorusse' },
            { code: 'bn', name: 'Bengali' },
            { code: 'bs', name: 'Bosniaque' },
            { code: 'bg', name: 'Bulgare' },
            { code: 'ca', name: 'Catalan' },
            { code: 'ceb', name: 'Cebuano' },
            { code: 'zh', name: 'Chinois (Mandarin)' },
            { code: 'hr', name: 'Croate' },
            { code: 'cs', name: 'Tchèque' },
            { code: 'da', name: 'Danois' },
            { code: 'nl', name: 'Néerlandais' },
            { code: 'en', name: 'Anglais' },
            { code: 'eo', name: 'Espéranto' },
            { code: 'et', name: 'Estonien' },
            { code: 'fi', name: 'Finnois' },
            { code: 'fr', name: 'Français' },
            { code: 'fy', name: 'Frison' },
            { code: 'gl', name: 'Galicien' },
            { code: 'ka', name: 'Géorgien' },
            { code: 'de', name: 'Allemand' },
            { code: 'el', name: 'Grec' },
            { code: 'gu', name: 'Gujarati' },
            { code: 'ht', name: 'Créole haïtien' },
            { code: 'haw', name: 'Hawaïen' },
            { code: 'he', name: 'Hébreu' },
            { code: 'hi', name: 'Hindi' },
            { code: 'hmn', name: 'Hmong' },
            { code: 'hu', name: 'Hongrois' },
            { code: 'is', name: 'Islandais' },
            { code: 'ig', name: 'Igbo' },
            { code: 'id', name: 'Indonésien' },
            { code: 'ga', name: 'Irlandais' },
            { code: 'it', name: 'Italien' },
            { code: 'ja', name: 'Japonais' },
            { code: 'jv', name: 'Javanais' },
            { code: 'kn', name: 'Kannada' },
            { code: 'kk', name: 'Kazakh' },
            { code: 'km', name: 'Khmer' },
            { code: 'ko', name: 'Coréen' },
            { code: 'ku', name: 'Kurde' },
            { code: 'ky', name: 'Kirghiz' },
            { code: 'lo', name: 'Lao' },
            { code: 'la', name: 'Latin' },
            { code: 'lv', name: 'Letton' },
            { code: 'lt', name: 'Lituanien' },
            { code: 'lb', name: 'Luxembourgeois' },
            { code: 'mk', name: 'Macédonien' },
            { code: 'mg', name: 'Malgache' },
            { code: 'ms', name: 'Malais' },
            { code: 'ml', name: 'Malayalam' },
            { code: 'mt', name: 'Maltais' },
            { code: 'mi', name: 'Maori' },
            { code: 'mr', name: 'Marathi' },
            { code: 'mn', name: 'Mongol' },
            { code: 'my', name: 'Birman' },
            { code: 'ne', name: 'Népalais' },
            { code: 'no', name: 'Norvégien' },
            { code: 'ny', name: 'Chichewa' },
            { code: 'or', name: 'Odia' },
            { code: 'ps', name: 'Pachto' },
            { code: 'fa', name: 'Perse' },
            { code: 'pl', name: 'Polonais' },
            { code: 'pt', name: 'Portugais' },
            { code: 'pa', name: 'Pendjabi' },
            { code: 'ro', name: 'Roumain' },
            { code: 'ru', name: 'Russe' },
            { code: 'sm', name: 'Samoan' },
            { code: 'gd', name: 'Gaélique écossais' },
            { code: 'sr', name: 'Serbe' },
            { code: 'st', name: 'Sesotho' },
            { code: 'sn', name: 'Shona' },
            { code: 'sd', name: 'Sindhi' },
            { code: 'si', name: 'Cingalais' },
            { code: 'sk', name: 'Slovaque' },
            { code: 'sl', name: 'Slovène' },
            { code: 'so', name: 'Somali' },
            { code: 'es', name: 'Espagnol' },
            { code: 'su', name: 'Soundanais' },
            { code: 'sv', name: 'Suédois' },
            { code: 'tl', name: 'Tagalog' },
            { code: 'tg', name: 'Tadjik' },
            { code: 'ta', name: 'Tamoul' },
            { code: 'tt', name: 'Tatar' },
            { code: 'te', name: 'Télougou' },
            { code: 'th', name: 'Thaï' },
            { code: 'tr', name: 'Turc' },
            { code: 'uk', name: 'Ukrainien' },
            { code: 'ur', name: 'Ourdou' },
            { code: 'ug', name: 'Ouïghour' },
            { code: 'uz', name: 'Ouzbek' },
            { code: 'vi', name: 'Vietnamien' },
            { code: 'cy', name: 'Gallois' },
            { code: 'xh', name: 'Xhosa' },
            { code: 'yi', name: 'Yiddish' }
        ];

        // Éléments DOM
        this.startButton = document.getElementById('startButton');
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('status');
        this.transcriptionDisplay = document.getElementById('transcription');
        this.wpmDisplay = document.getElementById('wpm');
        this.emotionDisplay = document.getElementById('emotion');
        this.clarityDisplay = document.getElementById('clarity');
        this.engagementDisplay = document.getElementById('engagement');
        this.languageSelect = document.getElementById('languageSelect');
        this.autoStopCheckbox = document.getElementById('autoStopCheckbox');
        this.downloadAudioBtn = document.getElementById('downloadAudio');
        this.downloadReportBtn = document.getElementById('downloadReport');
        this.voiceToneDisplay = document.getElementById('voiceTone');
        this.pauseCountDisplay = document.getElementById('pauseCount');
        this.hesitationCountDisplay = document.getElementById('hesitationCount');
        this.suggestionsList = document.getElementById('suggestions');
        this.translationTargetLanguage = document.getElementById('translationTargetLanguage');

        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.setupRecognition();
        this.setupEventListeners();

        // Nouvelles propriétés pour la gestion des langues
        this.languageSupportDisplay = document.getElementById('languageSupport');
        this.dialectInfoDisplay = document.getElementById('dialectInfo');
        
        // Configuration des langues
        this.languageConfig = {
            'fr-FR': {
                hesitationWords: ['euh', 'um', 'eh', 'ben', 'bah'],
                engagingPhrases: ['imaginez', 'pensez', 'voyez', 'écoutez', 'regardez'],
                optimalWpmRange: { min: 120, max: 160 }
            },
            'en-US': {
                hesitationWords: ['uh', 'um', 'er', 'like', 'you know'],
                engagingPhrases: ['imagine', 'think', 'look', 'listen', 'consider'],
                optimalWpmRange: { min: 130, max: 170 }
            },
            'sw-KE': {
                hesitationWords: ['ee', 'ah', 'sema', 'yaani'],
                engagingPhrases: ['fikiria', 'sikiza', 'angalia', 'ona', 'elewa'],
                optimalWpmRange: { min: 100, max: 150 }
            },
            'am-ET': {
                hesitationWords: ['ə', 'əm', 'ah'],
                engagingPhrases: ['አስቡ', 'ያዳምጡ', 'ይመልከቱ'],
                optimalWpmRange: { min: 100, max: 140 }
            }
        };

        this.defaultLanguageConfig = {
            hesitationWords: ['um', 'uh', 'eh'],
            engagingPhrases: [],
            optimalWpmRange: { min: 120, max: 160 }
        };

        this.setupLanguageHandling();

        // Nouvelles propriétés pour le mode entretien
        this.isFieldInterview = false;
        this.interviewMetadata = {
            location: '',
            interviewer: '',
            interviewee: '',
            context: '',
            tags: [],
            notes: []
        };
        this.gpsCoordinates = null;
        this.backgroundNoise = 0;
        this.markers = [];
        this.timestamps = [];

        // Nouveaux éléments DOM pour le mode entretien
        this.setupFieldInterviewUI();

        // Éléments de traduction
        this.translateButton = document.getElementById('translateButton');
        this.translationResult = document.getElementById('translationResult');
        this.autoTranslateCheckbox = document.getElementById('autoTranslateCheckbox');
        this.autoTranslate = false;

        // Configuration de l'API de traduction
        this.translationAPI = {
            endpoint: 'https://libretranslate.de/translate'
        };

        // Ajouter les écouteurs d'événements pour la traduction
        this.setupTranslationListeners();
    }

    setupRecognition() {
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.languageSelect.value;

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                    if (this.accumulatedText && !this.accumulatedText.endsWith(' ') && !transcript.startsWith(' ')) {
                        this.accumulatedText += ' ';
                    }
                    this.accumulatedText += transcript;
                    this.analyzeHesitations(transcript);
                } else {
                    interimTranscript += transcript;
                }
                this.lastSpeechTime = Date.now();
            }

            // Afficher le texte avec le texte intermédiaire en gris
            this.transcriptionDisplay.innerHTML = this.accumulatedText + '<i style="color: gray;">' + interimTranscript + '</i>';
            this.analyzeSpeed(this.accumulatedText);
            this.analyzeEmotion(this.accumulatedText);
            this.analyzeClarity(this.accumulatedText);
            this.analyzeEngagement(this.accumulatedText);
            this.generateSuggestions(this.accumulatedText);
        };

        this.recognition.onend = () => {
            if (this.isRecording) {
                this.recognition.start();
            }
        };
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            if (!this.isRecording) {
                this.startRecording();
            } else {
                this.stopRecording();
            }
        });

        this.languageSelect.addEventListener('change', () => {
            this.currentLanguage = this.languageSelect.value;
            this.recognition.lang = this.currentLanguage;
            this.updateLanguageSupport();
            this.updateDialectInfo();
            this.updateUIWithCurrentLanguage();
        });

        this.downloadAudioBtn.addEventListener('click', () => this.downloadAudio());
        this.downloadReportBtn.addEventListener('click', () => this.downloadReport());
    }

    setupLanguageHandling() {
        // Initialiser le sélecteur de langue de reconnaissance vocale
        const languageSelect = document.getElementById('languageSelect');
        languageSelect.innerHTML = '<option value="">Sélectionner une langue...</option>';
        
        this.speechRecognitionLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            languageSelect.appendChild(option);
        });

        // Définir la langue par défaut
        languageSelect.value = this.currentLanguage;

        this.languageSelect.addEventListener('change', () => {
            this.currentLanguage = this.languageSelect.value;
            this.recognition.lang = this.currentLanguage;
            this.updateLanguageSupport();
            this.updateDialectInfo();
            this.updateUIWithCurrentLanguage(); // Mettre à jour l'interface
        });

        // Vérification initiale du support de la langue
        this.updateLanguageSupport();
        this.updateDialectInfo();
        this.updateUIWithCurrentLanguage(); // Mettre à jour l'interface initiale
    }

    updateLanguageSupport() {
        const language = this.currentLanguage.split('-')[0];
        const country = this.currentLanguage.split('-')[1];

        // Vérification du support (simulation - dans un cas réel, on vérifierait avec l'API)
        const isSupported = this.recognition.lang === this.currentLanguage;
        
        this.languageSupportDisplay.textContent = `Support de la langue: ${isSupported ? 'Vérifié' : 'Limité'}`;
        this.languageSupportDisplay.className = `language-support-info ${isSupported ? '' : 'unsupported'}`;
    }

    updateDialectInfo() {
        const language = this.currentLanguage.split('-')[0];
        const country = this.currentLanguage.split('-')[1];
        
        let dialectInfo = '';
        switch (language) {
            case 'sw':
                dialectInfo = country === 'KE' ? 'Dialecte: Kiswahili (Kenya)' : 'Dialecte: Kiswahili (Tanzanie)';
                break;
            case 'am':
                dialectInfo = 'Dialecte: Amharique standard';
                break;
            case 'zu':
                dialectInfo = 'Dialecte: isiZulu standard';
                break;
            case 'yo':
                dialectInfo = 'Dialecte: Yoruba standard';
                break;
            case 'ha':
                dialectInfo = 'Dialecte: Haoussa standard';
                break;
            default:
                dialectInfo = `Dialecte: ${this.currentLanguage}`;
        }
        
        this.dialectInfoDisplay.textContent = dialectInfo;
    }

    getLanguageConfig() {
        return this.languageConfig[this.currentLanguage] || this.defaultLanguageConfig;
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.pauseCount = 0;
            this.hesitationCount = 0;
            this.accumulatedText = '';
            this.totalWords = 0;
            this.totalSpeakingTime = 0;
            this.lastPauseTime = null;
            this.isPaused = false;
            
            this.setupAudioAnalysis(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.start();
            this.recognition.start();
            this.isRecording = true;
            this.startButton.textContent = 'Arrêter l\'enregistrement';
            this.startButton.classList.add('recording');
            this.startTime = Date.now();
            this.lastSpeechTime = Date.now();
            this.startTimer();

            // Activation des boutons de téléchargement
            this.downloadAudioBtn.disabled = true;
            this.downloadReportBtn.disabled = true;

            if (this.autoStopCheckbox.checked) {
                setTimeout(() => {
                    if (this.isRecording) {
                        this.stopRecording();
                    }
                }, this.maxDuration);
            }

        } catch (error) {
            console.error('Erreur lors de l\'accès au microphone:', error);
            this.statusDisplay.textContent = 'Erreur: Impossible d\'accéder au microphone';
        }
    }

    setupAudioAnalysis(stream) {
        const source = this.audioContext.createMediaStreamSource(stream);
        this.audioAnalyser = this.audioContext.createAnalyser();
        source.connect(this.audioAnalyser);
        
        this.audioAnalyser.fftSize = 2048;
        const bufferLength = this.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const analyzeTone = () => {
            if (!this.isRecording) return;

            this.audioAnalyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            
            if (average > 128) {
                this.voiceToneDisplay.textContent = 'Ton: Aigu';
            } else if (average > 64) {
                this.voiceToneDisplay.textContent = 'Ton: Médium';
            } else {
                this.voiceToneDisplay.textContent = 'Ton: Grave';
            }

            requestAnimationFrame(analyzeTone);
        };

        analyzeTone();
    }

    stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.recognition.stop();
            this.isRecording = false;
            this.startButton.textContent = 'Commencer l\'enregistrement';
            this.startButton.classList.remove('recording');
            clearInterval(this.timerInterval);

            // Activation des boutons de téléchargement
            this.downloadAudioBtn.disabled = false;
            this.downloadReportBtn.disabled = false;
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor((elapsed / 1000) % 60);
            const minutes = Math.floor((elapsed / 1000 / 60) % 60);
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (elapsed >= this.maxDuration) {
                this.stopRecording();
            }
        }, 1000);
    }

    analyzeSpeed(text) {
        const words = text.trim().split(/\s+/).length;
        const totalTime = Date.now() - this.startTime;
        
        // Mettre à jour le temps de parole total en tenant compte des pauses
        if (this.lastSpeechTime && Date.now() - this.lastSpeechTime > this.pauseThreshold) {
            if (!this.isPaused) {
                this.isPaused = true;
                this.lastPauseTime = this.lastSpeechTime;
            }
        } else {
            if (this.isPaused && this.lastPauseTime) {
                this.totalSpeakingTime += (this.lastSpeechTime - this.lastPauseTime);
                this.isPaused = false;
            }
        }

        const speakingTime = totalTime - (this.pauseCount * this.pauseThreshold);
        const minutes = speakingTime / 60000;
        const wpm = Math.round(words / minutes);
        
        // Ajuster la vitesse en fonction de la langue
        const config = this.getLanguageConfig();
        const optimalRange = config.optimalWpmRange;
        
        let speedStatus = '';
        if (wpm > optimalRange.max) {
            speedStatus = ' (trop rapide)';
        } else if (wpm < optimalRange.min) {
            speedStatus = ' (trop lent)';
        } else {
            speedStatus = ' (optimal)';
        }
        
        this.wpmDisplay.textContent = `${wpm} mots/minute${speedStatus}`;
    }

    analyzeEmotion(text) {
        // Analyse simple des émotions basée sur les mots-clés
        const emotions = {
            'joie': ['heureux', 'content', 'ravi', 'super', 'génial'],
            'colère': ['énervé', 'fâché', 'furieux', 'rage'],
            'tristesse': ['triste', 'déçu', 'malheureux', 'peine'],
            'neutre': []
        };

        let detectedEmotion = 'neutre';
        let maxCount = 0;

        for (const [emotion, keywords] of Object.entries(emotions)) {
            const count = keywords.reduce((acc, keyword) => {
                return acc + (text.toLowerCase().match(new RegExp(keyword, 'g')) || []).length;
            }, 0);

            if (count > maxCount) {
                maxCount = count;
                detectedEmotion = emotion;
            }
        }

        this.emotionDisplay.textContent = detectedEmotion;
    }

    analyzeClarity(text) {
        // Analyse simple de la clarté basée sur la longueur des phrases et la ponctuation
        const sentences = text.split(/[.!?]+/);
        let score = 10;

        // Pénalité pour les phrases trop longues
        const avgWordsPerSentence = sentences.reduce((acc, sentence) => {
            return acc + sentence.trim().split(/\s+/).length;
        }, 0) / sentences.length;

        if (avgWordsPerSentence > 20) score -= 2;
        if (avgWordsPerSentence > 30) score -= 2;

        // Pénalité pour le manque de ponctuation
        const punctuationCount = (text.match(/[.!?,]/g) || []).length;
        if (punctuationCount < text.length / 100) score -= 2;

        this.clarityDisplay.textContent = `${Math.max(0, Math.min(10, score))}/10`;
    }

    analyzeEngagement(text) {
        // Analyse simple de l'engagement basée sur des critères variés
        let score = 10;

        // Variété du vocabulaire
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const vocabularyRatio = uniqueWords.size / words.length;

        if (vocabularyRatio < 0.4) score -= 2;

        // Présence de questions rhétoriques
        const questions = (text.match(/\?/g) || []).length;
        if (questions === 0) score -= 1;

        // Utilisation d'expressions engageantes
        const engagingPhrases = ['imaginez', 'pensez', 'voyez', 'écoutez', 'regardez'];
        const hasEngagingPhrases = engagingPhrases.some(phrase => text.toLowerCase().includes(phrase));
        if (!hasEngagingPhrases) score -= 1;

        this.engagementDisplay.textContent = `${Math.max(0, Math.min(10, score))}/10`;
    }

    analyzeHesitations(text) {
        const config = this.getLanguageConfig();
        const words = text.toLowerCase().split(/\s+/);
        
        this.hesitationCount += words.filter(word => 
            config.hesitationWords.some(hesitation => word.includes(hesitation))
        ).length;
        
        this.hesitationCountDisplay.textContent = `Hésitations: ${this.hesitationCount}`;

        // Détecter les pauses et ajouter des points
        if (this.lastSpeechTime && Date.now() - this.lastSpeechTime > this.pauseThreshold) {
            this.pauseCount++;
            this.pauseCountDisplay.textContent = `Pauses: ${this.pauseCount}`;
            
            // Ajouter un point à la fin de la transcription si ce n'est pas déjà fait
            if (!this.accumulatedText.endsWith('.') && !this.accumulatedText.endsWith('!') && !this.accumulatedText.endsWith('?')) {
                this.accumulatedText += '.';
                this.transcriptionDisplay.innerHTML = this.accumulatedText;
            }
        }
    }

    generateSuggestions(text) {
        const config = this.getLanguageConfig();
        const suggestions = [];
        const words = text.trim().split(/\s+/).length;
        const totalTime = Date.now() - this.startTime;
        const speakingTime = totalTime - (this.pauseCount * this.pauseThreshold);
        const minutes = speakingTime / 60000;
        const wpm = Math.round(words / minutes);

        // Configuration des suggestions par langue
        const suggestionsConfig = {
            'fr-FR': {
                speed: {
                    tooFast: 'Parlez un peu plus lentement pour une meilleure compréhension.',
                    tooSlow: 'Vous pourriez accélérer légèrement votre débit pour maintenir l\'attention.',
                    optimal: 'Votre débit est optimal, continuez ainsi!'
                },
                hesitations: {
                    high: 'Essayez de réduire les hésitations en préparant mieux vos phrases.',
                    medium: 'Quelques hésitations sont présentes, mais cela reste acceptable.',
                    low: 'Excellent! Peu d\'hésitations dans votre discours.'
                },
                pauses: {
                    tooMany: 'Réduisez légèrement le nombre de pauses pour un discours plus fluide.',
                    tooFew: 'Ajoutez quelques pauses stratégiques pour mettre en valeur vos points importants.',
                    optimal: 'Votre utilisation des pauses est parfaite!'
                },
                engagement: {
                    low: 'Utilisez plus d\'expressions engageantes comme "imaginez", "pensez", "voyez".',
                    medium: 'Votre discours est engageant, mais vous pourriez ajouter quelques expressions interactives.',
                    high: 'Excellent niveau d\'engagement!'
                }
            },
            'en-US': {
                speed: {
                    tooFast: 'Try speaking a bit slower for better clarity.',
                    tooSlow: 'You could increase your pace slightly to maintain attention.',
                    optimal: 'Your speaking pace is perfect, keep it up!'
                },
                hesitations: {
                    high: 'Try to reduce hesitations by preparing your sentences better.',
                    medium: 'Some hesitations are present, but still acceptable.',
                    low: 'Excellent! Very few hesitations in your speech.'
                },
                pauses: {
                    tooMany: 'Slightly reduce the number of pauses for a more fluid speech.',
                    tooFew: 'Add some strategic pauses to emphasize important points.',
                    optimal: 'Your use of pauses is perfect!'
                },
                engagement: {
                    low: 'Use more engaging expressions like "imagine", "think", "consider".',
                    medium: 'Your speech is engaging, but you could add some interactive expressions.',
                    high: 'Excellent level of engagement!'
                }
            },
            'ar-SA': {
                speed: {
                    tooFast: 'حاول التحدث ببطء أكثر قليلاً للوضوح الأفضل.',
                    tooSlow: 'يمكنك زيادة وتيرتك قليلاً للحفاظ على الاهتمام.',
                    optimal: 'وتيرة حديثك مثالية، استمر!'
                },
                hesitations: {
                    high: 'حاول تقليل التردد من خلال تحضير جملك بشكل أفضل.',
                    medium: 'هناك بعض التردد، لكنه مقبول.',
                    low: 'ممتاز! القليل من التردد في حديثك.'
                },
                pauses: {
                    tooMany: 'قلل قليلاً من عدد التوقفات لخطاب أكثر سلاسة.',
                    tooFew: 'أضف بعض التوقفات الاستراتيجية للتأكيد على النقاط المهمة.',
                    optimal: 'استخدامك للتوقفات مثالي!'
                },
                engagement: {
                    low: 'استخدم المزيد من التعبيرات التفاعلية مثل "تخيل"، "فكر"، "انظر".',
                    medium: 'خطابك تفاعلي، لكن يمكنك إضافة بعض التعبيرات التفاعلية.',
                    high: 'مستوى ممتاز من التفاعل!'
                }
            }
        };

        // Obtenir la configuration de suggestions pour la langue actuelle
        const langSuggestions = suggestionsConfig[this.currentLanguage] || suggestionsConfig['en-US'];

        // Suggestions basées sur la vitesse
        if (wpm > config.optimalWpmRange.max) {
            suggestions.push(langSuggestions.speed.tooFast);
        } else if (wpm < config.optimalWpmRange.min) {
            suggestions.push(langSuggestions.speed.tooSlow);
        } else {
            suggestions.push(langSuggestions.speed.optimal);
        }

        // Suggestions basées sur les hésitations
        const hesitationRatio = this.hesitationCount / words;
        if (hesitationRatio > 0.1) {
            suggestions.push(langSuggestions.hesitations.high);
        } else if (hesitationRatio > 0.05) {
            suggestions.push(langSuggestions.hesitations.medium);
        } else {
            suggestions.push(langSuggestions.hesitations.low);
        }

        // Suggestions basées sur les pauses
        const pauseRatio = this.pauseCount / minutes;
        if (pauseRatio > 5) {
            suggestions.push(langSuggestions.pauses.tooMany);
        } else if (pauseRatio < 2) {
            suggestions.push(langSuggestions.pauses.tooFew);
        } else {
            suggestions.push(langSuggestions.pauses.optimal);
        }

        // Suggestions basées sur l'engagement
        const engagementScore = this.calculateEngagementScore(text);
        if (engagementScore < 5) {
            suggestions.push(langSuggestions.engagement.low);
        } else if (engagementScore < 8) {
            suggestions.push(langSuggestions.engagement.medium);
        } else {
            suggestions.push(langSuggestions.engagement.high);
        }

        // Mettre à jour l'affichage des suggestions
        this.suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');
    }

    calculateEngagementScore(text) {
        let score = 10;
        const config = this.getLanguageConfig();
        
        // Vérifier l'utilisation d'expressions engageantes
        const hasEngagingPhrases = config.engagingPhrases.some(phrase => 
            text.toLowerCase().includes(phrase.toLowerCase())
        );
        if (!hasEngagingPhrases) score -= 2;

        // Vérifier la variété du vocabulaire
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = new Set(words);
        const vocabularyRatio = uniqueWords.size / words.length;
        if (vocabularyRatio < 0.4) score -= 2;

        // Vérifier la présence de questions
        const questions = (text.match(/\?/g) || []).length;
        if (questions === 0) score -= 1;

        // Vérifier la longueur des phrases
        const sentences = text.split(/[.!?]+/);
        const avgWordsPerSentence = sentences.reduce((acc, sentence) => 
            acc + sentence.trim().split(/\s+/).length, 0) / sentences.length;
        if (avgWordsPerSentence > 20) score -= 1;

        return Math.max(0, Math.min(10, score));
    }

    async downloadAudio() {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'enregistrement.webm';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }

    async downloadReport() {
        try {
            // Vérifier si l'enregistrement est terminé
            if (this.isRecording) {
                alert('Veuillez arrêter l\'enregistrement avant de générer le rapport.');
                return;
            }

            // Vérifier s'il y a du contenu à inclure dans le rapport
            if (!this.accumulatedText.trim()) {
                alert('Aucun contenu à inclure dans le rapport. Veuillez d\'abord enregistrer du contenu.');
                return;
            }

            // Calculer le temps d'enregistrement réel (en excluant les pauses)
            const totalTime = Date.now() - this.startTime;
            const speakingTime = totalTime - (this.pauseCount * this.pauseThreshold);
            const words = this.accumulatedText.trim().split(/\s+/).length;
            const minutes = speakingTime / 60000;
            const wpm = Math.round(words / minutes);

            // Obtenir la traduction si elle existe
            let translatedText = '';
            if (this.translationResult && this.translationResult.textContent && 
                this.translationResult.textContent !== '[Zone de traduction]' && 
                this.translationResult.textContent !== 'Traduction en cours...' && 
                this.translationResult.textContent !== 'Erreur de traduction. Veuillez réessayer.') {
                translatedText = this.translationResult.textContent;
            }

            const report = {
                title: 'Rapport d\'enregistrement',
                date: new Date().toLocaleString(),
                duration: this.formatTime(speakingTime),
                sourceLanguage: this.getLanguageName(this.languageSelect.value),
                targetLanguage: this.translationTargetLanguage ? this.getLanguageName(this.translationTargetLanguage.value) : 'Non spécifiée',
                metrics: {
                    speechRate: `${wpm} mots/minute`,
                    emotion: this.emotionDisplay.textContent,
                    clarity: this.clarityDisplay.textContent,
                    engagement: this.engagementDisplay.textContent,
                    pauses: this.pauseCountDisplay.textContent,
                    hesitations: this.hesitationCountDisplay.textContent,
                    voiceTone: this.voiceToneDisplay.textContent
                },
                transcription: {
                    originalText: this.accumulatedText,
                    translatedText: translatedText,
                    targetLanguage: this.translationTargetLanguage ? this.getLanguageName(this.translationTargetLanguage.value) : 'Non spécifiée'
                },
                suggestions: Array.from(this.suggestionsList.children).map(li => li.textContent),
                metadata: this.isFieldInterview ? {
                    interviewer: document.getElementById('interviewerInput')?.value || 'Non spécifié',
                    interviewee: document.getElementById('intervieweeInput')?.value || 'Non spécifié',
                    location: document.getElementById('locationInput')?.value || 'Non spécifié',
                    context: document.getElementById('contextInput')?.value || 'Non spécifié',
                    notes: document.getElementById('notesInput')?.value || 'Aucune note',
                    markers: this.markers.map(marker => ({
                        time: marker.timestamp,
                        text: marker.text
                    })),
                    environmentalInfo: {
                        noiseLevel: document.getElementById('noiseLevel')?.textContent || 'Non mesuré',
                        gpsCoordinates: document.getElementById('gpsCoordinates')?.textContent || 'Non disponible'
                    }
                } : null
            };

            // Créer le contenu du rapport avec un style amélioré
            const reportContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${report.title}</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            margin: 40px;
                            color: #333;
                        }
                        .report-container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: #fff;
                            padding: 20px;
                            box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        }
                        .report-header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #3498db;
                        }
                        .report-section {
                            margin-bottom: 30px;
                            padding: 15px;
                            background: #f8f9fa;
                            border-radius: 8px;
                        }
                        h1 { color: #2C3E50; font-size: 24px; }
                        h2 { color: #3498DB; font-size: 20px; margin-top: 20px; }
                        h3 { color: #2C3E50; font-size: 18px; margin-top: 15px; }
                        .metrics-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 15px;
                            margin: 15px 0;
                        }
                        .metric-item {
                            background: #fff;
                            padding: 10px;
                            border-radius: 5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        .transcription-section, .translation-section {
                            background: #fff;
                            padding: 15px;
                            border-radius: 8px;
                            margin: 10px 0;
                            border: 1px solid #e9ecef;
                        }
                        .suggestions-list {
                            list-style-type: none;
                            padding: 0;
                        }
                        .suggestions-list li {
                            margin: 10px 0;
                            padding: 10px;
                            background: #fff;
                            border-radius: 5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        .metadata-section {
                            background: #fff;
                            padding: 15px;
                            border-radius: 8px;
                            margin-top: 20px;
                        }
                        .marker-item {
                            margin: 10px 0;
                            padding: 10px;
                            background: #fff;
                            border-radius: 5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        .marker-time {
                            font-weight: bold;
                            color: #3498db;
                        }
                        @media print {
                            body { margin: 0; }
                            .report-container { box-shadow: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        <div class="report-header">
                            <h1>${report.title}</h1>
                            <p>Date: ${report.date}</p>
                            <p>Durée: ${report.duration}</p>
                            <p>Langue source: ${report.sourceLanguage}</p>
                            ${report.targetLanguage !== 'Non spécifiée' ? `<p>Langue cible: ${report.targetLanguage}</p>` : ''}
                        </div>

                        <div class="report-section">
                            <h2>Métriques</h2>
                            <div class="metrics-grid">
                                <div class="metric-item">
                                    <strong>Débit de parole:</strong> ${report.metrics.speechRate}
                                </div>
                                <div class="metric-item">
                                    <strong>Émotion:</strong> ${report.metrics.emotion}
                                </div>
                                <div class="metric-item">
                                    <strong>Clarté:</strong> ${report.metrics.clarity}
                                </div>
                                <div class="metric-item">
                                    <strong>Engagement:</strong> ${report.metrics.engagement}
                                </div>
                                <div class="metric-item">
                                    <strong>Pauses:</strong> ${report.metrics.pauses}
                                </div>
                                <div class="metric-item">
                                    <strong>Hésitations:</strong> ${report.metrics.hesitations}
                                </div>
                                <div class="metric-item">
                                    <strong>Ton de voix:</strong> ${report.metrics.voiceTone}
                                </div>
                            </div>
                        </div>

                        <div class="report-section">
                            <h2>Transcription</h2>
                            <div class="transcription-section">
                                <h3>Texte original (${report.sourceLanguage})</h3>
                                <p>${report.transcription.originalText}</p>
                            </div>
                            ${report.transcription.translatedText ? `
                            <div class="translation-section">
                                <h3>Traduction (${report.transcription.targetLanguage})</h3>
                                <p>${report.transcription.translatedText}</p>
                            </div>
                            ` : ''}
                        </div>

                        <div class="report-section">
                            <h2>Suggestions</h2>
                            <ul class="suggestions-list">
                                ${report.suggestions.map(suggestion => `
                                    <li>${suggestion}</li>
                                `).join('')}
                            </ul>
                        </div>

                        ${report.metadata ? `
                            <div class="report-section">
                                <h2>Métadonnées de l'entretien</h2>
                                <div class="metadata-section">
                                    <p><strong>Interviewer:</strong> ${report.metadata.interviewer}</p>
                                    <p><strong>Interviewé:</strong> ${report.metadata.interviewee}</p>
                                    <p><strong>Lieu:</strong> ${report.metadata.location}</p>
                                    <p><strong>Contexte:</strong> ${report.metadata.context}</p>
                                    <p><strong>Notes:</strong> ${report.metadata.notes}</p>
                                    <p><strong>Niveau de bruit:</strong> ${report.metadata.environmentalInfo.noiseLevel}</p>
                                    <p><strong>Coordonnées GPS:</strong> ${report.metadata.environmentalInfo.gpsCoordinates}</p>
                                    
                                    <h3>Marqueurs temporels</h3>
                                    ${report.metadata.markers.map(marker => `
                                        <div class="marker-item">
                                            <span class="marker-time">[${marker.time}]</span>
                                            <span class="marker-text">${marker.text}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </body>
                </html>`;

            // Créer et télécharger le fichier
            const blob = new Blob([reportContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ALEXIA_Rapport_${new Date().toISOString().slice(0,10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            alert('Erreur lors de la génération du rapport. Veuillez réessayer plus tard.');
        }
    }

    formatTime(milliseconds) {
        if (!milliseconds || milliseconds <= 0) return '00:00';
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    calculateWPM() {
        if (!this.accumulatedText.trim() || !this.startTime) return 0;
        const words = this.accumulatedText.trim().split(/\s+/).length;
        const totalTime = Date.now() - this.startTime;
        const speakingTime = totalTime - (this.pauseCount * this.pauseThreshold);
        const minutes = speakingTime / 60000;
        return Math.round(words / minutes);
    }

    getLocalizedMessage(key, lang) {
        const messages = {
            'fr-FR': {
                slowDown: 'Essayez de parler un peu plus lentement pour une meilleure clarté.',
                speedUp: 'Vous pourriez augmenter légèrement votre débit pour maintenir l\'attention.',
                reduceHesitations: 'Réduisez les hésitations en préparant mieux votre discours.',
                addPauses: 'Ajoutez quelques pauses stratégiques pour mettre l\'accent sur les points importants.',
                goodStructure: 'Votre discours est bien structuré, continuez ainsi!'
            },
            'en-US': {
                slowDown: 'Try speaking a bit slower for better clarity.',
                speedUp: 'You could increase your pace slightly to maintain attention.',
                reduceHesitations: 'Try to reduce hesitations by preparing better.',
                addPauses: 'Add some strategic pauses to emphasize important points.',
                goodStructure: 'Your speech is well structured, keep it up!'
            },
            'sw-KE': {
                slowDown: 'Jaribu kuzungumza polepole zaidi kwa ufafanuzi bora.',
                speedUp: 'Unaweza kuongeza kasi kidogo kudumisha umakini.',
                reduceHesitations: 'Jaribu kupunguza kusita kwa kujiandaa vizuri.',
                addPauses: 'Ongeza vituo muhimu kusisitiza mambo muhimu.',
                goodStructure: 'Hotuba yako imeundwa vizuri, endelea hivyo!'
            }
            // Ajouter d'autres langues selon les besoins
        };

        // Utiliser les messages en anglais comme fallback
        return (messages[lang] || messages['en-US'])[key];
    }

    getLanguageName(langCode) {
        const languageNames = {
            // Langues Européennes
            'en-US': 'English',
            'fr-FR': 'Français',
            'de-DE': 'Deutsch',
            'es-ES': 'Español',
            'it-IT': 'Italiano',
            'pt-PT': 'Português',
            'nl-NL': 'Nederlands',
            'pl-PL': 'Polski',
            'ru-RU': 'Русский',
            
            // Langues Africaines
            'fon-BJ': 'Fongbè',
            'sw-KE': 'Kiswahili (Kenya)',
            'sw-TZ': 'Kiswahili (Tanzania)',
            'am-ET': 'አማርኛ',
            'wo-SN': 'Wolof',
            'yo-NG': 'Yorùbá',
            'ha-NG': 'Hausa',
            'zu-ZA': 'isiZulu',
            
            // Langues Asiatiques
            'zh-CN': '中文',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'hi-IN': 'हिन्दी',
            'ar-SA': 'العربية',
            'fa-IR': 'فارسی',
            'tr-TR': 'Türkçe'
        };
        return languageNames[langCode] || langCode;
    }

    updateStatus(message) {
        const statusElement = document.getElementById('authStatus');
        if (!statusElement) return;
        statusElement.textContent = message;
        statusElement.className = 'status-message ' + (message.includes('Erreur') ? 'error' : 'success');
    }

    setupFieldInterviewUI() {
        // Créer et ajouter l'interface pour le mode entretien
        const fieldModeContainer = document.createElement('div');
        fieldModeContainer.className = 'field-mode-container';
        fieldModeContainer.innerHTML = `
            <div class="field-mode-header">
                <label>
                    <input type="checkbox" id="fieldModeToggle">
                    Mode Entretien de Terrain
                </label>
            </div>
            <div class="field-mode-panel" style="display: none;">
                <div class="metadata-section">
                    <input type="text" id="locationInput" placeholder="Lieu de l'entretien">
                    <input type="text" id="interviewerInput" placeholder="Nom de l'enquêteur">
                    <input type="text" id="intervieweeInput" placeholder="Identifiant de l'interviewé">
                    <textarea id="contextInput" placeholder="Contexte de l'entretien"></textarea>
                    <input type="text" id="tagsInput" placeholder="Tags (séparés par des virgules)">
                </div>
                <div class="quick-notes">
                    <textarea id="notesInput" placeholder="Notes rapides..."></textarea>
                    <button id="addMarkerBtn">Ajouter un marqueur temporel</button>
                </div>
                <div class="environmental-info">
                    <div id="noiseLevel">Niveau de bruit: --</div>
                    <div id="gpsCoordinates">GPS: --</div>
                </div>
                <div class="common-expressions">
                    <select id="expressionSelect">
                        <option value="">Expressions courantes...</option>
                    </select>
                </div>
            </div>
        `;

        document.querySelector('.container').insertBefore(
            fieldModeContainer,
            document.querySelector('.recorder-container')
        );

        this.setupFieldModeListeners();
    }

    setupFieldModeListeners() {
        const fieldModeToggle = document.getElementById('fieldModeToggle');
        const fieldModePanel = document.querySelector('.field-mode-panel');
        const addMarkerBtn = document.getElementById('addMarkerBtn');
        const expressionSelect = document.getElementById('expressionSelect');

        fieldModeToggle.addEventListener('change', (e) => {
            this.isFieldInterview = e.target.checked;
            fieldModePanel.style.display = this.isFieldInterview ? 'block' : 'none';
            if (this.isFieldInterview) {
                this.startFieldMode();
            } else {
                this.stopFieldMode();
            }
        });

        addMarkerBtn.addEventListener('click', () => {
            this.addTimeMarker();
        });

        expressionSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                this.insertCommonExpression(e.target.value);
                e.target.value = '';
            }
        });

        // Sauvegarder les notes automatiquement
        document.getElementById('notesInput').addEventListener('input', (e) => {
            this.interviewMetadata.notes.push({
                timestamp: new Date().toISOString(),
                text: e.target.value
            });
        });
    }

    startFieldMode() {
        // Activer le GPS
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    this.gpsCoordinates = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    document.getElementById('gpsCoordinates').textContent = 
                        `GPS: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
                },
                null,
                { enableHighAccuracy: true }
            );
        }

        // Démarrer l'analyse du bruit ambiant
        this.startNoiseAnalysis();

        // Charger les expressions courantes
        this.updateCommonExpressions();
    }

    stopFieldMode() {
        // Arrêter le GPS et l'analyse du bruit
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(this.gpsWatchId);
        }
    }

    startNoiseAnalysis() {
        if (this.audioAnalyser) {
            const analyzeNoise = () => {
                if (!this.isFieldInterview) return;

                const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
                this.audioAnalyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                this.backgroundNoise = average;

                const config = this.fieldLanguageConfig[this.currentLanguage] || 
                             this.fieldLanguageConfig['en-US'];

                let noiseMessage;
                if (average > 128) {
                    noiseMessage = config.noiseWarnings.high;
                } else if (average > 64) {
                    noiseMessage = config.noiseWarnings.medium;
                } else {
                    noiseMessage = config.noiseWarnings.low;
                }

                document.getElementById('noiseLevel').textContent = 
                    `${noiseMessage}`;

                requestAnimationFrame(analyzeNoise);
            };

            analyzeNoise();
        }
    }

    addTimeMarker() {
        const timestamp = Date.now() - this.startTime;
        const minutes = Math.floor(timestamp / 60000);
        const seconds = Math.floor((timestamp % 60000) / 1000);
        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const marker = {
            timestamp: formattedTime,
            text: document.getElementById('notesInput').value || 'Marqueur',
            transcriptPosition: this.transcriptionDisplay.textContent.length
        };

        this.markers.push(marker);
        this.updateMarkersDisplay();
    }

    updateMarkersDisplay() {
        const markersContainer = document.querySelector('.markers-list') || 
            (() => {
                const container = document.createElement('div');
                container.className = 'markers-list';
                document.querySelector('.field-mode-panel').appendChild(container);
                return container;
            })();

        markersContainer.innerHTML = this.markers
            .map(marker => `
                <div class="marker-item">
                    <span class="marker-time">${marker.timestamp}</span>
                    <span class="marker-text">${marker.text}</span>
                </div>
            `)
            .join('');
    }

    updateCommonExpressions() {
        const select = document.getElementById('expressionSelect');
        const config = this.fieldLanguageConfig[this.currentLanguage] || 
                      this.fieldLanguageConfig['fr-FR'];

        select.innerHTML = `
            <option value="">${this.getLocalizedMessage('selectExpression', 'fieldMode')}</option>
            ${config.commonExpressions.map(expr => 
                `<option value="${expr}">${expr}</option>`
            ).join('')}
        `;
    }

    insertCommonExpression(expression) {
        // Insérer l'expression dans les notes
        const notesInput = document.getElementById('notesInput');
        const currentPosition = notesInput.selectionStart;
        const currentValue = notesInput.value;
        notesInput.value = 
            currentValue.slice(0, currentPosition) + 
            expression + 
            currentValue.slice(currentPosition);
    }

    getNoiseLevel() {
        if (this.backgroundNoise > 128) return 'high';
        if (this.backgroundNoise > 64) return 'medium';
        return 'low';
    }

    updateUIWithCurrentLanguage() {
        console.log('Mise à jour de l\'interface avec la langue:', this.currentLanguage);
        const translations = this.uiTranslations[this.currentLanguage] || this.uiTranslations['en-US'];
        
        // Mettre à jour les textes de l'interface
        if (this.startButton) {
            this.startButton.textContent = this.isRecording ? translations.stopRecording : translations.startRecording;
        }
        if (this.statusDisplay) {
            this.statusDisplay.textContent = translations.ready;
        }
        if (this.wpmDisplay) {
            this.wpmDisplay.textContent = `${translations.speechRate}: 0`;
        }
        if (this.emotionDisplay) {
            this.emotionDisplay.textContent = `${translations.emotion}: --`;
        }
        if (this.clarityDisplay) {
            this.clarityDisplay.textContent = `${translations.clarity}: --`;
        }
        if (this.engagementDisplay) {
            this.engagementDisplay.textContent = `${translations.engagement}: --`;
        }
        if (this.voiceToneDisplay) {
            this.voiceToneDisplay.textContent = `${translations.voiceTone}: --`;
        }
        if (this.pauseCountDisplay) {
            this.pauseCountDisplay.textContent = `${translations.pauses}: 0`;
        }
        if (this.hesitationCountDisplay) {
            this.hesitationCountDisplay.textContent = `${translations.hesitations}: 0`;
        }
        
        // Mettre à jour les textes des boutons
        if (this.downloadAudioBtn) {
            this.downloadAudioBtn.textContent = translations.downloadAudio;
        }
        if (this.downloadReportBtn) {
            this.downloadReportBtn.textContent = translations.downloadReport;
        }
        
        // Mettre à jour les placeholders
        if (this.languageSelect) {
            const defaultOption = this.languageSelect.querySelector('option[value=""]');
            if (defaultOption) {
                defaultOption.textContent = translations.selectLanguage;
            }
        }
        if (this.translationTargetLanguage) {
            const defaultOption = this.translationTargetLanguage.querySelector('option[value=""]');
            if (defaultOption) {
                defaultOption.textContent = translations.selectTargetLanguage;
            }
        }
        
        // Mettre à jour les textes du mode entretien
        if (this.isFieldInterview) {
            this.updateFieldModeUI();
        }
    }

    updateFieldModeUI() {
        const translations = this.uiTranslations[this.currentLanguage] || this.uiTranslations['en-US'];
        
        // Mettre à jour les textes du mode entretien
        const fieldModeLabel = document.querySelector('.field-mode-header label');
        if (fieldModeLabel) {
            fieldModeLabel.textContent = translations.fieldMode;
        }
        
        // Mettre à jour les placeholders
        const elements = {
            'locationInput': translations.locationPlaceholder,
            'interviewerInput': translations.interviewerPlaceholder,
            'intervieweeInput': translations.intervieweePlaceholder,
            'contextInput': translations.contextPlaceholder,
            'tagsInput': translations.tagsPlaceholder,
            'notesInput': translations.notesPlaceholder
        };

        for (const [id, placeholder] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.placeholder = placeholder;
            }
        }
        
        // Mettre à jour le bouton d'ajout de marqueur
        const addMarkerBtn = document.getElementById('addMarkerBtn');
        if (addMarkerBtn) {
            addMarkerBtn.textContent = translations.addMarker;
        }
        
        // Mettre à jour les informations environnementales
        const noiseLevel = document.getElementById('noiseLevel');
        if (noiseLevel) {
            noiseLevel.textContent = `${translations.noiseLevel}: --`;
        }
        const gpsCoordinates = document.getElementById('gpsCoordinates');
        if (gpsCoordinates) {
            gpsCoordinates.textContent = `${translations.gpsCoordinates}: --`;
        }
        
        // Mettre à jour le sélecteur d'expressions courantes
        const expressionSelect = document.getElementById('expressionSelect');
        if (expressionSelect) {
            const defaultOption = expressionSelect.querySelector('option[value=""]');
            if (defaultOption) {
                defaultOption.textContent = translations.commonExpressions;
            }
        }
    }

    setupTranslationListeners() {
        this.translateButton.addEventListener('click', () => {
            if (this.accumulatedText) {
                this.translateText();
            }
        });

        this.autoTranslateCheckbox.addEventListener('change', (e) => {
            this.autoTranslate = e.target.checked;
            if (this.autoTranslate && this.accumulatedText) {
                this.translateText();
            }
        });

        // Initialiser le sélecteur de langue de traduction
        this.initializeTranslationLanguageSelect();

        // Ajouter un écouteur pour le changement de langue cible
        this.translationTargetLanguage.addEventListener('change', () => {
            if (this.autoTranslate && this.accumulatedText) {
                this.translateText();
            }
        });
    }

    initializeTranslationLanguageSelect() {
        // Vider le sélecteur existant
        this.translationTargetLanguage.innerHTML = '<option value="">Sélectionner une langue...</option>';

        // Séparer les langues prioritaires et non prioritaires
        const priorityLanguages = this.availableLanguages.filter(lang => lang.priority);
        const otherLanguages = this.availableLanguages.filter(lang => !lang.priority);

        // Trier les langues non prioritaires par nom
        const sortedOtherLanguages = [...otherLanguages].sort((a, b) => a.name.localeCompare(b.name));

        // Ajouter d'abord les langues prioritaires
        priorityLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            this.translationTargetLanguage.appendChild(option);
        });

        // Ajouter un séparateur si des langues prioritaires existent
        if (priorityLanguages.length > 0) {
            const separator = document.createElement('option');
            separator.disabled = true;
            separator.textContent = '──────────';
            this.translationTargetLanguage.appendChild(separator);
        }

        // Ajouter ensuite les autres langues
        sortedOtherLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            this.translationTargetLanguage.appendChild(option);
        });
    }

    async translateText() {
        if (!this.accumulatedText) {
            this.translationResult.textContent = '[Zone de traduction]';
            return;
        }

        this.translationResult.textContent = 'Traduction en cours...';
        this.translateButton.disabled = true;

        try {
            const targetLang = this.translationTargetLanguage.value;
            const sourceLang = this.languageSelect.value;

            // Convertir les codes de langue au format attendu par Google Translate
            const sourceCode = sourceLang.split('-')[0];
            const targetCode = targetLang.split('-')[0];

            // Utiliser l'API Google Translate
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceCode}&tl=${targetCode}&dt=t&q=${encodeURIComponent(this.accumulatedText)}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erreur de traduction');
            }

            const data = await response.json();
            // L'API Google Translate retourne un tableau imbriqué, nous devons extraire le texte traduit
            const translatedText = data[0].map(x => x[0]).join('');
            this.translationResult.textContent = translatedText;

        } catch (error) {
            console.error('Erreur lors de la traduction:', error);
            this.translationResult.textContent = 'Erreur de traduction. Veuillez réessayer.';
        } finally {
            this.translateButton.disabled = false;
        }
    }
}

// Initialisation explicite de la classe au chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
    // Initialiser ALEXIA uniquement sur index.html (ou la page d'accueil)
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' ) {
        console.log('DOM entièrement chargé, initialisation de ALEXIA');
        window.alexiaApp = new ALEXIA();
    }
    // Masquer dynamiquement la ligne du sélecteur de langue d'interface
    const interfaceLangLabel = Array.from(document.querySelectorAll('label')).find(
        l => l.textContent && l.textContent.includes('Interface Language')
    );
    if (interfaceLangLabel && interfaceLangLabel.parentElement) {
        interfaceLangLabel.parentElement.style.display = 'none';
    }

    // Barre de navigation dynamique
    const userStatus = document.getElementById('userStatus');
    const authNavLink = document.getElementById('authNavLink');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    let authToken = localStorage.getItem('authToken') || null;
    let authEmail = localStorage.getItem('authEmail') || null;
    if (userStatus) {
        if (authToken && authEmail) {
            userStatus.textContent = 'Connecté : ' + authEmail;
            if (authNavLink) authNavLink.style.display = 'none';
            if (logoutNavBtn) logoutNavBtn.style.display = '';
        } else {
            userStatus.textContent = 'Non connecté';
            if (authNavLink) authNavLink.style.display = '';
            if (logoutNavBtn) logoutNavBtn.style.display = 'none';
        }
    }
    if (logoutNavBtn) {
        logoutNavBtn.onclick = () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authEmail');
            if (userStatus) userStatus.textContent = 'Non connecté';
            if (authNavLink) authNavLink.style.display = '';
            logoutNavBtn.style.display = 'none';
            window.location.href = 'auth.html';
        };
    }
    if (document.getElementById('loginBtn')) {
        document.getElementById('loginBtn').onclick = async () => {
            setLoading(true);
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try {
                const res = await fetch('http://localhost:4000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.token) {
                    authToken = data.token;
                    authEmail = data.email;
                    localStorage.setItem('authToken', authToken);
                    localStorage.setItem('authEmail', authEmail);
                    showStatus('Connecté en tant que ' + data.email, 'success');
                    document.getElementById('logoutBtn').style.display = '';
                    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
                } else {
                    showStatus(data.error || 'Erreur', 'error');
                }
            } catch (e) {
                showStatus('Erreur de connexion au serveur', 'error');
            } finally {
                setLoading(false);
            }
        };
    }
    if (document.getElementById('registerBtn')) {
        document.getElementById('registerBtn').onclick = async () => {
            setLoading(true);
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            try {
                const res = await fetch('http://localhost:4000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.success) {
                    showStatus('Inscription réussie, connectez-vous.', 'success');
                } else {
                    showStatus(data.error || 'Erreur', 'error');
                }
            } catch (e) {
                showStatus('Erreur de connexion au serveur', 'error');
            } finally {
                setLoading(false);
            }
        };
    }
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').onclick = () => {
            authToken = null;
            authEmail = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authEmail');
            showStatus('Déconnecté', 'success');
            document.getElementById('logoutBtn').style.display = 'none';
            setTimeout(() => { window.location.href = 'auth.html'; }, 1000);
        };
    }
    // Si on est sur auth.html et déjà connecté, masquer le formulaire et rediriger
    if (window.location.pathname.endsWith('auth.html') && authToken) {
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.innerHTML = `<div class='status-message success'>Déjà connecté en tant que <b>${authEmail}</b>. Redirection...</div>`;
        }
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
        return;
    }
});

// Gestion améliorée de l'authentification
function showStatus(message, type = 'success') {
    const status = document.getElementById('authStatus');
    if (!status) return;
    status.textContent = message;
    status.className = 'status-message ' + type;
}

function setLoading(isLoading) {
    const loader = document.getElementById('loginLoader');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    if (loader) loader.style.display = isLoading ? '' : 'none';
    if (loginBtn) loginBtn.disabled = isLoading;
    if (registerBtn) registerBtn.disabled = isLoading;
} 