class MusicPlayer {
    constructor() {
        this.currentTrack = null;
        this.isPlaying = false;
        this.audio = new Audio();
        this.playlist = [];
        this.currentIndex = 0;
        this.repeatMode = 'none'; // none, one, all
        this.isShuffled = false;
        this.shuffledPlaylist = [];

        // Initialize UI elements
        this.initializeUI();
        this.setupEventListeners();
        this.loadSampleTracks();
    }

    initializeUI() {
        // Controls
        this.playPauseBtn = document.getElementById('play-pause');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.shuffleBtn = document.getElementById('shuffle');
        this.repeatBtn = document.getElementById('repeat');
        this.volumeSlider = document.getElementById('volume');
        
        // Progress
        this.progressContainer = document.querySelector('.progress-bar-container');
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTimeSpan = document.querySelector('.current-time');
        this.durationSpan = document.querySelector('.duration');
        
        // Track Info
        this.currentTrackName = document.querySelector('.current-track-name');
        this.currentTrackArtist = document.querySelector('.current-track-artist');
        this.currentTrackCover = document.querySelector('.current-track-cover');
        
        // Playlist
        this.playlistContainer = document.getElementById('playlist-items');
        
        // Search
        this.searchInput = document.querySelector('.search-bar input');
    }

    setupEventListeners() {
        // Playback Controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Volume Control
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Progress Bar
        this.progressContainer.addEventListener('click', (e) => this.seek(e));
        
        // Audio Events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.handleTrackEnd());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        
        // Search
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    loadSampleTracks() {
        this.playlist = [
            {
                name: "Sample Track 1",
                artist: "Artist 1",
                audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                cover: "https://picsum.photos/400/400?random=1"
            },
            {
                name: "Sample Track 2",
                artist: "Artist 2",
                audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                cover: "https://picsum.photos/400/400?random=2"
            },
            {
                name: "Sample Track 3",
                artist: "Artist 3",
                audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                cover: "https://picsum.photos/400/400?random=3"
            }
        ];

        this.shuffledPlaylist = [...this.playlist];
        this.renderPlaylist();
        this.loadTrack(0);
    }

    renderPlaylist() {
        this.playlistContainer.innerHTML = '';
        const displayList = this.isShuffled ? this.shuffledPlaylist : this.playlist;
        
        displayList.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === this.currentIndex) li.classList.add('playing');
            
            li.innerHTML = `
                <div class="track-info">
                    <span class="track-name">${track.name}</span>
                    <span class="track-artist">${track.artist}</span>
                </div>
            `;
            
            li.addEventListener('click', () => this.playTrack(index));
            this.playlistContainer.appendChild(li);
        });
    }

    loadTrack(index) {
        const displayList = this.isShuffled ? this.shuffledPlaylist : this.playlist;
        this.currentIndex = index;
        this.currentTrack = displayList[index];
        
        this.audio.src = this.currentTrack.audio;
        this.currentTrackName.textContent = this.currentTrack.name;
        this.currentTrackArtist.textContent = this.currentTrack.artist;
        this.currentTrackCover.src = this.currentTrack.cover;
        
        this.renderPlaylist();
    }

    playTrack(index) {
        this.loadTrack(index);
        this.play();
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    playNext() {
        const displayList = this.isShuffled ? this.shuffledPlaylist : this.playlist;
        let nextIndex = this.currentIndex + 1;
        if (nextIndex >= displayList.length) nextIndex = 0;
        this.playTrack(nextIndex);
    }

    playPrevious() {
        const displayList = this.isShuffled ? this.shuffledPlaylist : this.playlist;
        let prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) prevIndex = displayList.length - 1;
        this.playTrack(prevIndex);
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active');
        
        if (this.isShuffled) {
            this.shuffledPlaylist = [...this.playlist]
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
        }
        
        this.renderPlaylist();
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        if (this.repeatMode === 'one') {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo-alt"></i>';
        } else {
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i>';
        }
    }

    handleTrackEnd() {
        switch(this.repeatMode) {
            case 'one':
                this.audio.currentTime = 0;
                this.play();
                break;
            case 'all':
                this.playNext();
                break;
            case 'none':
                if (this.currentIndex < this.playlist.length - 1) {
                    this.playNext();
                } else {
                    this.pause();
                }
                break;
        }
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    seek(event) {
        const percent = event.offsetX / this.progressContainer.offsetWidth;
        this.audio.currentTime = percent * this.audio.duration;
    }

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.currentTimeSpan.textContent = this.formatTime(this.audio.currentTime);
    }

    updateDuration() {
        this.durationSpan.textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase();
        const items = this.playlistContainer.getElementsByClassName('playlist-item');
        
        Array.from(items).forEach(item => {
            const trackName = item.querySelector('.track-name').textContent.toLowerCase();
            const artistName = item.querySelector('.track-artist').textContent.toLowerCase();
            
            if (trackName.includes(searchTerm) || artistName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
    initializeProfileSettings();
});

function initializeProfileSettings() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    }
    
    darkModeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('light-mode');
        
        // Update button text and save preference
        if (document.body.classList.contains('light-mode')) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            localStorage.setItem('theme', 'light');
        } else {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            localStorage.setItem('theme', 'dark');
        }
    });
    
    // Profile Link
    document.getElementById('profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        showProfile();
    });
    
    // Settings Link
    document.getElementById('settings-link').addEventListener('click', (e) => {
        e.preventDefault();
        showSettings();
    });
    
    // Logout Link
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}

function showProfile() {
    const contentArea = document.querySelector('.content-area');
    const profileSection = document.createElement('section');
    profileSection.className = 'profile-section';
    profileSection.innerHTML = `
        <div class="profile-header">
            <img src="Spiderman in the Rain Wallpaper HD 4K Background POSTER free download UltraHD for PC Desktop laptop and mobile.jpg" alt="Profile" class="large-profile-pic">
            <div class="profile-info">
                <h2>HackNCollege</h2>
                <p class="user-type"><i class="fas fa-crown"></i> Premium Member</p>
                <div class="bio">Music enthusiast | Spider-Man fan | Web developer</div>
            </div>
        </div>
        
        <div class="stats-container">
            <div class="stats">
                <div class="stat">
                    <span class="number">128</span>
                    <span class="label">Playlists</span>
                </div>
                <div class="stat">
                    <span class="number">845</span>
                    <span class="label">Following</span>
                </div>
                <div class="stat">
                    <span class="number">2.3k</span>
                    <span class="label">Followers</span>
                </div>
                <div class="stat">
                    <span class="number">4.8k</span>
                    <span class="label">Liked Songs</span>
                </div>
            </div>
        </div>

        <div class="recent-activity">
            <h3>Recent Activity</h3>
            <div class="activity-list">
                <div class="activity-item">
                    <i class="fas fa-music"></i>
                    <div class="activity-content">
                        <p>Added 12 songs to "Coding Mix"</p>
                        <span class="time">2 hours ago</span>
                    </div>
                </div>
                <div class="activity-item">
                    <i class="fas fa-heart"></i>
                    <div class="activity-content">
                        <p>Liked "Web of Dreams" by Spider-Verse</p>
                        <span class="time">5 hours ago</span>
                    </div>
                </div>
                <div class="activity-item">
                    <i class="fas fa-users"></i>
                    <div class="activity-content">
                        <p>Started following "Music Producers Hub"</p>
                        <span class="time">1 day ago</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    replaceContent(contentArea, profileSection);
}

function showSettings() {
    const contentArea = document.querySelector('.content-area');
    const settingsSection = document.createElement('section');
    settingsSection.className = 'settings-section';
    settingsSection.innerHTML = `
        <h2><i class="fas fa-cog"></i> Settings</h2>
        
        <div class="settings-container">
            <div class="settings-group">
                <h3>Playback</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Autoplay</span>
                            <span class="setting-description">Automatically play next song</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="autoplay-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">High Quality Streaming</span>
                            <span class="setting-description">Stream music in HD quality (uses more data)</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="quality-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Crossfade</span>
                            <span class="setting-description">Smooth transition between songs</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="crossfade-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-group">
                <h3>Notifications</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Push Notifications</span>
                            <span class="setting-description">Get notified about new releases</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="notifications-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Email Updates</span>
                            <span class="setting-description">Receive weekly music recommendations</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="email-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-group">
                <h3>Privacy</h3>
                <div class="settings-options">
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Private Session</span>
                            <span class="setting-description">Hide your listening activity</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="private-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Share History</span>
                            <span class="setting-description">Let friends see your music taste</span>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="share-toggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    `;
    replaceContent(contentArea, settingsSection);
    
    // Save settings when changed
    settingsSection.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            localStorage.setItem(checkbox.id, checkbox.checked);
            // Show a save confirmation
            showToast(`${checkbox.closest('.setting-item').querySelector('.setting-title').textContent} updated!`);
        });
        
        // Load saved settings
        const savedValue = localStorage.getItem(checkbox.id);
        if (savedValue !== null) {
            checkbox.checked = savedValue === 'true';
        }
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        // Clear any saved user data
        localStorage.clear();
        // Redirect to login page (in a real app)
        alert('Logged out successfully!');
        window.location.reload();
    }
}

function replaceContent(contentArea, newSection) {
    // Remove all sections except the music player
    Array.from(contentArea.children).forEach(child => {
        if (!child.classList.contains('music-player')) {
            child.remove();
        }
    });
    // Insert new section before the music player
    contentArea.insertBefore(newSection, contentArea.querySelector('.music-player'));
}
