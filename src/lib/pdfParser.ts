import * as pdfjsLib from 'pdfjs-dist';

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.min.js');
} else {
  // Fallback for development outside extension context if needed, though unlikely here
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export async function parsePDF(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedarray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: any) => item.str);
          fullText += strings.join(' ') + ' ';
        }
        
        resolve(fullText.trim());
      } catch (err) {
        console.error('PDF Parse Error:', err);
        reject(new Error('PDF_PARSE_FAILED'));
      }
    };
    reader.onerror = () => reject(new Error('PDF_PARSE_FAILED'));
    reader.readAsArrayBuffer(file);
  });
}