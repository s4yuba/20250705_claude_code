const puppeteer = require('puppeteer');
const path = require('path');

async function convertHtmlToPdf(htmlFile, outputPdf) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 16:9のアスペクト比で設定（1920x1080）
    const width = 1920;
    const height = 1080;
    
    // ビューポートを設定
    await page.setViewport({ 
      width, 
      height,
      deviceScaleFactor: 1
    });
    
    // HTMLファイルを読み込む
    const filePath = path.resolve(htmlFile);
    const htmlDir = path.dirname(filePath);
    console.log(`Loading HTML from: ${filePath}`);
    console.log(`HTML directory: ${htmlDir}`);
    
    await page.goto(`file://${filePath}`, {
      waitUntil: ['networkidle0', 'domcontentloaded', 'load'],
      timeout: 60000
    });
    
    // 画像の読み込みを待つ
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', () => {
              console.error(`Failed to load image: ${img.src}`);
              resolve(); // エラーでも続行
            });
          });
        })
      );
    });
    
    // 全スライドの数を取得
    const slideCount = await page.evaluate(() => {
      return document.querySelectorAll('.slide').length;
    });
    console.log(`Found ${slideCount} slides`);

    // PDFを生成する前に、全スライドを表示する処理
    await page.evaluate(() => {
      // スタイルを追加してページブレークを設定
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          .presentation {
            height: auto !important;
            display: block !important;
            overflow: visible !important;
          }
          
          body {
            overflow: visible !important;
            height: auto !important;
          }
          
          .slide {
            display: flex !important;
            position: relative !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            width: 1920px !important;
            height: 1080px !important;
            max-width: 1920px !important;
            max-height: 1080px !important;
            min-width: 1920px !important;
            min-height: 1080px !important;
            box-shadow: none !important;
          }
          
          .slide:last-child {
            page-break-after: auto !important;
          }
          
          /* タイトルのスタイルを維持 */
          .slide h2 {
            margin-bottom: 2rem !important;
          }
          
          /* スライドカウンターを非表示 */
          .slide-counter {
            display: none !important;
          }
          
          /* 各スライドのページ番号 */
          .slide-page-number {
            position: absolute;
            bottom: 30px;
            right: 30px;
            background-color: rgba(212, 163, 127, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 1rem;
            z-index: 1000;
          }
        }
      `;
      document.head.appendChild(style);
      
      // グローバルのスライドカウンターを非表示に
      const globalCounter = document.querySelector('.slide-counter');
      if (globalCounter) {
        globalCounter.style.display = 'none';
      }
      
      // すべてのスライドを表示し、各スライドにページ番号を追加
      const slides = document.querySelectorAll('.slide');
      const totalSlides = slides.length;
      
      slides.forEach((slide, index) => {
        slide.classList.add('active');
        slide.style.display = 'flex';
        slide.style.position = 'relative';
        slide.style.width = '1920px';
        slide.style.height = '1080px';
        slide.style.maxWidth = '1920px';
        slide.style.maxHeight = '1080px';
        slide.style.minWidth = '1920px';
        slide.style.minHeight = '1080px';
        slide.style.pageBreakAfter = 'always';
        slide.style.margin = '0';
        slide.style.boxSizing = 'border-box';
        slide.style.boxShadow = 'none';
        
        // 各スライドにページ番号を追加
        const pageNumber = document.createElement('div');
        pageNumber.className = 'slide-page-number';
        pageNumber.textContent = `${index + 1} / ${totalSlides}`;
        slide.appendChild(pageNumber);
      });
      
      // プレゼンテーションコンテナのスタイルを調整
      const presentation = document.querySelector('.presentation');
      if (presentation) {
        presentation.style.height = 'auto';
        presentation.style.display = 'block';
        presentation.style.overflow = 'visible';
      }
      
      // bodyのスタイルを調整
      document.body.style.overflow = 'visible';
      document.body.style.height = 'auto';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    });

    // レンダリングが完了するまで待機
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 画像の再確認
    const imageSources = await page.evaluate(() => {
      return Array.from(document.images).map(img => ({
        src: img.src,
        loaded: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    });
    console.log('Image status:', imageSources);
    
    // printメディアタイプを設定
    await page.emulateMediaType('print');
    
    // PDFとして保存
    await page.pdf({
      path: outputPdf,
      width: '1920px',
      height: '1080px',
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      scale: 1
    });
    
    console.log(`PDF created successfully: ${outputPdf}`);
    console.log('PDF specifications:');
    console.log('- Aspect ratio: 16:9');
    console.log('- Resolution: 1920x1080');
    console.log(`- Total pages: ${slideCount}`);
    console.log('- Layout: Browser display preserved');
    
  } catch (error) {
    console.error('Error creating PDF:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// コマンドライン引数の処理
const args = process.argv.slice(2);

// 引数が指定されていない場合はデフォルトのパスを使用
if (args.length === 0) {
  const inputHtml = path.join(__dirname, '..', 'artifacts', 'slides.html');
  const outputPdf = path.join(__dirname, '..', 'artifacts', 'slides-output.pdf');
  convertHtmlToPdf(inputHtml, outputPdf);
} else if (args.length < 2) {
  console.log('Usage: node html-to-pdf.js [<input.html> <output.pdf>]');
  console.log('If no arguments provided, uses default paths.');
  process.exit(1);
} else {
  const [inputHtml, outputPdf] = args;
  convertHtmlToPdf(inputHtml, outputPdf);
}