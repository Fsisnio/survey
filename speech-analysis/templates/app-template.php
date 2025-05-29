<?php
// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="speech-analysis-wrapper">
    <!-- Theme Toggle -->
    <div class="theme-toggle">
        <button class="theme-button" id="themeToggle">
            <i class="fas fa-moon"></i>
        </button>
    </div>

    <!-- Main Container -->
    <div class="container">
        <h1><?php _e('Speech Analysis Application', 'speech-analysis'); ?></h1>

        <!-- Language Settings -->
        <div class="settings-container">
            <div class="language-selector">
                <label for="uiLanguageSelect"><?php _e('Interface Language', 'speech-analysis'); ?></label>
                <select id="uiLanguageSelect" class="select-style">
                    <option value="en-US">English</option>
                    <option value="fr-FR">Français</option>
                    <option value="fon-BJ">Fongbè</option>
                </select>
            </div>
            <div class="language-selector">
                <label for="languageSelect"><?php _e('Speech Language', 'speech-analysis'); ?></label>
                <select id="languageSelect" class="select-style">
                    <optgroup label="African Languages">
                        <option value="fon-BJ">Fongbè (Benin)</option>
                        <option value="sw-KE">Kiswahili (Kenya)</option>
                        <option value="am-ET">አማርኛ (Ethiopia)</option>
                        <option value="zu-ZA">isiZulu (South Africa)</option>
                    </optgroup>
                    <optgroup label="European Languages">
                        <option value="en-US">English (US)</option>
                        <option value="fr-FR">Français (France)</option>
                    </optgroup>
                </select>
            </div>
        </div>

        <!-- Language Support Info -->
        <div class="language-info">
            <div id="languageSupport" class="language-support-info"></div>
            <div id="dialectInfo" class="dialect-info"></div>
        </div>

        <!-- Field Interview Mode -->
        <div id="fieldModeContainer"></div>

        <!-- Recording Controls -->
        <div class="recorder-container">
            <button id="startButton" class="button">
                <?php _e('Start Recording', 'speech-analysis'); ?>
            </button>
            <div id="timer" class="timer">00:00</div>
            <div id="status" class="status"></div>
            <div class="checkbox-container">
                <input type="checkbox" id="autoStopCheckbox">
                <label for="autoStopCheckbox"><?php _e('Auto-stop after 2 minutes', 'speech-analysis'); ?></label>
            </div>
        </div>

        <!-- Results -->
        <div class="results-container">
            <div class="result-box">
                <h3><?php _e('Speech Rate', 'speech-analysis'); ?></h3>
                <p id="wpm">0 WPM</p>
            </div>
            <div class="result-box">
                <h3><?php _e('Emotion', 'speech-analysis'); ?></h3>
                <p id="emotion">-</p>
            </div>
            <div class="result-box">
                <h3><?php _e('Clarity', 'speech-analysis'); ?></h3>
                <p id="clarity">0/10</p>
            </div>
            <div class="result-box">
                <h3><?php _e('Engagement', 'speech-analysis'); ?></h3>
                <p id="engagement">0/10</p>
            </div>
        </div>

        <!-- Advanced Metrics -->
        <div class="advanced-metrics">
            <div class="metric-box">
                <h3><?php _e('Voice Analysis', 'speech-analysis'); ?></h3>
                <p id="voiceTone"><?php _e('Tone: -', 'speech-analysis'); ?></p>
                <p id="pauseCount"><?php _e('Pauses: 0', 'speech-analysis'); ?></p>
                <p id="hesitationCount"><?php _e('Hesitations: 0', 'speech-analysis'); ?></p>
            </div>
            <div class="metric-box">
                <h3><?php _e('Suggestions', 'speech-analysis'); ?></h3>
                <ul id="suggestions" class="suggestions-list"></ul>
            </div>
        </div>

        <!-- Transcription -->
        <div class="transcription" id="transcription"></div>

        <!-- Post-Recording Actions -->
        <div class="post-recording-actions">
            <button id="downloadAudio" class="button secondary" disabled>
                <?php _e('Download Audio', 'speech-analysis'); ?>
            </button>
            <button id="downloadReport" class="button secondary" disabled>
                <?php _e('Download Report', 'speech-analysis'); ?>
            </button>
        </div>
    </div>
</div> 