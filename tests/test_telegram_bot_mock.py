import unittest
from unittest.mock import MagicMock, patch, AsyncMock
import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

# Mock the telegram module before importing the bot
sys.modules['telegram'] = MagicMock()
sys.modules['telegram.ext'] = MagicMock()

from notifications.telegram_bot import TelegramNotifier

class TestTelegramBot(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.token = "test_token"
        self.chat_id = "123456789"
        
        # Patch the Bot class and Application builder
        self.bot_patcher = patch('notifications.telegram_bot.Bot')
        self.app_patcher = patch('notifications.telegram_bot.Application.builder')
        
        self.mock_bot_class = self.bot_patcher.start()
        self.mock_app_builder = self.app_patcher.start()
        
        # Setup mock app
        self.mock_app = MagicMock()
        self.mock_app_builder.return_value.token.return_value.build.return_value = self.mock_app

    async def asyncTearDown(self):
        self.bot_patcher.stop()
        self.app_patcher.stop()

    async def test_initialization(self):
        """Test that the bot initializes with token and chat_id."""
        notifier = TelegramNotifier(token=self.token, chat_id=self.chat_id)
        
        self.assertEqual(notifier.token, self.token)
        self.assertEqual(notifier.chat_id, self.chat_id)
        self.mock_bot_class.assert_called_with(self.token)
        # Verify handlers were added
        self.assertTrue(self.mock_app.add_handler.called)

    async def test_initialization_no_token(self):
        """Test initialization fails gracefully without token."""
        # Ensure env vars are empty
        with patch.dict(os.environ, {}, clear=True):
            notifier = TelegramNotifier(token=None, chat_id=None)
            self.assertIsNone(notifier.bot)
            self.assertIsNone(notifier.app)

    @patch('notifications.telegram_bot.logger')
    async def test_send_approval_request(self, mock_logger):
        """Test sending approval request."""
        notifier = TelegramNotifier(token=self.token, chat_id=self.chat_id)
        notifier.bot.send_message = AsyncMock()

        await notifier.send_approval_request(
            task_id="task123",
            title="Deploy Production",
            description="Deploying version 1.0",
            priority="high"
        )

        notifier.bot.send_message.assert_called_once()
        args, kwargs = notifier.bot.send_message.call_args
        self.assertEqual(kwargs['chat_id'], self.chat_id)
        self.assertIn("Deploy Production", kwargs['text'])
        self.assertIn("Approval Required", kwargs['text'])

    @patch('notifications.telegram_bot.logger')
    async def test_send_digest(self, mock_logger):
        """Test sending digest."""
        notifier = TelegramNotifier(token=self.token, chat_id=self.chat_id)
        notifier.bot.send_message = AsyncMock()

        summary = "Total tasks: 5"
        await notifier.send_digest(summary)

        notifier.bot.send_message.assert_called_once()
        args, kwargs = notifier.bot.send_message.call_args
        self.assertEqual(kwargs['chat_id'], self.chat_id)
        self.assertIn("Daily Digest", kwargs['text'])
        self.assertIn(summary, kwargs['text'])

if __name__ == '__main__':
    # Run the tests
    # Note: verify_async logic needed for async tests if using standard unittest, 
    # but for simplicity we mocked the async calls or use IsolatedAsyncioTestCase if available
    # Since we are mocking the async calls on the bot object, standard test might pass if we don't await the method in test.
    # Actually, send_approval_request is async. We need to run it in a loop.
    pass
