import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw error;
    }
  }
  return browser;
}

export async function generatePDF(htmlContent: string, options?: {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
}) {
  try {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    
    const pdf = await page.pdf({
      format: options?.format || 'A4',
      landscape: options?.landscape || false,
      margin: options?.margin || {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });
    
    await page.close();
    
    return {
      success: true,
      data: pdf,
      size: pdf.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'PDF generation failed',
    };
  }
}

export async function closeBrowser() {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.error('Error closing browser:', error);
    }
    browser = null;
  }
}

// Cleanup on process exit
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    void closeBrowser();
  });
}

// Node executor
export async function executePDFNode(input: any, config: any) {
  const { htmlContent, options } = config || {};
  
  if (!htmlContent && !input?.htmlContent) {
    return {
      success: false,
      error: 'HTML content is required',
    };
  }
  
  const html = htmlContent || input?.htmlContent;

  const result = await generatePDF(html, options);
  
  return {
    ...result,
    output: {
      pdfBuffer: result.data,
      size: result.size,
      timestamp: new Date().toISOString(),
    },
  };
}
