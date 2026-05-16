import { InfluxDB, Point } from '@influxdata/influxdb-client';

export interface InfluxDBConfig {
  url: string;
  token: string;
  org: string;
  bucket: string;
}

export async function writeToInfluxDB(
  config: InfluxDBConfig,
  measurement: string,
  fields: Record<string, number | string | boolean>,
  tags?: Record<string, string>,
  timestamp?: number
) {
  try {
    const influxDB = new InfluxDB({ url: config.url, token: config.token });
    const writeApi = influxDB.getWriteApi(config.org, config.bucket);

    const point = new Point(measurement);
    
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        point.tag(key, value);
      });
    }

    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, value);
      }
    });

    if (timestamp) {
      point.timestamp(timestamp);
    }

    await writeApi.writePoint(point);
    await writeApi.flush();

    return {
      success: true,
      message: `Data written to ${measurement}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'InfluxDB write failed',
    };
  }
}

export async function queryInfluxDB(
  config: InfluxDBConfig,
  query: string
) {
  try {
    const influxDB = new InfluxDB({ url: config.url, token: config.token });
    const queryApi = influxDB.getQueryApi(config.org);

    const results: any[] = [];

    return new Promise((resolve, reject) => {
      queryApi.queryRows(query, {
        next: (row: string[], tableMeta: any) => {
          const obj = tableMeta.toObject(row);
          results.push(obj);
        },
        error: (error: Error) => {
          reject({
            success: false,
            error: error.message,
          });
        },
        complete: () => {
          resolve({
            success: true,
            data: results,
            count: results.length,
            timestamp: new Date().toISOString(),
          });
        },
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'InfluxDB query failed',
    };
  }
}

export async function executeInfluxDBNode(input: any, config: any) {
  const influxConfig: InfluxDBConfig = {
    url: config?.url || process.env.INFLUXDB_URL || 'http://localhost:8086',
    token: config?.token || process.env.INFLUXDB_TOKEN || '',
    org: config?.org || process.env.INFLUXDB_ORG || '',
    bucket: config?.bucket || process.env.INFLUXDB_BUCKET || '',
  };

  if (!influxConfig.token || !influxConfig.org || !influxConfig.bucket) {
    return {
      success: false,
      error: 'InfluxDB configuration incomplete',
    };
  }

  const operation = config?.operation || 'write';

  if (operation === 'write') {
    const { measurement, fields, tags, timestamp } = config || {};
    
    if (!measurement || !fields) {
      return {
        success: false,
        error: 'Measurement and fields are required for write operation',
      };
    }

    return await writeToInfluxDB(
      influxConfig,
      measurement,
      fields,
      tags,
      timestamp
    );
  } else if (operation === 'query') {
    const { query } = config || {};
    
    if (!query) {
      return {
        success: false,
        error: 'Query is required for query operation',
      };
    }

    return await queryInfluxDB(influxConfig, query);
  }

  return {
    success: false,
    error: `Unknown operation: ${operation}`,
  };
}
