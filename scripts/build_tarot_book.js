const fs = require('fs');
const path = require('path');

// Read source card data from sibling project or existing extraction
const sourcePath = 'E:/ChangeOC/tarot/src/data/tarotCards.js';
const code = fs.readFileSync(sourcePath, 'utf8');
const clean = code.replace(/export const /g, 'const ') + '\n;return ALL_TAROT_CARDS;';
const allCards = new Function(clean)();

console.log('Loaded allCards count:', allCards.length);

const CHALLENGING_ADVICE = {
  'major-16': {
    general: 'Đừng níu kéo những bức tường đang nứt vỡ; sự sụp đổ của ảo tưởng chính là tiền đề để bạn xây dựng lại một thực tại chân thật và vững chắc hơn.',
    upright: 'Chấp nhận biến động như một sự giải phóng cần thiết. Buông bỏ kiểm soát và chuẩn bị cho một khởi đầu mới mẻ.',
    reversed: 'Đừng cố gắng chống cự hay trì hoãn việc đối diện với sự thật; đối diện càng sớm, vết thương càng nhanh lành.'
  },
  'major-13': {
    general: 'Mọi sự kết thúc đều mang theo hạt mầm của sự tái sinh. Hãy can đảm khép lại chu kỳ cũ để đón nhận những cơ hội mới.',
    upright: 'Sẵn sàng từ bỏ những thói quen, mối quan hệ hoặc suy nghĩ đã lỗi thời để bản thân được lột xác.',
    reversed: 'Nhận diện nỗi sợ thay đổi bên trong bạn; sự bám víu chỉ làm kéo dài cảm giác bế tắc không đáng có.'
  },
  'major-15': {
    general: 'Xiềng xích lớn nhất chính là những ảo tưởng và sự lệ thuộc trong tâm trí. Tự do bắt đầu ngay khi bạn nhận diện được chúng.',
    upright: 'Xem xét lại những thói quen độc hại hoặc sự phụ thuộc cảm xúc; chủ động lấy lại quyền kiểm soát cuộc đời bạn.',
    reversed: 'Bạn đang trên đà thức tỉnh và phá vỡ xiềng xích; hãy kiên định với ranh giới cá nhân lành mạnh.'
  },
  'major-12': {
    general: 'Đừng cố dùng sức đẩy một cánh cửa đang đóng. Hãy tạm dừng lại, đổi góc nhìn 180 độ để thấy điều kỳ diệu.',
    upright: 'Chấp nhận khoảng lặng hiện tại; quan sát từ một lăng kính mới để tìm ra giải pháp sáng suốt.',
    reversed: 'Tránh hy sinh mù quáng hoặc tự biến mình thành nạn nhân; hãy hành động thực tế để tháo gỡ khó khăn.'
  },
  'swords-3': {
    general: 'Nỗi đau là lời nhắc nhở rằng trái tim bạn đã yêu thương chân thành. Hãy để nước mắt chữa lành và thanh lọc tâm hồn.',
    upright: 'Thành thật với cảm xúc đau buồn, chia sẻ cùng người tin cậy và không gặm nhấm vết thương trong cô độc.',
    reversed: 'Quá trình hồi phục đang diễn ra; hãy tha thứ cho quá khứ và cho phép bản thân được đón nhận niềm vui mới.'
  },
  'swords-9': {
    general: 'Phần lớn những điều bạn lo sợ vào lúc nửa đêm sẽ không bao giờ xảy ra. Hãy bước ra ánh sáng và hành động thực tế.',
    upright: 'Đừng để tâm trí bi kịch hóa vấn đề; hãy hít thở sâu, chia sẻ nỗi lòng và tập trung vào những gì làm được ngay.',
    reversed: 'Bạn đang dần vượt qua cơn ác mộng; hãy tiếp tục duy trì lối sống lành mạnh và suy nghĩ tích cực.'
  },
  'swords-10': {
    general: 'Điểm chạm đáy của chu kỳ cũ đã đến; từ đây trở đi, mọi bước chân đều sẽ đưa bạn đi lên ánh bình minh.',
    upright: 'Chấp nhận buông bỏ hoàn toàn dĩ vãng; không thể rơi sâu hơn được nữa, tương lai đang rộng mở trước mắt.',
    reversed: 'Vết thương cũ đang dần khép miệng; đừng ngoảnh đầu nhìn lại đống tro tàn, hãy tiến bước về phía trước.'
  },
  'cups-5': {
    general: 'Đừng mãi cúi đầu thương khóc những chiếc chén đã đổ; hãy quay lại nhìn hai chiếc chén tình cảm vẫn còn nguyên vẹn.',
    upright: 'Chấp nhận sự mất mát, nhưng đừng quên trân trọng những điều tốt đẹp và tình yêu thương vẫn còn bên cạnh bạn.',
    reversed: 'Mở lòng đón nhận sự an ủi và cơ hội mới; chiếc cầu dẫn sang miền hy vọng đang chờ bạn bước qua.'
  }
};

const processedCards = allCards.map(c => {
  let cardAdvice = CHALLENGING_ADVICE[c.id];
  if (!cardAdvice) {
    const kw1 = c.keywords && c.keywords[0] ? c.keywords[0] : 'trực giác';
    const kw2 = c.keywords && c.keywords[1] ? c.keywords[1] : 'hành động';
    cardAdvice = {
      general: `Hãy dựa trên ${kw1.toLowerCase()} và ${kw2.toLowerCase()} làm kim chỉ nam để đưa ra quyết định vững vàng.`,
      upright: `Phát huy tối đa năng lượng tích cực của ${c.nameVi}: tin tưởng vào bản thân và chủ động hiện thực hóa mục tiêu.`,
      reversed: `Lắng nghe tiếng nói nội tâm, tháo gỡ điểm nghẽn của ${c.nameVi} và kiên nhẫn điều chỉnh từng bước nhỏ.`
    };
  }

  // Ensure image path is local relative to index.html
  let imgPath = c.image;
  if (imgPath.startsWith('/')) imgPath = imgPath.substring(1);
  if (!imgPath.startsWith('assets/')) imgPath = 'assets/' + imgPath;

  return {
    id: c.id,
    nameEn: c.nameEn,
    nameVi: c.nameVi,
    arcana: c.arcana,
    suit: c.suit,
    number: c.number,
    image: imgPath,
    element: c.element,
    astrology: c.astrology,
    keywords: c.keywords,
    upright: c.upright,
    reversed: c.reversed,
    love: {
      upright: c.topicMeanings.love.upright,
      reversed: c.topicMeanings.love.reversed
    },
    work: {
      upright: c.topicMeanings.career.upright,
      reversed: c.topicMeanings.career.reversed
    },
    finance: {
      upright: c.topicMeanings.finance.upright,
      reversed: c.topicMeanings.finance.reversed
    },
    study: {
      upright: c.topicMeanings.study.upright,
      reversed: c.topicMeanings.study.reversed
    },
    advice: cardAdvice,
    iconSymbol: c.iconSymbol
  };
});

const ROOT_DIR = path.join(__dirname, '..');
const outputPath = path.join(ROOT_DIR, 'data', 'tarot_book.json');
fs.writeFileSync(outputPath, JSON.stringify(processedCards, null, 2), 'utf8');
console.log('Saved tarot_book.json successfully to:', outputPath);
console.log('Total cards processed:', processedCards.length);

// Also generate tarot_book.js to allow script tag inclusion without CORS restrictions if opened as file://
const jsContent = `// Tự động sinh từ "Tarot Chú Giải" - Trọn bộ 78 lá bài
window.TAROT_BOOK_DATA = ${JSON.stringify(processedCards, null, 2)};
`;
fs.writeFileSync(path.join(ROOT_DIR, 'src', 'tarot_book.js'), jsContent, 'utf8');
console.log('Saved tarot_book.js successfully for seamless offline/file:// usage.');

