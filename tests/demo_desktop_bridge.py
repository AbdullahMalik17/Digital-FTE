"""
Demo: Desktop Automation Bridge
Shows desktop automation capabilities.
"""

import time
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.integrations.desktop_bridge import (
    DesktopBridge,
    WindowAction,
    MouseButton,
    ScreenRegion
)


def demo_basic_info():
    """Demo basic system information."""
    print("\n" + "="*70)
    print("DESKTOP BRIDGE - SYSTEM INFORMATION")
    print("="*70)

    bridge = DesktopBridge()

    print(f"\nPlatform: {bridge.platform}")
    print(f"PyAutoGUI Available: {bridge._pyautogui_available}")

    if bridge._pyautogui_available:
        screen_size = bridge.get_screen_size()
        print(f"Screen Size: {screen_size[0]}x{screen_size[1]}")

        mouse_pos = bridge.get_mouse_position()
        print(f"Current Mouse Position: ({mouse_pos[0]}, {mouse_pos[1]})")


def demo_window_management():
    """Demo window management capabilities."""
    print("\n\n" + "="*70)
    print("WINDOW MANAGEMENT")
    print("="*70)

    bridge = DesktopBridge()

    print("\n[Listing] Open windows...")
    windows = bridge.list_windows()

    if windows:
        print(f"\nFound {len(windows)} open windows:")
        for i, window in enumerate(windows[:10], 1):  # Show first 10
            status = []
            if window.is_active:
                status.append("ACTIVE")
            if window.is_minimized:
                status.append("MINIMIZED")
            if window.is_maximized:
                status.append("MAXIMIZED")

            status_str = " | ".join(status) if status else "NORMAL"
            print(f"  {i}. {window.title[:50]}... [{status_str}]")

        if len(windows) > 10:
            print(f"  ... and {len(windows) - 10} more")
    else:
        print("\nNo windows found (or window management not available on this platform)")


def demo_keyboard_automation():
    """Demo keyboard automation."""
    print("\n\n" + "="*70)
    print("KEYBOARD AUTOMATION")
    print("="*70)

    bridge = DesktopBridge()

    if not bridge._pyautogui_available:
        print("\n[SKIP] PyAutoGUI not available")
        print("Install with: pip install pyautogui")
        return

    print("\nKeyboard automation features:")
    print("  - type_text(): Type text with optional intervals")
    print("  - press_key(): Press individual keys (Enter, Tab, etc.)")
    print("  - hotkey(): Press key combinations (Ctrl+C, Alt+Tab)")
    print("  - Common shortcuts: copy(), paste(), select_all(), save()")

    print("\nExample hotkeys:")
    print("  - Ctrl+C: Copy to clipboard")
    print("  - Ctrl+V: Paste from clipboard")
    print("  - Ctrl+A: Select all")
    print("  - Ctrl+S: Save")
    print("  - Alt+Tab: Switch applications")

    print("\n[NOTE] Keyboard automation ready (use with caution!)")


def demo_mouse_automation():
    """Demo mouse automation."""
    print("\n\n" + "="*70)
    print("MOUSE AUTOMATION")
    print("="*70)

    bridge = DesktopBridge()

    if not bridge._pyautogui_available:
        print("\n[SKIP] PyAutoGUI not available")
        return

    print("\nMouse automation features:")
    print("  - move_mouse(x, y): Move to position")
    print("  - click(x, y, button): Click at position")
    print("  - get_mouse_position(): Get current position")

    print("\nMouse buttons:")
    print("  - LEFT (default)")
    print("  - RIGHT")
    print("  - MIDDLE")

    print("\nClick types:")
    print("  - Single click: clicks=1")
    print("  - Double click: clicks=2")

    print("\n[NOTE] Mouse automation ready (use with caution!)")


def demo_screenshot():
    """Demo screenshot capabilities."""
    print("\n\n" + "="*70)
    print("SCREENSHOT CAPABILITIES")
    print("="*70)

    bridge = DesktopBridge()

    if not bridge._pyautogui_available:
        print("\n[SKIP] PyAutoGUI not available")
        return

    print("\nScreenshot features:")
    print("  - take_screenshot(): Full screen or region")
    print("  - take_window_screenshot(title): Capture specific window")
    print("  - find_on_screen(image): Find image on screen")

    print("\n[Demo] Taking a screenshot...")
    screenshot_path = bridge.take_screenshot()

    if screenshot_path:
        print(f"[Success] Screenshot saved: {screenshot_path}")
    else:
        print("[Failed] Could not take screenshot")


def demo_application_control():
    """Demo application launching."""
    print("\n\n" + "="*70)
    print("APPLICATION CONTROL")
    print("="*70)

    bridge = DesktopBridge()

    print("\nApplication control features:")
    print("  - launch_application(path, args): Launch apps")
    print("  - manage_window(title, action): Control windows")

    print("\nWindow actions:")
    print("  - MINIMIZE: Minimize window")
    print("  - MAXIMIZE: Maximize window")
    print("  - RESTORE: Restore to normal size")
    print("  - CLOSE: Close window")
    print("  - FOCUS: Bring to front")
    print("  - MOVE: Move to position")
    print("  - RESIZE: Change size")

    print("\n[NOTE] Application control ready")


def demo_common_workflows():
    """Demo common workflow shortcuts."""
    print("\n\n" + "="*70)
    print("COMMON WORKFLOWS")
    print("="*70)

    bridge = DesktopBridge()

    print("\nBuilt-in workflow shortcuts:")
    print("  - copy_to_clipboard(): Ctrl+C")
    print("  - paste_from_clipboard(): Ctrl+V")
    print("  - select_all(): Ctrl+A")
    print("  - save(): Ctrl+S")
    print("  - switch_application(): Alt+Tab")
    print("  - open_task_manager(): Ctrl+Shift+Esc (Windows)")

    print("\nUtility functions:")
    print("  - wait(seconds): Pause execution")
    print("  - alert(message): Show alert dialog")
    print("  - confirm(message): Show confirmation dialog")


def demo_features_overview():
    """Demo features overview."""
    print("\n\n" + "="*70)
    print("DESKTOP BRIDGE FEATURES")
    print("="*70)

    print("\nKey Features:")
    print("  1. Window Management")
    print("     - List all windows")
    print("     - Find windows by title")
    print("     - Control window state")
    print("     - Multi-monitor support")

    print("\n  2. Keyboard Automation")
    print("     - Type text")
    print("     - Press keys")
    print("     - Hotkey combinations")
    print("     - Common shortcuts")

    print("\n  3. Mouse Automation")
    print("     - Move mouse")
    print("     - Click buttons")
    print("     - Smooth movements")
    print("     - Position tracking")

    print("\n  4. Screenshot & Vision")
    print("     - Full screen capture")
    print("     - Window capture")
    print("     - Region capture")
    print("     - Image recognition")

    print("\n  5. Application Control")
    print("     - Launch applications")
    print("     - Focus windows")
    print("     - Close applications")

    print("\nCross-Platform Support:")
    print("  - Windows: Full support")
    print("  - macOS: Partial support (coming soon)")
    print("  - Linux: Partial support (coming soon)")

    print("\nSafety Features:")
    print("  - FAILSAFE: Move mouse to corner to abort")
    print("  - PAUSE: Small delay between actions")
    print("  - Confirmation dialogs")

    print("\nDependencies:")
    print("  - pyautogui: Core automation")
    print("  - pygetwindow: Window management (Windows)")
    print("  - Pillow: Screenshot capture")


def main():
    """Run all demos."""
    print("\n" + "="*70)
    print("DESKTOP AUTOMATION BRIDGE - DEMO")
    print("="*70)
    print("\nThis demo shows desktop automation capabilities.")
    print("NOTE: Some features require PyAutoGUI installation:")
    print("  pip install pyautogui pillow pygetwindow")
    print("\n" + "="*70)

    # Demo 1: Basic info
    demo_basic_info()

    # Demo 2: Window management
    demo_window_management()

    # Demo 3: Keyboard automation
    demo_keyboard_automation()

    # Demo 4: Mouse automation
    demo_mouse_automation()

    # Demo 5: Screenshots
    demo_screenshot()

    # Demo 6: Application control
    demo_application_control()

    # Demo 7: Common workflows
    demo_common_workflows()

    # Demo 8: Features overview
    demo_features_overview()

    print("\n" + "="*70)
    print("DEMO COMPLETE")
    print("="*70)
    print("\nThe Desktop Bridge provides:")
    print("  - Complete desktop automation")
    print("  - Window management")
    print("  - Keyboard & mouse control")
    print("  - Screenshot capabilities")
    print("  - Application launching")
    print("\nUse with caution - desktop automation is powerful!")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
