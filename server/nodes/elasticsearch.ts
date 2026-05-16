import { Client } from '@elastic/elasticsearch';

export interface ElasticsearchConfig {
  node: string;
  username?: string;
  password?: string;
  apiKey?: string;
}

export async function searchElasticsearch(
  config: ElasticsearchConfig,
  index: string,
  query: any
) {
  try {
    const clientConfig: any = {
      node: config.node || 'http://localhost:9200',
    };

    if (config.username && config.password) {
      clientConfig.auth = {
        username: config.username,
        password: config.password,
      };
    } else if (config.apiKey) {
      clientConfig.auth = {
        apiKey: config.apiKey,
      };
    }

    const client = new Client(clientConfig);

    const response = await client.search({
      index,
      body: query,
    });

    const hits = response.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      source: hit._source,
    }));

    return {
      success: true,
      data: hits,
      total: response.hits.total,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Elasticsearch search failed',
    };
  }
}

export async function indexDocumentElasticsearch(
  config: ElasticsearchConfig,
  index: string,
  document: any,
  id?: string
) {
  try {
    const clientConfig: any = {
      node: config.node || 'http://localhost:9200',
    };

    if (config.username && config.password) {
      clientConfig.auth = {
        username: config.username,
        password: config.password,
      };
    } else if (config.apiKey) {
      clientConfig.auth = {
        apiKey: config.apiKey,
      };
    }

    const client = new Client(clientConfig);

    const response = await client.index({
      index,
      id,
      body: document,
    });

    return {
      success: true,
      id: response._id,
      version: response._version,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Elasticsearch index failed',
    };
  }
}

export async function executeElasticsearchNode(input: any, config: any) {
  const esConfig: ElasticsearchConfig = {
    node: config?.node || process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    username: config?.username || process.env.ELASTICSEARCH_USER,
    password: config?.password || process.env.ELASTICSEARCH_PASSWORD,
    apiKey: config?.apiKey || process.env.ELASTICSEARCH_API_KEY,
  };

  const operation = config?.operation || 'search';
  const index = config?.index || 'logs';

  if (operation === 'search') {
    const query = config?.query || {
      match_all: {},
    };

    return await searchElasticsearch(esConfig, index, query);
  } else if (operation === 'index') {
    const document = config?.document || input;
    const id = config?.id;

    if (!document) {
      return {
        success: false,
        error: 'Document is required for index operation',
      };
    }

    return await indexDocumentElasticsearch(esConfig, index, document, id);
  }

  return {
    success: false,
    error: `Unknown operation: ${operation}`,
  };
}
