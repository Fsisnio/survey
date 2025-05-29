<?php
/**
 * Plugin Name: Speech Analysis Application
 * Plugin URI: [your-website]
 * Description: A multilingual speech analysis application with field interview capabilities
 * Version: 1.0.0
 * Author: [your-name]
 * License: MIT
 */

// Prevent direct access to this file
if (!defined('ABSPATH')) {
    exit;
}

// Register scripts and styles
function speech_analysis_enqueue_scripts() {
    // Enqueue main styles
    wp_enqueue_style(
        'speech-analysis-styles',
        plugins_url('assets/styles.css', __FILE__),
        array(),
        '1.0.0'
    );

    // Enqueue Font Awesome
    wp_enqueue_style(
        'font-awesome',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
        array(),
        '6.0.0'
    );

    // Enqueue Chart.js
    wp_enqueue_script(
        'chartjs',
        'https://cdn.jsdelivr.net/npm/chart.js',
        array(),
        '3.7.0',
        true
    );

    // Enqueue main application script
    wp_enqueue_script(
        'speech-analysis-app',
        plugins_url('assets/app.js', __FILE__),
        array('jquery'),
        '1.0.0',
        true
    );

    // Enqueue translations script
    wp_enqueue_script(
        'speech-analysis-translations',
        plugins_url('assets/translations.js', __FILE__),
        array('speech-analysis-app'),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'speech_analysis_enqueue_scripts');

// Add shortcode for embedding the application
function speech_analysis_shortcode() {
    ob_start();
    include plugin_dir_path(__FILE__) . 'templates/app-template.php';
    return ob_get_clean();
}
add_shortcode('speech_analysis', 'speech_analysis_shortcode');

// Add menu item to WordPress admin
function speech_analysis_admin_menu() {
    add_menu_page(
        'Speech Analysis Settings',
        'Speech Analysis',
        'manage_options',
        'speech-analysis-settings',
        'speech_analysis_settings_page',
        'dashicons-microphone',
        30
    );
}
add_action('admin_menu', 'speech_analysis_admin_menu');

// Create the settings page
function speech_analysis_settings_page() {
    ?>
    <div class="wrap">
        <h1>Speech Analysis Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('speech_analysis_options');
            do_settings_sections('speech_analysis_settings');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

// Register plugin settings
function speech_analysis_register_settings() {
    register_setting('speech_analysis_options', 'speech_analysis_settings');
    
    add_settings_section(
        'speech_analysis_main_section',
        'Main Settings',
        'speech_analysis_section_callback',
        'speech_analysis_settings'
    );
}
add_action('admin_init', 'speech_analysis_register_settings');

// Section callback
function speech_analysis_section_callback() {
    echo '<p>Configure your Speech Analysis application settings here.</p>';
}

// Installation hook
function speech_analysis_activate() {
    // Create necessary directories
    $upload_dir = wp_upload_dir();
    $speech_analysis_dir = $upload_dir['basedir'] . '/speech-analysis';
    
    if (!file_exists($speech_analysis_dir)) {
        wp_mkdir_p($speech_analysis_dir);
    }
}
register_activation_hook(__FILE__, 'speech_analysis_activate');

// Uninstallation hook
function speech_analysis_uninstall() {
    // Clean up any plugin data if necessary
}
register_uninstall_hook(__FILE__, 'speech_analysis_uninstall'); 