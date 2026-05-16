/**
 * Telegram Bot Node Executor
 * Sends messages to Telegram channels/users
 */

import axios from "axios";

export interface TelegramBotConfig {
  botToken: string;
  chatId: string;
  message: string;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  disableNotification?: boolean;
}

/**
 * Send message to Telegram
 */
export async function sendTelegramMessage(config: TelegramBotConfig) {
  try {
    const { botToken, chatId, message, parseMode = "Markdown", disableNotification = false } = config;

    if (!botToken || !chatId || !message) {
      throw new Error("Bot token, chat ID, and message are required");
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await axios.post(
      apiUrl,
      {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_notification: disableNotification,
      },
      { timeout: 10000 }
    );

    if (response.data.ok) {
      return {
        success: true,
        messageId: response.data.result.message_id,
        chatId,
        message: "Message sent successfully",
      };
    } else {
      throw new Error(response.data.description || "Failed to send message");
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Send document to Telegram
 */
export async function sendTelegramDocument(config: TelegramBotConfig & { fileUrl: string; caption?: string }) {
  try {
    const { botToken, chatId, fileUrl, caption, disableNotification = false } = config;

    if (!botToken || !chatId || !fileUrl) {
      throw new Error("Bot token, chat ID, and file URL are required");
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;

    const response = await axios.post(
      apiUrl,
      {
        chat_id: chatId,
        document: fileUrl,
        caption,
        disable_notification: disableNotification,
      },
      { timeout: 10000 }
    );

    if (response.data.ok) {
      return {
        success: true,
        messageId: response.data.result.message_id,
        chatId,
        message: "Document sent successfully",
      };
    } else {
      throw new Error(response.data.description || "Failed to send document");
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Send inline keyboard to Telegram
 */
export async function sendTelegramKeyboard(
  config: TelegramBotConfig & { buttons: Array<{ text: string; callbackData: string }[]> }
) {
  try {
    const { botToken, chatId, message, buttons, disableNotification = false } = config;

    if (!botToken || !chatId || !message || !buttons) {
      throw new Error("Bot token, chat ID, message, and buttons are required");
    }

    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await axios.post(
      apiUrl,
      {
        chat_id: chatId,
        text: message,
        reply_markup: {
          inline_keyboard: buttons,
        },
        disable_notification: disableNotification,
      },
      { timeout: 10000 }
    );

    if (response.data.ok) {
      return {
        success: true,
        messageId: response.data.result.message_id,
        chatId,
        message: "Message with keyboard sent successfully",
      };
    } else {
      throw new Error(response.data.description || "Failed to send message");
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Execute Telegram Bot node
 */
export async function executeTelegramBotNode(input: any, config: any) {
  try {
    const { operation = "message", botToken, chatId, message, parseMode, disableNotification, fileUrl, caption, buttons } = config;

    if (operation === "message") {
      return await sendTelegramMessage({
        botToken,
        chatId,
        message,
        parseMode,
        disableNotification,
      });
    } else if (operation === "document") {
      return await sendTelegramDocument({
        botToken,
        chatId,
        message,
        fileUrl,
        caption,
        disableNotification,
      });
    } else if (operation === "keyboard") {
      return await sendTelegramKeyboard({
        botToken,
        chatId,
        message,
        buttons,
        disableNotification,
      });
    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const telegramBotExecutor = {
  execute: executeTelegramBotNode,
};
