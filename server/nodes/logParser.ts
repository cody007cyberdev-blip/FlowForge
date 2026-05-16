export interface LogParserConfig {
  pattern: string; // Regex pattern for parsing
  format?: 'json' | 'regex' | 'csv' | 'space-delimited';
  fields?: string[]; // Field names for parsed data
  timestampField?: string;
  levelField?: string;
}

export function parseLogLine(line: string, config: LogParserConfig) {
  try {
    if (config.format === 'json') {
      return JSON.parse(line);
    }

    if (config.format === 'csv') {
      const values = line.split(',').map(v => v.trim());
      const result: Record<string, any> = {};
      
      if (config.fields) {
        config.fields.forEach((field, index) => {
          result[field] = values[index];
        });
      }
      
      return result;
    }

    if (config.format === 'space-delimited') {
      const values = line.split(/\s+/);
      const result: Record<string, any> = {};
      
      if (config.fields) {
        config.fields.forEach((field, index) => {
          result[field] = values[index];
        });
      }
      
      return result;
    }

    // Default: regex pattern
    const regex = new RegExp(config.pattern);
    const match = line.match(regex);

    if (!match) {
      return null;
    }

    const result: Record<string, any> = {
      raw: line,
    };

    if (config.fields) {
      config.fields.forEach((field, index) => {
        result[field] = match[index + 1];
      });
    } else {
      match.slice(1).forEach((value, index) => {
        result[`group_${index + 1}`] = value;
      });
    }

    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Parse error',
      raw: line,
    };
  }
}

export function parseLogs(logs: string[], config: LogParserConfig) {
  return logs
    .map(line => parseLogLine(line, config))
    .filter(parsed => parsed !== null);
}

export function aggregateLogs(
  logs: any[],
  groupBy?: string,
  aggregateField?: string,
  aggregateOp?: 'count' | 'sum' | 'avg' | 'min' | 'max'
) {
  if (!groupBy) {
    return {
      total: logs.length,
      data: logs,
    };
  }

  const grouped: Record<string, any[]> = {};

  logs.forEach(log => {
    const key = log[groupBy];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(log);
  });

  const aggregated: Record<string, any> = {};

  Object.entries(grouped).forEach(([key, group]) => {
    if (aggregateField && aggregateOp) {
      const values = group
        .map(item => item[aggregateField])
        .filter(v => typeof v === 'number');

      switch (aggregateOp) {
        case 'count':
          aggregated[key] = group.length;
          break;
        case 'sum':
          aggregated[key] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated[key] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'min':
          aggregated[key] = values.length > 0 ? Math.min(...values) : 0;
          break;
        case 'max':
          aggregated[key] = values.length > 0 ? Math.max(...values) : 0;
          break;
      }
    } else {
      aggregated[key] = group.length;
    }
  });

  return {
    total: logs.length,
    grouped: Object.keys(grouped).length,
    data: aggregated,
  };
}

export async function executeLogParserNode(input: any, config: any) {
  const parserConfig: LogParserConfig = {
    pattern: config?.pattern || '(.+)',
    format: config?.format || 'regex',
    fields: config?.fields || [],
    timestampField: config?.timestampField,
    levelField: config?.levelField,
  };

  const logs = Array.isArray(input) ? input : [input];
  const stringLogs = logs.map(log => typeof log === 'string' ? log : JSON.stringify(log));

  const parsed = parseLogs(stringLogs, parserConfig);

  if (config?.aggregate) {
    const aggregated = aggregateLogs(
      parsed,
      config.groupBy,
      config.aggregateField,
      config.aggregateOp
    );

    return {
      success: true,
      data: aggregated,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: parsed,
    count: parsed.length,
    timestamp: new Date().toISOString(),
  };
}

// Level detection helper
export function detectLogLevel(line: string): 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' {
  const upperLine = line.toUpperCase();
  
  if (upperLine.includes('ERROR') || upperLine.includes('FATAL')) {
    return 'ERROR';
  }
  if (upperLine.includes('WARN')) {
    return 'WARN';
  }
  if (upperLine.includes('DEBUG')) {
    return 'DEBUG';
  }
  
  return 'INFO';
}

// Common log patterns
export const LOG_PATTERNS = {
  APACHE: '(?<timestamp>\\d{2}/\\w{3}/\\d{4}:\\d{2}:\\d{2}:\\d{2} [+-]\\d{4}) "(?<method>\\w+) (?<path>[^ ]+) (?<protocol>[^"]+)" (?<status>\\d{3}) (?<size>\\d+)',
  NGINX: '(?<ip>[\\d.]+) - (?<user>[^ ]+) \\[(?<timestamp>[^\\]]+)\\] "(?<method>\\w+) (?<path>[^ ]+) (?<protocol>[^"]+)" (?<status>\\d{3}) (?<size>\\d+)',
  SYSLOG: '(?<timestamp>\\w+ +\\d+ \\d{2}:\\d{2}:\\d{2}) (?<host>[^ ]+) (?<process>[^\\[]+)\\[(?<pid>\\d+)\\]: (?<message>.*)',
  JSON_LOG: '\\{.*\\}',
};
