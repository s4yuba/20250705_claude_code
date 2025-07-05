const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

async function convertHtmlToPdf(htmlFile, outputPdf) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 16:9のアスペクト比で設定
    const width = 1920;
    const height = 1080;
    
    await page.setViewport({ width, height });
    
    // HTMLファイルを読み込む
    const filePath = path.resolve(htmlFile);
    await page.goto(`file://${filePath}`, {
      waitUntil: 'networkidle0'
    });
    
    // スライドの総数を取得
    const totalSlides = await page.evaluate(() => {
      return document.querySelectorAll('.slide').length;
    });
    
    console.log(`Total slides to process: ${totalSlides}`);
    
    // 各スライドのスクリーンショットを撮る
    const screenshots = [];
    for (let i = 0; i < totalSlides; i++) {
      // スライドをナビゲート
      await page.evaluate((slideIndex) => {
        window.currentSlide = slideIndex;
        window.showSlide(slideIndex);
      }, i);
      
      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // スクリーンショットを撮る
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: width,
          height: height
        }
      });
      
      screenshots.push(screenshot);
      console.log(`Captured slide ${i + 1}/${totalSlides}`);
    }
    
    // PDFMergerを使って結合する代わりに、puppeteerの機能を使う
    // 一時的なHTMLファイルを作成
    const tempHtml = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; }
  .pdf-page { 
    width: 1920px; 
    height: 1080px; 
    page-break-after: always;
    position: relative;
  }
  .pdf-page img { 
    width: 100%; 
    height: 100%; 
    object-fit: contain;
  }
  @page {
    size: 1920px 1080px;
    margin: 0;
  }
</style>
</head>
<body>
${screenshots.map((screenshot, index) => 
  `<div class="pdf-page"><img src="data:image/png;base64,${screenshot.toString('base64')}" /></div>`
).join('\n')}
</body>
</html>`;
    
    // 一時ファイルに書き込む
    const tempPath = path.join(path.dirname(outputPdf), 'temp_slides.html');
    await fs.writeFile(tempPath, tempHtml);
    
    // 新しいページで開く
    const pdfPage = await browser.newPage();
    await pdfPage.goto(`file://${path.resolve(tempPath)}`, {
      waitUntil: 'networkidle0'
    });
    
    // PDFとして保存
    await pdfPage.pdf({
      path: outputPdf,
      width: '1920px',
      height: '1080px',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    // 一時ファイルを削除
    await fs.unlink(tempPath);
    
    console.log(`PDF created successfully: ${outputPdf}`);
    console.log(`Total pages: ${totalSlides}`);
    console.log('PDF specifications:');
    console.log('- Aspect ratio: 16:9');
    console.log('- Resolution: 1920x1080 per page');
    console.log('- All slides included');
    
  } catch (error) {
    console.error('Error creating PDF:', error);
  } finally {
    await browser.close();
  }
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node html-to-pdf.js <input.html> <output.pdf>');
  process.exit(1);
}

const [inputHtml, outputPdf] = args;
convertHtmlToPdf(inputHtml, outputPdf);