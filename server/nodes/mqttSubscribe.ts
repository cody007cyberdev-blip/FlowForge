/**
 * MQTT Subscribe Node Executor
 * Subscribes to MQTT topics for IoT device monitoring
 */

export interface MQTTSubscribeConfig {
  brokerUrl: string;
  topic: string;
  qos?: 0 | 1 | 2;
  timeout?: number;
  username?: string;
  password?: string;
}

/**
 * Parse MQTT broker URL
 */
function parseMQTTUrl(url: string): { protocol: string; host: string; port: number } {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.replace(":", "");
    const host = urlObj.hostname;
    const port = parseInt(urlObj.port) || (protocol === "mqtts" ? 8883 : 1883);

    return { protocol, host, port };
  } catch (error) {
    throw new Error(`Invalid MQTT URL: ${url}`);
  }
}

/**
 * Subscribe to MQTT topic (simulated - requires mqtt library in production)
 * This is a placeholder that returns mock data
 */
export async function subscribeMQTT(config: MQTTSubscribeConfig) {
  try {
    const { brokerUrl, topic, qos = 1, timeout = 5000, username, password } = config;

    if (!brokerUrl || !topic) {
      throw new Error("Broker URL and topic are required");
    }

    const parsed = parseMQTTUrl(brokerUrl);

    // In production, use mqtt library:
    // const mqtt = require('mqtt');
    // const client = mqtt.connect(brokerUrl, { username, password });
    // const messages = [];
    // await new Promise((resolve) => {
    //   client.subscribe(topic, { qos }, (err) => {
    //     if (err) throw err;
    //     client.on('message', (topic, message) => {
    //       messages.push({ topic, payload: message.toString() });
    //     });
    //     setTimeout(() => {
    //       client.end();
    //       resolve(messages);
    //     }, timeout);
    //   });
    // });

    // For now, return simulated data
    return {
      success: true,
      broker: parsed,
      topic,
      qos,
      messages: [
        {
          topic,
          payload: '{"temperature": 22.5, "humidity": 65}',
          timestamp: new Date().toISOString(),
        },
      ],
      messageCount: 1,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Parse MQTT payload
 */
export function parseMQTTPayload(payload: string, format: "json" | "text" | "hex" = "json") {
  try {
    if (format === "json") {
      return JSON.parse(payload);
    } else if (format === "hex") {
      return Buffer.from(payload, "hex").toString("utf-8");
    } else {
      return payload;
    }
  } catch (error) {
    return {
      raw: payload,
      error: String(error),
    };
  }
}

/**
 * Filter MQTT messages by criteria
 */
export function filterMQTTMessages(
  messages: any[],
  filter: {
    topicPattern?: string;
    valueMin?: number;
    valueMax?: number;
    field?: string;
  }
) {
  return messages.filter((msg) => {
    // Topic pattern matching
    if (filter.topicPattern) {
      const regex = new RegExp(filter.topicPattern);
      if (!regex.test(msg.topic)) {
        return false;
      }
    }

    // Value range filtering
    if (filter.field && (filter.valueMin !== undefined || filter.valueMax !== undefined)) {
      try {
        const payload = typeof msg.payload === "string" ? JSON.parse(msg.payload) : msg.payload;
        const value = payload[filter.field];

        if (filter.valueMin !== undefined && value < filter.valueMin) {
          return false;
        }
        if (filter.valueMax !== undefined && value > filter.valueMax) {
          return false;
        }
      } catch {
        return false;
      }
    }

    return true;
  });
}

/**
 * Execute MQTT Subscribe node
 */
export async function executeMQTTSubscribeNode(input: any, config: any) {
  try {
    const { brokerUrl, topic, qos = 1, timeout = 5000, username, password, payloadFormat = "json", filter } = config;

    const result = await subscribeMQTT({
      brokerUrl,
      topic,
      qos,
      timeout,
      username,
      password,
    });

    if (!result.success) {
      return result;
    }

    // Parse payloads
    const messages = (result.messages || []).map((msg: any) => ({
      ...msg,
      parsedPayload: parseMQTTPayload(msg.payload, payloadFormat),
    }));

    // Apply filters if provided
    let filteredMessages = messages;
    if (filter) {
      filteredMessages = filterMQTTMessages(messages, filter);
    }

    return {
      success: true,
      broker: result.broker,
      topic,
      messages: filteredMessages,
      messageCount: filteredMessages.length,
      totalReceived: messages.length,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

export const mqttSubscribeExecutor = {
  execute: executeMQTTSubscribeNode,
};
