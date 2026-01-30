"""
Spotify Integration Client
Handles authentication and interaction with the Spotify Web API.
"""

import os
import time
from typing import Dict, List, Optional, Any
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from datetime import datetime

class SpotifyClient:
    """
    Wrapper for Spotify API interactions.
    Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in environment variables.
    """
    
    def __init__(self):
        self.client_id = os.getenv("SPOTIFY_CLIENT_ID")
        self.client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
        self.redirect_uri = os.getenv("SPOTIFY_REDIRECT_URI", "http://localhost:8888/callback")
        
        self.sp: Optional[spotipy.Spotify] = None
        self.is_authenticated = False
        self.mock_mode = False
        
        if self.client_id and self.client_secret:
            self._authenticate()
        else:
            print("WARNING: Spotify credentials not found. Switching to MOCK MODE.")
            self.mock_mode = True
            self.is_authenticated = True

    def _authenticate(self):
        """Authenticate with Spotify using OAuth2."""
        if self.mock_mode: return

        try:
            scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative"
            
            auth_manager = SpotifyOAuth(
                client_id=self.client_id,
                client_secret=self.client_secret,
                redirect_uri=self.redirect_uri,
                scope=scope,
                open_browser=False,
                cache_path="config/.spotify_cache"
            )
            
            self.sp = spotipy.Spotify(auth_manager=auth_manager)
            self.is_authenticated = True
            print("✅ Spotify Client Authenticated")
            
        except Exception as e:
            print(f"❌ Spotify Authentication Failed: {e}")
            self.is_authenticated = False

    def get_current_playback(self) -> Optional[Dict[str, Any]]:
        """Get information about the current playback status."""
        if self.mock_mode:
            return {
                "item": {"name": "Mock Song", "artists": [{"name": "Mock Artist"}]},
                "is_playing": True,
                "progress_ms": 30000
            }

        if not self.is_authenticated or not self.sp:
            return None
            
        try:
            return self.sp.current_playback()
        except Exception as e:
            print(f"Error getting playback: {e}")
            return None

    def play_playlist(self, playlist_name_or_id: str, shuffle: bool = False):
        """
        Play a specific playlist.
        Can accept a name (searches for it) or a URI/ID.
        """
        if self.mock_mode:
            print(f"🎵 [MOCK] Playing playlist: {playlist_name_or_id} (Shuffle: {shuffle})")
            return True

        if not self.is_authenticated or not self.sp:
            return False
            
        try:
            device = self._get_active_device()
            if not device:
                print("No active Spotify device found.")
                return False

            uri = playlist_name_or_id
            if not uri.startswith("spotify:"):
                # Search for playlist
                results = self.sp.current_user_playlists()
                for item in results['items']:
                    if item['name'].lower() == playlist_name_or_id.lower():
                        uri = item['uri']
                        break
                
                # If not found in user playlists, search global
                if not uri.startswith("spotify:"):
                    search_res = self.sp.search(playlist_name_or_id, type='playlist', limit=1)
                    if search_res['playlists']['items']:
                        uri = search_res['playlists']['items'][0]['uri']
            
            if uri:
                self.sp.start_playback(device_id=device['id'], context_uri=uri)
                if shuffle:
                    self.sp.shuffle(True, device_id=device['id'])
                return True
            else:
                print(f"Playlist '{playlist_name_or_id}' not found.")
                return False
                
        except Exception as e:
            print(f"Error playing playlist: {e}")
            return False

    def pause(self):
        """Pause playback."""
        if self.mock_mode:
            print("🎵 [MOCK] Paused playback")
            return
        if not self.is_authenticated or not self.sp: return
        try:
            self.sp.pause_playback()
        except Exception as e:
            print(f"Error pausing: {e}")

    def resume(self):
        """Resume playback."""
        if self.mock_mode:
            print("🎵 [MOCK] Resumed playback")
            return
        if not self.is_authenticated or not self.sp: return
        try:
            self.sp.start_playback()
        except Exception as e:
            print(f"Error resuming: {e}")

    def next_track(self):
        """Skip to next track."""
        if self.mock_mode:
            print("🎵 [MOCK] Skipped to next track")
            return
        if not self.is_authenticated or not self.sp: return
        try:
            self.sp.next_track()
        except Exception as e:
            print(f"Error skipping track: {e}")

    def set_volume(self, volume_percent: int):
        """Set volume (0-100)."""
        if self.mock_mode:
            print(f"🎵 [MOCK] Set volume to {volume_percent}%")
            return
        if not self.is_authenticated or not self.sp: return
        try:
            self.sp.volume(volume_percent)
        except Exception as e:
            print(f"Error setting volume: {e}")

    def _get_active_device(self) -> Optional[Dict[str, Any]]:
        """Helper to get the currently active device."""
        try:
            devices = self.sp.devices()
            for device in devices['devices']:
                if device['is_active']:
                    return device
            # If no active device, return the first one available
            if devices['devices']:
                return devices['devices'][0]
            return None
        except Exception:
            return None

# Singleton instance
spotify_client = SpotifyClient()
