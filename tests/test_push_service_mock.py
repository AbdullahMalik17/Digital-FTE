import unittest
from unittest.mock import MagicMock, patch, AsyncMock
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

# Mock telegram module before importing push_service
sys.modules['telegram'] = MagicMock()
sys.modules['telegram.ext'] = MagicMock()

# Mock firebase_admin (push_service imports it inside methods but better safe)
sys.modules['firebase_admin'] = MagicMock()
sys.modules['firebase_admin.messaging'] = MagicMock()

from notifications.push_service import PushNotificationService, NotificationPayload
from notifications.telegram_bot import TelegramNotifier

class TestPushServiceIntegration(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.telegram_patcher = patch('notifications.push_service.TelegramNotifier')
        self.mock_telegram_class = self.telegram_patcher.start()
        
        self.mock_telegram_instance = MagicMock()
        self.mock_telegram_instance.token = "test_token" # Make it valid
        self.mock_telegram_instance.send_approval_request = AsyncMock()
        self.mock_telegram_instance.send_digest = AsyncMock()
        
        self.mock_telegram_class.return_value = self.mock_telegram_instance

    async def asyncTearDown(self):
        self.telegram_patcher.stop()

    async def test_initialization_with_telegram(self):
        """Test PushService initializes TelegramNotifier."""
        service = PushNotificationService(config_dir="/tmp/test_push")
        self.assertIsNotNone(service.telegram)
        self.assertEqual(service.telegram, self.mock_telegram_instance)

    async def test_send_approval_calls_telegram(self):
        """Test send_approval_request calls telegram."""
        service = PushNotificationService(config_dir="/tmp/test_push")
        
        await service.send_approval_request(
            task_id="t1",
            task_title="Test Task",
            task_description="Desc",
            risk_score=0.8
        )
        
        service.telegram.send_approval_request.assert_called_once()
        args, kwargs = service.telegram.send_approval_request.call_args
        self.assertEqual(kwargs['task_id'], "t1")
        self.assertEqual(kwargs['priority'], "urgent") # 0.8 risk -> urgent

    async def test_send_digest_calls_telegram(self):
        """Test send_daily_digest calls telegram."""
        service = PushNotificationService(config_dir="/tmp/test_push")
        
        await service.send_daily_digest(
            summary="Summary",
            task_count=5,
            urgent_count=2,
            suggestions=[]
        )
        
        service.telegram.send_digest.assert_called_once_with("Summary")

if __name__ == '__main__':
    unittest.main()
