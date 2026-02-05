class HLSPlayer {
    constructor() {
        this.video = document.getElementById('videoPlayer');
        this.urlInput = document.getElementById('hlsUrl');
        this.playBtn = document.getElementById('playBtn');
        this.videoOverlay = document.getElementById('videoOverlay');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.liveBadge = document.getElementById('liveBadge');
        this.streamStatus = document.getElementById('streamStatus');
        this.streamQuality = document.getElementById('streamQuality');
        this.streamLatency = document.getElementById('streamLatency');

        this.hls = null;
        this.isLive = false;

        this.init();
    }

    init() {
        this.playBtn.addEventListener('click', () => this.loadStream());

        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadStream();
        });

        // Sample stream buttons
        document.querySelectorAll('.stream-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                this.urlInput.value = url;
                this.loadStream();
            });
        });

        // Video events
        this.video.addEventListener('playing', () => this.onPlaying());
        this.video.addEventListener('waiting', () => this.onBuffering());
        this.video.addEventListener('error', (e) => this.onError(e));
    }

    loadStream() {
        const url = this.urlInput.value.trim();

        if (!url) {
            this.updateStatus('Please enter a URL', 'error');
            return;
        }

        if (!url.includes('.m3u8')) {
            this.updateStatus('Invalid HLS URL (must end with .m3u8)', 'error');
            return;
        }

        this.destroyPlayer();
        this.showLoading(true);
        this.videoOverlay.classList.add('hidden');
        this.updateStatus('Connecting...', '');

        if (Hls.isSupported()) {
            this.initHlsJs(url);
        } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            this.video.src = url;
            this.video.play().catch(e => this.onError(e));
        } else {
            this.updateStatus('HLS not supported in this browser', 'error');
            this.showLoading(false);
        }
    }

    initHlsJs(url) {
        this.hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });

        this.hls.loadSource(url);
        this.hls.attachMedia(this.video);

        this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            this.isLive = !this.hls.levels[0].details?.endSN;
            this.showLiveBadge(this.isLive);
            this.video.play().catch(e => console.warn('Autoplay blocked:', e));
            this.updateQualityInfo();
        });

        this.hls.on(Hls.Events.LEVEL_SWITCHED, () => {
            this.updateQualityInfo();
        });

        this.hls.on(Hls.Events.FRAG_LOADED, () => {
            this.updateLatency();
        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        this.updateStatus('Network error - retrying...', 'error');
                        this.hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        this.updateStatus('Media error - recovering...', 'error');
                        this.hls.recoverMediaError();
                        break;
                    default:
                        this.updateStatus('Fatal error: ' + data.details, 'error');
                        this.destroyPlayer();
                        break;
                }
            }
        });
    }

    onPlaying() {
        this.showLoading(false);
        this.updateStatus('Playing', 'connected');
    }

    onBuffering() {
        this.updateStatus('Buffering...', '');
    }

    onError(e) {
        console.error('Video error:', e);
        this.showLoading(false);
        this.updateStatus('Playback error', 'error');
    }

    updateStatus(text, className) {
        this.streamStatus.textContent = text;
        this.streamStatus.className = 'status-value';
        if (className) {
            this.streamStatus.classList.add(className);
        }
    }

    updateQualityInfo() {
        if (!this.hls) return;

        const currentLevel = this.hls.currentLevel;
        if (currentLevel >= 0 && this.hls.levels[currentLevel]) {
            const level = this.hls.levels[currentLevel];
            const height = level.height || 'Unknown';
            const bitrate = level.bitrate ? Math.round(level.bitrate / 1000) + ' kbps' : '';
            this.streamQuality.textContent = height + 'p' + (bitrate ? ` (${bitrate})` : '');
        }
    }

    updateLatency() {
        if (!this.hls || !this.isLive) {
            this.streamLatency.textContent = '-';
            return;
        }

        const latency = this.hls.latency;
        if (latency !== undefined && latency !== null) {
            this.streamLatency.textContent = latency.toFixed(1) + 's';
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingSpinner.classList.add('visible');
        } else {
            this.loadingSpinner.classList.remove('visible');
        }
    }

    showLiveBadge(show) {
        if (show) {
            this.liveBadge.classList.add('visible');
        } else {
            this.liveBadge.classList.remove('visible');
        }
    }

    destroyPlayer() {
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
        this.video.src = '';
        this.showLiveBadge(false);
        this.streamQuality.textContent = '-';
        this.streamLatency.textContent = '-';
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new HLSPlayer();
});
