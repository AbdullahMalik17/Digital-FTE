"""
Desktop Automation Bridge - Control desktop applications and windows.
Uses PyAutoGUI and platform-specific tools for cross-platform automation.
"""

import platform
import subprocess
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum


class WindowAction(Enum):
    """Window management actions."""
    MINIMIZE = "minimize"
    MAXIMIZE = "maximize"
    RESTORE = "restore"
    CLOSE = "close"
    FOCUS = "focus"
    MOVE = "move"
    RESIZE = "resize"


class MouseButton(Enum):
    """Mouse buttons."""
    LEFT = "left"
    RIGHT = "right"
    MIDDLE = "middle"


@dataclass
class WindowInfo:
    """Information about a window."""
    title: str
    process_name: str
    position: Tuple[int, int]  # (x, y)
    size: Tuple[int, int]  # (width, height)
    is_active: bool
    is_minimized: bool
    is_maximized: bool


@dataclass
class ScreenRegion:
    """Region of the screen."""
    x: int
    y: int
    width: int
    height: int


class DesktopBridge:
    """
    Desktop automation bridge for controlling applications and UI.

    Features:
    - Window management
    - Keyboard automation
    - Mouse automation
    - Screenshot capture
    - Application launching
    - File operations
    """

    def __init__(self):
        """Initialize desktop bridge."""
        self.platform = platform.system()  # Windows, Darwin (macOS), Linux
        self._pyautogui_available = False
        self._initialize_automation()

    def _initialize_automation(self):
        """Initialize automation libraries."""
        try:
            import pyautogui
            self.pyautogui = pyautogui
            self._pyautogui_available = True

            # Set safety settings
            self.pyautogui.FAILSAFE = True  # Move mouse to corner to abort
            self.pyautogui.PAUSE = 0.1  # Small pause between actions

            print("[Desktop Bridge] PyAutoGUI initialized")
        except ImportError:
            print("[Desktop Bridge] PyAutoGUI not available (install: pip install pyautogui)")
            print("[Desktop Bridge] Limited functionality - only basic operations available")

    # Window Management

    def list_windows(self) -> List[WindowInfo]:
        """
        List all open windows.

        Returns:
            List of WindowInfo objects
        """
        windows = []

        if self.platform == "Windows":
            windows = self._list_windows_windows()
        elif self.platform == "Darwin":
            windows = self._list_windows_macos()
        elif self.platform == "Linux":
            windows = self._list_windows_linux()

        return windows

    def _list_windows_windows(self) -> List[WindowInfo]:
        """List windows on Windows OS."""
        try:
            import pygetwindow as gw
            windows = []

            for window in gw.getAllWindows():
                if window.title:  # Skip windows without titles
                    windows.append(WindowInfo(
                        title=window.title,
                        process_name="",  # Would need psutil to get this
                        position=(window.left, window.top),
                        size=(window.width, window.height),
                        is_active=window.isActive,
                        is_minimized=window.isMinimized,
                        is_maximized=window.isMaximized
                    ))

            return windows
        except ImportError:
            print("[Desktop Bridge] pygetwindow not available (install: pip install pygetwindow)")
            return []

    def _list_windows_macos(self) -> List[WindowInfo]:
        """List windows on macOS."""
        # TODO: Implement using Quartz or osascript
        return []

    def _list_windows_linux(self) -> List[WindowInfo]:
        """List windows on Linux."""
        # TODO: Implement using wmctrl or xdotool
        return []

    def find_window(self, title_contains: str) -> Optional[WindowInfo]:
        """
        Find a window by title substring.

        Args:
            title_contains: Substring to search for in window title

        Returns:
            WindowInfo if found, None otherwise
        """
        windows = self.list_windows()

        for window in windows:
            if title_contains.lower() in window.title.lower():
                return window

        return None

    def manage_window(
        self,
        window_title: str,
        action: WindowAction,
        **kwargs
    ) -> bool:
        """
        Perform action on a window.

        Args:
            window_title: Window title or substring
            action: Action to perform
            **kwargs: Additional parameters (e.g., x, y for move)

        Returns:
            True if successful
        """
        if self.platform != "Windows":
            print(f"[Desktop Bridge] Window management not yet implemented for {self.platform}")
            return False

        try:
            import pygetwindow as gw

            # Find window
            windows = gw.getWindowsWithTitle(window_title)
            if not windows:
                print(f"[Desktop Bridge] Window not found: {window_title}")
                return False

            window = windows[0]

            # Perform action
            if action == WindowAction.MINIMIZE:
                window.minimize()
            elif action == WindowAction.MAXIMIZE:
                window.maximize()
            elif action == WindowAction.RESTORE:
                window.restore()
            elif action == WindowAction.CLOSE:
                window.close()
            elif action == WindowAction.FOCUS:
                window.activate()
            elif action == WindowAction.MOVE:
                x = kwargs.get('x', window.left)
                y = kwargs.get('y', window.top)
                window.moveTo(x, y)
            elif action == WindowAction.RESIZE:
                width = kwargs.get('width', window.width)
                height = kwargs.get('height', window.height)
                window.resizeTo(width, height)

            return True

        except ImportError:
            print("[Desktop Bridge] pygetwindow not available")
            return False
        except Exception as e:
            print(f"[Desktop Bridge] Error managing window: {e}")
            return False

    # Keyboard Automation

    def type_text(self, text: str, interval: float = 0.0):
        """
        Type text with optional interval between characters.

        Args:
            text: Text to type
            interval: Seconds between each character
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return

        self.pyautogui.write(text, interval=interval)

    def press_key(self, key: str, presses: int = 1):
        """
        Press a key one or more times.

        Args:
            key: Key name (e.g., 'enter', 'tab', 'esc', 'a')
            presses: Number of times to press
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return

        self.pyautogui.press(key, presses=presses)

    def hotkey(self, *keys: str):
        """
        Press a combination of keys (hotkey).

        Args:
            *keys: Keys to press together (e.g., 'ctrl', 'c')
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return

        self.pyautogui.hotkey(*keys)

    # Mouse Automation

    def move_mouse(self, x: int, y: int, duration: float = 0.0):
        """
        Move mouse to position.

        Args:
            x: X coordinate
            y: Y coordinate
            duration: Seconds to take for movement (smooth)
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return

        self.pyautogui.moveTo(x, y, duration=duration)

    def click(
        self,
        x: Optional[int] = None,
        y: Optional[int] = None,
        button: MouseButton = MouseButton.LEFT,
        clicks: int = 1
    ):
        """
        Click at position or current position.

        Args:
            x: X coordinate (None = current position)
            y: Y coordinate (None = current position)
            button: Mouse button to click
            clicks: Number of clicks (2 = double-click)
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return

        self.pyautogui.click(x, y, clicks=clicks, button=button.value)

    def get_mouse_position(self) -> Tuple[int, int]:
        """
        Get current mouse position.

        Returns:
            (x, y) coordinates
        """
        if not self._pyautogui_available:
            return (0, 0)

        return self.pyautogui.position()

    # Screenshot Capture

    def take_screenshot(
        self,
        region: Optional[ScreenRegion] = None,
        save_path: Optional[str] = None
    ) -> Optional[str]:
        """
        Capture screenshot.

        Args:
            region: Region to capture (None = entire screen)
            save_path: Path to save screenshot (None = auto-generate)

        Returns:
            Path to saved screenshot
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return None

        try:
            # Capture screenshot
            if region:
                screenshot = self.pyautogui.screenshot(
                    region=(region.x, region.y, region.width, region.height)
                )
            else:
                screenshot = self.pyautogui.screenshot()

            # Generate path if not provided
            if not save_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                save_path = f"screenshot_{timestamp}.png"

            # Save screenshot
            screenshot.save(save_path)
            print(f"[Desktop Bridge] Screenshot saved: {save_path}")

            return save_path

        except Exception as e:
            print(f"[Desktop Bridge] Error taking screenshot: {e}")
            return None

    def find_on_screen(
        self,
        image_path: str,
        confidence: float = 0.9
    ) -> Optional[Tuple[int, int]]:
        """
        Find image on screen and return its center coordinates.

        Args:
            image_path: Path to image to find
            confidence: Match confidence (0.0 to 1.0)

        Returns:
            (x, y) coordinates of center, or None if not found
        """
        if not self._pyautogui_available:
            print("[Desktop Bridge] PyAutoGUI not available")
            return None

        try:
            location = self.pyautogui.locateCenterOnScreen(
                image_path,
                confidence=confidence
            )
            return location
        except Exception as e:
            print(f"[Desktop Bridge] Image not found: {e}")
            return None

    # Application Control

    def launch_application(self, app_path: str, args: List[str] = None) -> bool:
        """
        Launch an application.

        Args:
            app_path: Path to executable or app name
            args: Command-line arguments

        Returns:
            True if launched successfully
        """
        try:
            command = [app_path]
            if args:
                command.extend(args)

            subprocess.Popen(command)
            print(f"[Desktop Bridge] Launched: {app_path}")
            return True

        except Exception as e:
            print(f"[Desktop Bridge] Error launching application: {e}")
            return False

    def get_screen_size(self) -> Tuple[int, int]:
        """
        Get screen resolution.

        Returns:
            (width, height) in pixels
        """
        if not self._pyautogui_available:
            return (1920, 1080)  # Default

        return self.pyautogui.size()

    # Utility Functions

    def wait(self, seconds: float):
        """Wait for specified seconds."""
        time.sleep(seconds)

    def alert(self, message: str, title: str = "Alert"):
        """
        Show alert dialog (blocking).

        Args:
            message: Alert message
            title: Alert title
        """
        if not self._pyautogui_available:
            print(f"[Alert] {title}: {message}")
            return

        self.pyautogui.alert(text=message, title=title)

    def confirm(self, message: str, title: str = "Confirm") -> bool:
        """
        Show confirmation dialog (blocking).

        Args:
            message: Confirmation message
            title: Dialog title

        Returns:
            True if user clicked OK, False if Cancel
        """
        if not self._pyautogui_available:
            print(f"[Confirm] {title}: {message}")
            return True  # Default to True

        result = self.pyautogui.confirm(text=message, title=title)
        return result == "OK"

    # Common Workflows

    def copy_to_clipboard(self):
        """Copy selected text to clipboard (Ctrl+C)."""
        self.hotkey('ctrl', 'c')
        self.wait(0.1)

    def paste_from_clipboard(self):
        """Paste from clipboard (Ctrl+V)."""
        self.hotkey('ctrl', 'v')
        self.wait(0.1)

    def select_all(self):
        """Select all (Ctrl+A)."""
        self.hotkey('ctrl', 'a')
        self.wait(0.1)

    def save(self):
        """Save current document (Ctrl+S)."""
        self.hotkey('ctrl', 's')
        self.wait(0.1)

    def switch_application(self):
        """Switch between applications (Alt+Tab)."""
        self.hotkey('alt', 'tab')
        self.wait(0.3)

    def open_task_manager(self):
        """Open Task Manager (Ctrl+Shift+Esc) on Windows."""
        if self.platform == "Windows":
            self.hotkey('ctrl', 'shift', 'esc')
        else:
            print(f"[Desktop Bridge] Task Manager not available on {self.platform}")

    def take_window_screenshot(self, window_title: str) -> Optional[str]:
        """
        Take screenshot of specific window.

        Args:
            window_title: Window title to capture

        Returns:
            Path to saved screenshot
        """
        # Focus window first
        self.manage_window(window_title, WindowAction.FOCUS)
        self.wait(0.5)

        # Find window bounds
        window = self.find_window(window_title)
        if not window:
            print(f"[Desktop Bridge] Window not found: {window_title}")
            return None

        # Take screenshot of window region
        region = ScreenRegion(
            x=window.position[0],
            y=window.position[1],
            width=window.size[0],
            height=window.size[1]
        )

        return self.take_screenshot(region=region)
