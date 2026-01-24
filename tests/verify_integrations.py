"""
Verification test for Mobile Bridge and Spotify Mock Mode.
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from bridges.mobile_bridge import mobile_bridge
from integrations.spotify_client import spotify_client

def test_mobile():
    print("--- Testing Mobile Bridge ---")
    if mobile_bridge.connected:
        print(f"✅ Connected to device: {mobile_bridge.device_id}")
        
        battery = mobile_bridge.get_battery_status()
        print(f"🔋 Battery: {battery.get('level')}% ({battery.get('status')})")
        
        print("📸 Attempting to take a test screenshot...")
        if mobile_bridge.take_screenshot("tests/phone_test.png"):
            print("✅ Screenshot saved to tests/phone_test.png")
        else:
            print("❌ Screenshot failed.")
    else:
        print("❌ Mobile Bridge not connected.")

def test_spotify():
    print("\n--- Testing Spotify Integration (Mock Mode) ---")
    print(f"Mock Mode Active: {spotify_client.mock_mode}")
    spotify_client.play_playlist("Deep Focus", shuffle=True)
    playback = spotify_client.get_current_playback()
    if playback:
        song = playback['item']['name']
        artist = playback['item']['artists'][0]['name']
        print(f"🎵 Currently 'Playing': {song} by {artist}")

if __name__ == "__main__":
    test_mobile()
    test_spotify()
