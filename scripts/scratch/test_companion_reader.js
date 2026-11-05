const fs = require('fs');
const bookData = JSON.parse(fs.readFileSync('./tarot_book.json', 'utf8'));

function generateCompanionInterpretation(question, cards) {
    const raw = (question || "").trim() || "Điều gì đang chờ đợi mình phía trước?";
    const q = raw.toLowerCase();
    const qClean = q.replace(/[?!.,;]/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Phân loại câu hỏi: Nhị phân (Binary) hay Mở (Open-ended)
    const hasQuestionEnd = /\b(không|ko|k|hông|được không|chưa|chăng|hay không)(\s+(ạ|nhỉ|vậy|ta))?$/i.test(qClean);
    const hasBinaryKeyword = /\b(có nên|nên hay không|đậu hay rớt|đỗ hay trượt|đi hay ở|ở hay đi|nghỉ hay ở|bỏ hay giữ|phải không|đúng không|ổn không|được không)\b/i.test(qClean);
    const hasBinaryStart = /^(có|liệu|mình có|em có|anh có|nên|mình nên|em nên|liệu có|liệu mình có)\b/i.test(qClean);
    const hasChoice = /\b(hay|hoặc)\b/.test(qClean) && /\b(nên|chọn)\b/.test(qClean);

    const isBinary = hasBinaryKeyword || hasChoice || (hasBinaryStart && /\b(không|ko|k|được|đỗ|đậu|chưa|thành công)\b/i.test(qClean)) || hasQuestionEnd;

    // Nhận diện chủ đề cụ thể
    let theme = "general";
    if (/\b(yêu|tình cảm|tình yêu|crush|người yêu|người ấy|hẹn hò|chia tay|quay lại|kết hôn|chồng|vợ|lạnh nhạt|ngoại tình)\b/i.test(qClean)) {
        theme = "love";
    } else if (/\b(việc|công ty|sếp|nghề|đồng nghiệp|lương|nghỉ việc|đổi việc|thôi việc|dự án|kinh doanh|toxic)\b/i.test(qClean)) {
        theme = "work";
    } else if (/\b(thi|học|kỳ thi|điểm|đậu|rớt|đỗ|trượt|tốt nghiệp|bằng cấp|du học)\b/i.test(qClean)) {
        theme = "exam";
    } else if (/\b(tiền|tài chính|đầu tư|lỗ|lời|nợ|chứng khoán|đất|mua nhà|mua xe)\b/i.test(qClean)) {
        theme = "finance";
    }

    // Nhận diện cụ thể loại câu hỏi nhị phân
    let binaryType = "yes_no";
    if (/(nghỉ việc|đổi việc|thôi việc|nghỉ hay ở|ở lại hay đi)/i.test(qClean)) {
        binaryType = "quit_job";
    } else if (/(thi|đậu|rớt|đỗ|trượt|qua môn|đạt)/i.test(qClean)) {
        binaryType = "pass_fail";
    } else if (/(quay lại|hàn gắn)/i.test(qClean)) {
        binaryType = "reconcile";
    } else if (/(còn yêu|còn thương|thật lòng|thương mình)/i.test(qClean)) {
        binaryType = "love_feelings";
    } else if (/(có nên|nên)/i.test(qClean)) {
        binaryType = "should_do";
    }

    // Nhận diện sắc thái riêng trong câu chuyện
    const hasBoss = /(sếp|quản lý|trưởng phòng|leader|giám đốc)/.test(q);
    const isToxic = /(toxic|độc hại|chèn ép|áp bức|bắt nạt|ngột ngạt|bất công|oan ức)/.test(q);
    const isExhausted = /(mệt|áp lực|kiệt sức|quá tải|chán nản|stress|bế tắc|rệu rã)/.test(q) || isToxic;
    const isColdLove = /(lạnh nhạt|vô tâm|xa cách|im lặng|không nhắn tin|hờ hững|né tránh)/.test(q);

    // 2. Tính điểm năng lượng bộ bài để kết luận dứt khoát
    let totalScore = 0;
    let warningCards = [];

    const processedCards = cards.map((c) => {
        const d = c.data;
        const isRev = c.isReversed;
        let score = isRev ? -1 : 1;

        if (d.id === 'major-19' || d.id === 'major-17' || d.id === 'major-21') score = isRev ? 0.5 : 2; // Sun, Star, World
        else if (d.id === 'major-16') score = -2; // Tower
        else if (d.id === 'major-13') score = isRev ? -0.5 : -1.5; // Death
        else if (d.id === 'major-15') score = -1.5; // Devil
        else if (d.id === 'major-18') score = isRev ? -0.5 : -1; // Moon
        else if (d.id === 'major-0') score = isRev ? -1 : 1.5; // Fool

        if (d.id && d.id.includes('cups') && (d.id.includes('ace') || d.id.includes('10') || d.id.includes('2') || d.id.includes('3'))) {
            score = isRev ? -0.5 : 1.5;
        }

        totalScore += score;
        if (isRev || d.id === 'major-16' || d.id === 'major-15' || d.id === 'major-18' || d.id === 'major-13' || (d.id && d.id.includes('swords') && !isRev)) {
            warningCards.push({ name: d.nameVi, isRev });
        }

        // Lấy nghĩa phù hợp bối cảnh
        let meaning = "";
        if (theme === "love" && d.love) meaning = isRev ? d.love.reversed : d.love.upright;
        else if (theme === "work" && d.work) meaning = isRev ? d.work.reversed : d.work.upright;
        else if (theme === "finance" && d.finance) meaning = isRev ? d.finance.reversed : d.finance.upright;
        else if (theme === "exam" && d.study) meaning = isRev ? d.study.reversed : d.study.upright;
        else meaning = isRev ? (d.reversed || d.upright) : d.upright;

        return {
            id: d.id,
            nameVi: d.nameVi,
            isRev,
            meaning: (meaning || "").replace(/\.$/, ''),
            keywords: (d.keywords || []).slice(0, 2).join(', ')
        };
    });

    // 3. Luận giải 3 lá theo MẠCH - mỗi lá 1 bullet (Nguyên tắc 2 & 3)
    const [c1, c2, c3] = processedCards;

    // --- BULLET 1: Cội nguồn / Nền tảng ---
    let b1 = "";
    if (c1.id === 'major-16') {
        b1 = `**${c1.nameVi} (${c1.isRev ? 'ngược' : 'xuôi'})**: Nền tảng câu chuyện này vốn dĩ đã có sự rạn nứt hoặc xáo trộn bất ngờ; môi trường hoặc tình thế này không còn giữ được sự ổn định vốn có, và nó buộc bạn phải đối diện với sự thật thay vì tiếp tục tự an ủi mình.`;
    } else if (theme === "exam") {
        if (c1.isRev) {
            b1 = `**${c1.nameVi} (ngược)**: Quá trình ôn luyện và chuẩn bị ban đầu của bạn dường như đang có sự chệch nhịp (${c1.meaning.toLowerCase()}), có thể bạn bị phân tâm hoặc thiếu một kế hoạch ôn thi thực sự bài bản.`;
        } else {
            b1 = `**${c1.nameVi} (xuôi)**: Nền tảng kiến thức và sự chuẩn bị của bạn cho kỳ thi này khá vững vàng (${c1.meaning.toLowerCase()}); bạn có thực lực và tư duy nhạy bén, đây là bệ phóng tốt để bước vào phòng thi.`;
        }
    } else if (theme === "work") {
        if (hasBoss && isToxic) {
            b1 = `**${c1.nameVi} (${c1.isRev ? 'ngược' : 'xuôi'})**: Ngay từ đầu hoặc trong suốt thời gian qua, bạn đã dồn rất nhiều công sức cho công việc này (${c1.meaning.toLowerCase()}), nhưng môi trường quản lý độc hại lại không hề công nhận nỗ lực ấy mà chỉ liên tục tạo thêm áp lực bào mòn năng lượng của bạn.`;
        } else if (c1.isRev) {
            b1 = `**${c1.nameVi} (ngược)**: Xuất phát điểm của vấn đề này bắt nguồn từ những bất cập hoặc sự ngập ngừng chưa được giải quyết (${c1.meaning.toLowerCase()}) mà bạn từng cố nhắm mắt bỏ qua với hy vọng mọi thứ sẽ tự êm đẹp.`;
        } else {
            b1 = `**${c1.nameVi} (xuôi)**: Bạn bước vào công việc này với sự tận tụy và thiện chí rất lớn (${c1.meaning.toLowerCase()}), chính vì đã từng dốc lòng như thế nên trước những biến động lúc này, bạn mới cảm thấy trăn trở nhiều đến vậy.`;
        }
    } else if (theme === "love") {
        if (c1.isRev) {
            b1 = `**${c1.nameVi} (ngược)**: Nhìn lại mối quan hệ, ngay từ đầu dường như đã tồn tại những khoảng lặng hoặc sự chưa thấu hiểu (${c1.meaning.toLowerCase()}) mà cả hai chưa từng thực sự ngồi lại giải quyết dứt điểm.`;
        } else {
            b1 = `**${c1.nameVi} (xuôi)**: Hai bạn từng có một khởi đầu với rất nhiều cảm xúc chân thành và sự kết nối đẹp đẽ (${c1.meaning.toLowerCase()}), đây chính là lý do khiến bạn vẫn còn nhiều vương vấn ở hiện tại.`;
        }
    } else {
        if (c1.isRev) {
            b1 = `**${c1.nameVi} (ngược)**: Nền tảng câu chuyện hé lộ rằng có những vướng mắc nội tâm hoặc điểm nghẽn (${c1.meaning.toLowerCase()}) đã âm thầm diễn ra từ trước đó và đang chờ bạn tháo gỡ.`;
        } else {
            b1 = `**${c1.nameVi} (xuôi)**: Bạn đã bắt đầu hành trình này với nguồn năng lượng tích cực và sự chủ động (${c1.meaning.toLowerCase()}), đây là điểm tựa quan trọng cho những bước đi tiếp theo.`;
        }
    }

    // --- BULLET 2: Nút thắt / Thực tế (phản hồi/đối lập/bổ sung lá 1) ---
    let b2 = "";
    if (c2.id === 'major-16') {
        b2 = `**${c2.nameVi} (${c2.isRev ? 'ngược' : 'xuôi'})**: Đối lập hoàn toàn với những gì bạn cố gắng chịu đựng ở lá trước, lá bài này chỉ thẳng vào sự sụp đổ không thể tránh khỏi: cấu trúc này đã rạn nứt quá sâu, nó không bền đâu — kiểu gì cũng sẽ vỡ, vấn đề là bạn chọn buông trước để giữ lấy mình hay tiếp tục để nó kéo bạn kiệt sức theo.`;
    } else if (theme === "exam") {
        if (c2.isRev) {
            b2 = `**${c2.nameVi} (ngược)**: Tuy nhiên, phản hồi lại sự tự tin ở lá trước, áp lực tâm lý và nỗi sợ hãi đang là điểm mù lớn nhất: ${c2.meaning.toLowerCase()}. Bạn có xu hướng bị căng cứng khi bước vào phòng thi hoặc dễ mắc bẫy ở những câu hỏi then chốt nếu không giữ được bình tĩnh.`;
        } else {
            b2 = `**${c2.nameVi} (xuôi)**: Bổ sung trực tiếp cho nỗ lực ôn luyện, thực tế hiện tại yêu cầu bạn phải giữ vững kỷ luật thép: ${c2.meaning.toLowerCase()}. Sự tập trung cao độ và chiến lược làm bài cẩn trọng chính là chiếc chìa khóa quyết định điểm số của bạn.`;
        }
    } else if (theme === "work") {
        if (c2.isRev) {
            b2 = `**${c2.nameVi} (ngược)**: Nhưng phản hồi lại sự cố gắng nhẫn nhịn của bạn, thực tế lại đang dội vào một nút thắt gay gắt: ${c2.meaning.toLowerCase()}. Nó cho thấy bạn đang tự gánh quá nhiều ấm ức và nỗi sợ bước ra khỏi vùng quen thuộc, dù chính bạn cũng biết nơi đó không còn nuôi dưỡng bạn nữa.`;
        } else {
            b2 = `**${c2.nameVi} (xuôi)**: Bổ sung thẳng thắn vào bối cảnh đó, thực trạng lúc này đòi hỏi bạn phải tỉnh táo đối diện: ${c2.meaning.toLowerCase()}. Bạn không thể tiếp tục dùng sự im lặng hay cam chịu để giải quyết vấn đề nữa; ranh giới cần phải được thiết lập rõ ràng.`;
        }
    } else if (theme === "love") {
        if (c2.isRev) {
            b2 = `**${c2.nameVi} (ngược)**: Đối lập với những kỷ niệm đẹp ở lá đầu, thực tế dạo gần đây lại đang gióng lên hồi chuông cảnh báo: ${c2.meaning.toLowerCase()}. Sự xa cách hoặc thiếu lắng nghe đang tạo nên một bức tường vô hình khiến bạn cảm thấy bất an và cô độc ngay trong chính mối quan hệ này.`;
        } else {
            b2 = `**${c2.nameVi} (xuôi)**: Phản chiếu trực diện tình trạng hiện tại, mối quan hệ đang đứng trước một thử thách cần sự rõ ràng: ${c2.meaning.toLowerCase()}. Cả hai cần sự thẳng thắn đối thoại thay vì cứ suy đoán tâm lý của nhau trong im lặng.`;
        }
    } else {
        if (c2.isRev) {
            b2 = `**${c2.nameVi} (ngược)**: Nhưng nối tiếp vào đó, nút thắt hiện tại chạm đúng vào điểm mù: ${c2.meaning.toLowerCase()}. Bạn đang tự trói mình vào những suy nghĩ tiêu cực hoặc sự do dự chưa dám quyết định.`;
        } else {
            b2 = `**${c2.nameVi} (xuôi)**: Bổ sung vào bức tranh, thực tế đang đặt ra cho bạn một đòi hỏi dứt khoát: ${c2.meaning.toLowerCase()}. Đây là thời điểm hành động dựa trên lý trí chứ không thể tiếp tục trì hoãn.`;
        }
    }

    // --- BULLET 3: Chuyển hóa / Kết quả (nối tiếp từ lá 2) ---
    let b3 = "";
    if (c3.id === 'major-17' || c3.id === 'major-19') {
        b3 = `**${c3.nameVi} (xuôi)**: Tuy nhiên, sau những ngột ngạt và căng thẳng của lá thứ hai, lá bài này xuất hiện như một lối thoát vô cùng rực rỡ (${c3.meaning.toLowerCase()}): một khi bạn dám đưa ra quyết định giải phóng bản thân, niềm tin, sự may mắn và năng lượng tích cực sẽ lập tức ùa về ✨.`;
    } else if (theme === "exam") {
        if (c3.isRev) {
            b3 = `**${c3.nameVi} (ngược)**: Nối tiếp từ nút thắt tâm lý đó, kết quả thi cử sẽ phụ thuộc rất lớn vào việc bạn tháo gỡ điểm nghẽn này: ${c3.meaning.toLowerCase()}. Nếu không kịp thời điều chỉnh lại phương pháp và tâm lý ngay từ bây giờ, rủi ro sảy chân ở phút chót là điều cần cảnh giác.`;
        } else {
            b3 = `**${c3.nameVi} (xuôi)**: Nối tiếp dòng năng lượng kỷ luật từ lá thứ hai, kết quả phía trước mở ra rất tích cực: ${c3.meaning.toLowerCase()}. Nỗ lực và sự kiên trì của bạn sẽ gặt hái được trái ngọt xứng đáng khi danh sách trúng tuyển được công bố.`;
        }
    } else if (theme === "work") {
        if (c3.isRev) {
            b3 = `**${c3.nameVi} (ngược)**: Và diễn tiến tiếp theo cho thấy giải pháp không nằm ở việc trông chờ môi trường cũ thay đổi, mà ở việc bạn tự tháo gỡ sự dằn vặt bên trong: ${c3.meaning.toLowerCase()}. Việc chấp nhận buông tay một gánh nặng không còn phù hợp chính là bước đầu tiên để bạn mở ra con đường mới.`;
        } else {
            b3 = `**${c3.nameVi} (xuôi)**: Và kết nối nhân quả từ quyết định dám đối mặt đó, hướng đi tiếp theo mang lại triển vọng rất sáng: ${c3.meaning.toLowerCase()}. Bạn sẽ sớm tìm lại được sự nhẹ nhõm, tự do và những cơ hội chuyên môn công bằng hơn ở phía trước.`;
        }
    } else if (theme === "love") {
        if (c3.isRev) {
            b3 = `**${c3.nameVi} (ngược)**: Tiếp nối nút thắt ở lá trước, hướng đi sắp tới cho thấy sự việc chỉ có thể chuyển biến khi bạn học cách tự yêu thương và bảo vệ bản thân: ${c3.meaning.toLowerCase()}. Đừng hạ thấp giá trị của mình để níu giữ một người không còn muốn đồng hành.`;
        } else {
            b3 = `**${c3.nameVi} (xuôi)**: Nối tiếp từ sự rõ ràng đó, diễn tiến sắp tới mở ra khả năng hàn gắn và tái lập sự tin tưởng: ${c3.meaning.toLowerCase()}. Cả hai sẽ tìm lại được sự đồng điệu khi cùng nhau buông bỏ cái tôi.`;
        }
    } else {
        if (c3.isRev) {
            b3 = `**${c3.nameVi} (ngược)**: Diễn tiến tiếp theo nhắc bạn rằng sự chuyển hóa cần thời gian để lắng lại: ${c3.meaning.toLowerCase()}. Hãy kiên nhẫn với chính mình và đừng vội vàng khi tâm trí chưa thực sự bình an.`;
        } else {
            b3 = `**${c3.nameVi} (xuôi)**: Và kết nối tự nhiên từ đó, dòng chảy tương lai mở ra cánh cửa mới đầy hứa hẹn: ${c3.meaning.toLowerCase()}. Khi bạn dám hành động, vũ trụ sẽ hỗ trợ bạn bằng những cơ hội bất ngờ.`;
        }
    }

    const bullets = `- ${b1}\n- ${b2}\n- ${b3}`;

    // 4. Cấu trúc kết luận (BẮT BUỘC, ĐẶT CUỐI)
    let conclusionDirection = "";
    let confidence = "";
    let caveatSentence = "";
    let directYesNo = "";

    const absScore = Math.abs(totalScore);
    if (absScore >= 2.5) confidence = "Mức độ tự tin: 85 - 90%";
    else confidence = "Mức độ tự tin: 70 - 75%";

    if (warningCards.length > 0) {
        const warnNames = warningCards.map(w => `${w.name} ${w.isRev ? '(ngược)' : ''}`).join(', ');
        caveatSentence = `Dù vậy, trải bài chưa thể coi là hoàn hảo 100% vì có sự xuất hiện của ${warnNames} — tín hiệu nhắc bạn không được chủ quan, cần chuẩn bị kỹ lưỡng các phương án dự phòng và giữ vững tâm lý.`;
    } else {
        caveatSentence = `Bộ bài có dòng chảy năng lượng rất thuận và đồng thuận cao, không gặp phải sự cản trở lớn nào từ các lá năng lượng nặng.`;
    }

    if (isBinary) {
        if (binaryType === "quit_job") {
            // Khi hỏi sếp toxic / nghỉ việc:
            // Nếu c1 hoặc c2 là Tower hoặc lá ngược, mà c3 là Star hoặc lá xuôi -> Rõ ràng NÊN NGHỈ
            const hasCollapseOrToxicity = cards.some(c => c.data.id === 'major-16' || c.isReversed) || isToxic;
            if (hasCollapseOrToxicity && (cards[2].data.id === 'major-17' || !cards[2].isReversed)) {
                conclusionDirection = "Nghiêng về NÊN NGHỈ VIỆC (hoặc chủ động tìm bến đỗ mới)";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng YES (Nên nghỉ để giải phóng bản thân) 🌱.`;
            } else if (totalScore > 0) {
                conclusionDirection = "Nghiêng về TẠM THỜI Ở LẠI / TÌM THỜI ĐIỂM KHÁC";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng NO (Chưa nên nghỉ vội vàng lúc này).`;
            } else {
                conclusionDirection = "Nghiêng về NÊN RỜI ĐI";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng YES (Nên rời đi).`;
            }
        } else if (binaryType === "pass_fail") {
            if (totalScore >= 0) {
                conclusionDirection = "Nghiêng về ĐẠT / VƯỢT QUA KỲ THI";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng ĐỖ / ĐẠT 🎯.`;
            } else {
                conclusionDirection = "Nghiêng về NGUY CƠ RỚT / CẦN THAY ĐỔI GẤP";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng KHÔNG ĐẠT (nếu giữ nguyên cách làm hiện tại).`;
            }
        } else if (binaryType === "love_feelings") {
            if (totalScore >= 0) {
                conclusionDirection = "Nghiêng về CÓ (Người ấy vẫn còn tình cảm và trăn trở về bạn)";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng CÓ (YES) 💖.`;
            } else {
                conclusionDirection = "Nghiêng về KHÔNG (Tình cảm đã phai nhạt hoặc người ấy đã buông xuôi)";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng KHÔNG (NO).`;
            }
        } else if (binaryType === "reconcile") {
            if (totalScore > 0) {
                conclusionDirection = "Nghiêng về CÓ CƠ HỘI HÀN GẮN";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng CÓ THỂ QUAY LẠI.`;
            } else {
                conclusionDirection = "Nghiêng về KHÓ QUAY LẠI / NÊN KHÉP LẠI";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng KHÔNG NÊN QUAY LẠI.`;
            }
        } else if (binaryType === "should_do") {
            if (totalScore >= 0) {
                conclusionDirection = "Nghiêng về NÊN TIẾN HÀNH";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng NÊN (YES).`;
            } else {
                conclusionDirection = "Nghiêng về CHƯA NÊN / NÊN TẠM DỪNG";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng CHƯA NÊN (NO).`;
            }
        } else {
            if (totalScore >= 0) {
                conclusionDirection = "mình nghiêng YES (Khả năng tích cực rất cao)";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng YES.`;
            } else {
                conclusionDirection = "mình nghiêng NO (Nhiều rào cản bất lợi)";
                directYesNo = `Nếu câu hỏi của bạn là '${raw}' → mình nghiêng NO.`;
            }
        }
    } else {
        // Câu hỏi MỞ: Đưa ra hướng đi / hành động cụ thể
        if (theme === "work") {
            conclusionDirection = "Tập trung nâng cấp kỹ năng chuyên môn và chủ động mở rộng mạng lưới cơ hội mới thay vì bị động chờ đợi";
        } else if (theme === "love") {
            conclusionDirection = "Dành không gian đối thoại chân thành và thiết lập ranh giới cảm xúc rõ ràng để bảo vệ sự an yên của chính mình";
        } else if (theme === "finance") {
            conclusionDirection = "Bảo toàn dòng tiền hiện có và cắt giảm triệt để các chi phí không cần thiết trước khi nghĩ đến đầu tư mạo hiểm";
        } else {
            conclusionDirection = "Chủ động dọn dẹp những gánh nặng tâm lý cũ và kiên định đi từng bước nhỏ để tái thiết lập sự tự chủ";
        }
    }

    let conclusionBlock = "";
    if (isBinary) {
        conclusionBlock = `👉 Kết luận: ${conclusionDirection} [${confidence}]\n${caveatSentence}\n${directYesNo}`;
    } else {
        conclusionBlock = `👉 Kết luận: ${conclusionDirection} [${confidence}]\n${caveatSentence}\nGợi ý hành động: Hãy ưu tiên thực hiện 1-2 việc nhỏ ngay trong 48 giờ tới để giữ thế chủ động và tìm lại sự nhẹ nhõm cho bản thân ✨.`;
    }

    return `${bullets}\n\n${conclusionBlock}`;
}

// Test cases
console.log("=== TEST 1: Sếp toxic nghỉ việc không? ===");
const testCards1 = [
    { data: bookData[16], isReversed: false }, // Tower
    { data: bookData[8], isReversed: true },   // Strength rev
    { data: bookData[17], isReversed: false }  // Star
];
console.log(generateCompanionInterpretation("Mình có nên nghỉ việc không vì sếp toxic quá?", testCards1));

console.log("\n=== TEST 2: Thi công chức có đỗ không? ===");
const testCards2 = [
    { data: bookData[1], isReversed: false },  // Magician
    { data: bookData[4], isReversed: false },  // Emperor
    { data: bookData[19], isReversed: false }  // Sun
];
console.log(generateCompanionInterpretation("Sắp tới thi công chức có đỗ không ạ?", testCards2));

console.log("\n=== TEST 3: Câu hỏi mở về tương lai công việc ===");
const testCards3 = [
    { data: bookData[0], isReversed: false },  // Fool
    { data: bookData[12], isReversed: true },  // Hanged Man rev
    { data: bookData[10], isReversed: false }  // Wheel of Fortune
];
console.log(generateCompanionInterpretation("Tương lai công việc sắp tới của mình thế nào?", testCards3));
