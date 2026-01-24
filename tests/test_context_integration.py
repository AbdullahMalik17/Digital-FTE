"""
Test Context Monitor Integration with Spotify and Mobile Bridge.
"""
import asyncio
import sys
import os
from datetime import datetime
from unittest.mock import MagicMock, patch

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.intelligence.context_monitor import ContextMonitor, ContextType
from src.intelligence.agentic_intelligence import AgenticIntelligence

async def test_integration():
    print("--- Testing Context Monitor Integration ---")
    
    # Mock Intelligence
    intelligence = MagicMock(spec=AgenticIntelligence)
    
    # Initialize Monitor
    monitor = ContextMonitor(intelligence, monitoring_interval=1, enable_push_notifications=False)
    
    # --- Test 1: Spotify Logic ---
    print("\n[Test 1] Spotify Focus Time Logic")
    with patch('src.intelligence.context_monitor.spotify_client') as mock_spotify:
        # Simulate: Not playing, and force time to be 10:30 AM
        mock_spotify.get_current_playback.return_value = {'is_playing': False}
        
        # Mock datetime to be 10:30 AM
        with patch('src.intelligence.context_monitor.datetime') as mock_datetime:
            mock_datetime.now.return_value = datetime(2026, 1, 24, 10, 30)
            
            # Run specific monitor method
            signals = await monitor._monitor_spotify()
            
            if signals and signals[0].type == ContextType.SPOTIFY:
                print("✅ Spotify Signal Generated:")
                print(f"   Trigger: {signals[0].trigger}")
                print(f"   Action: {signals[0].metadata['action']}")
            else:
                print("❌ Failed to generate Spotify signal")

    # --- Test 2: Mobile Battery Logic ---
    print("\n[Test 2] Mobile Battery Alert Logic")
    with patch('src.intelligence.context_monitor.mobile_bridge') as mock_mobile:
        mock_mobile.connected = True
        mock_mobile.get_battery_status.return_value = {'level': '15', 'status': 'Discharging'}
        
        # Run specific monitor method
        signals = await monitor._monitor_mobile()
        
        if signals and signals[0].type == ContextType.MOBILE:
            print("✅ Mobile Signal Generated:")
            print(f"   Trigger: {signals[0].trigger}")
            print(f"   Message: {signals[0].metadata['message']}")
        else:
            print("❌ Failed to generate Mobile signal")

if __name__ == "__main__":
    asyncio.run(test_integration())
