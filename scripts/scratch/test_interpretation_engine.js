const fs = require('fs');

const bookData = JSON.parse(fs.readFileSync('./tarot_book.json', 'utf8'));

// Prototype function
function generateMasterTarotInterpretation(question, cards) {
    const raw = (question || "").trim() || "Điều gì đang chờ đợi mình phía trước?";
    const q = raw.toLowerCase();
    const qClean = q.replace(/[?!.,;]/g, ' ').replace(/\s+/g, ' ').trim();

    // 1. Phân loại bối cảnh chuyên sâu
    const isToxicBoss = /(sếp|quản lý|trưởng phòng|leader|giám đốc)/.test(q) && /(toxic|độc hại|chèn ép|áp bức|bắt nạt|ngột ngạt|bất công|oan ức|mệt mỏi)/.test(q);
    const isQuitJob = /(nghỉ việc|đổi việc|thôi việc|nhảy việc|bỏ việc|rút lui|bỏ cuộc|ra đi)/.test(q);
    const isExam = /(thi|học|kỳ thi|điểm|đậu|rớt|đỗ|trượt|tốt nghiệp|bằng cấp|du học|qua môn)/.test(q);
    const isReconcile = /(quay lại|hàn gắn|tái hợp|làm lành|người cũ|chia tay rồi)/.test(q);
    const isLoveFeelings = /(còn yêu|còn thương|thật lòng|thương mình|nghĩ gì về mình|tình cảm|thích mình)/.test(q);
    const isColdLove = /(lạnh nhạt|vô tâm|xa cách|im lặng|không nhắn tin|hờ hững|né tránh|mập mờ)/.test(q);
    const isFinance = /(tiền|tài chính|đầu tư|lỗ|lời|nợ|chứng khoán|đất|mua nhà|mua xe|kinh doanh|vốn)/.test(q);
    const isCareer = isToxicBoss || isQuitJob || /(việc|công ty|nghề|đồng nghiệp|lương|dự án|sự nghiệp|thăng tiến|phỏng vấn)/.test(q);
    const isLove = isReconcile || isLoveFeelings || isColdLove || /(yêu|tình|crush|người yêu|người ấy|hẹn hò|chia tay|kết hôn|chồng|vợ)/.test(q);

    let theme = "general";
    if (isExam) theme = "exam";
    else if (isLove) theme = "love";
    else if (isCareer) theme = "work";
    else if (isFinance) theme = "finance";

    // 2. Tính toán năng lượng tổng hợp
    let totalScore = 0;
    let warningCards = [];

    const processedCards = cards.map((c, i) => {
        const d = c.data;
        const isRev = c.isReversed;
        let score = isRev ? -1 : 1;

        if (['major-19', 'major-17', 'major-21', 'major-3', 'major-1'].includes(d.id)) score = isRev ? 0.5 : 2;
        else if (d.id === 'major-16') score = -2; // Tower
        else if (d.id === 'major-15') score = -1.5; // Devil
        else if (d.id === 'major-13') score = isRev ? -0.5 : -1.5; // Death
        else if (d.id === 'major-18') score = isRev ? -0.5 : -1; // Moon
        else if (d.id === 'major-0') score = isRev ? -1 : 1.5; // Fool

        if (d.id && d.id.includes('cups') && (d.id.includes('ace') || d.id.includes('10') || d.id.includes('2') || d.id.includes('3'))) {
            score = isRev ? -0.5 : 1.5;
        }
        if (d.id && d.id.includes('swords') && (d.id.includes('3') || d.id.includes('9') || d.id.includes('10') || d.id.includes('5'))) {
            score = isRev ? 0 : -1.5;
        }

        totalScore += score;
        if (isRev || ['major-16', 'major-15', 'major-18', 'major-13'].includes(d.id) || (d.id && d.id.includes('swords') && !isRev)) {
            warningCards.push({ name: d.nameVi, isRev, d });
        }

        let contextualMeaning = "";
        if (theme === "love" && d.love) contextualMeaning = isRev ? d.love.reversed : d.love.upright;
        else if (theme === "work" && d.work) contextualMeaning = isRev ? d.work.reversed : d.work.upright;
        else if (theme === "finance" && d.finance) contextualMeaning = isRev ? d.finance.reversed : d.finance.upright;
        else if (theme === "exam" && d.study) contextualMeaning = isRev ? d.study.reversed : d.study.upright;
        else contextualMeaning = isRev ? (d.reversed || d.upright) : d.upright;

        return {
            d,
            posName: ["Căn nguyên / Nền tảng", "Thực trạng / Nút thắt", "Xu hướng / Chuyển hóa"][i],
            nameVi: d.nameVi,
            nameEn: d.nameEn,
            isRev,
            contextualMeaning: (contextualMeaning || "").replace(/\.$/, ''),
            deep: d.deepInterpretation || d.fortune || ""
        };
    });

    const [c1, c2, c3] = processedCards;

    // 3. TRẢ LỜI TRỰC DIỆN VÀO CÂU HỎI NGAY TỪ CÂU ĐẦU TIÊN (Direct Answer First)
    let directOpening = "";
    if (isReconcile) {
        if (totalScore >= 1) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy cơ hội quay lại vẫn còn cửa, nhưng hiện tại chưa phải lúc để bạn vội vàng thúc ép đối phương.`;
        } else if (totalScore <= -1) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy khả năng tái hợp ở thời điểm này là rất thấp; mối quan hệ này đang cần một khoảng lặng dứt khoát để cả hai thôi làm tổn thương nhau.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy cánh cửa quay lại chỉ có thể mở ra nếu cả hai cùng chịu nhìn thẳng vào nguyên nhân rạn nứt cũ, còn nếu chỉ dựa vào cảm xúc nhất thời thì kịch bản tan vỡ sẽ lặp lại.`;
        }
    } else if (isToxicBoss || isQuitJob) {
        if (c1.d.id === 'major-16' || c2.d.id === 'major-16' || c3.d.id === 'major-17' || totalScore <= 0) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy quyết định buông bỏ công việc này là một lối thoát cần thiết để bảo vệ sức khỏe tinh thần của bạn, nhưng hãy chuẩn bị kỹ phương án dự phòng trước khi nộp đơn.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy việc muốn rời đi lúc này phần nhiều đến từ sự ức chế cảm xúc nhất thời; trước mắt bạn nên lùi lại thiết lập ranh giới rõ ràng thay vì hành động bộc phát.`;
        }
    } else if (isExam) {
        if (totalScore >= 0.5) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy khả năng đỗ đạt hoặc đạt kết quả kỳ vọng là rất sáng, miễn là bạn kiểm soát tốt sự hồi hộp trong phòng thi.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy kết quả kỳ thi đang ở thế chông chênh; bạn cần thay đổi gấp chiến lược ôn tập và bịt các lỗ hổng kiến thức thay vì ôm tâm lý cầu may.`;
        }
    } else if (isLoveFeelings || isColdLove) {
        if (totalScore >= 0.5) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy người ấy vẫn còn tình cảm và những trăn trở về bạn, nhưng đang có rào cản tâm lý khiến họ ngập ngừng chưa dám bày tỏ.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy sự lạnh nhạt này phản ánh một khoảng cách tâm lý đã tồn tại từ lâu; bạn không nên tiếp tục hạ thấp kỳ vọng của bản thân để níu giữ sự thờ ơ.`;
        }
    } else if (isFinance) {
        if (totalScore >= 1) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy tình hình tài chính sắp tới sẽ có tín hiệu phục hồi rõ nét, mở ra cơ hội sinh lời nếu bạn đi từng bước cẩn trọng.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy lúc này ưu tiên số một là giữ chặt dòng tiền và bảo toàn nguồn vốn hiện có, tuyệt đối không nên nóng vội lao vào các quyết định mạo hiểm.`;
        }
    } else if (isCareer) {
        if (totalScore >= 0.5) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy con đường công việc phía trước đang có những biến chuyển tích cực và mở ra cơ hội khẳng định năng lực thực sự của bạn.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy công việc hiện tại đang rơi vào điểm nghẽn; đây là lúc bạn cần tỉnh táo nhìn nhận lại định hướng thay vì tiếp tục dậm chân tại chỗ trong sự mệt mỏi.`;
        }
    } else {
        if (totalScore >= 0.5) {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy dòng chảy phía trước đang mở ra theo hướng thuận lợi, điều quan trọng nhất là bạn cần tự tin hành động theo trực giác của mình.`;
        } else {
            directOpening = `Chào bạn, nếu nhìn thẳng vào câu hỏi của bạn và kết hợp 3 lá bài này, mình thấy bạn đang đứng trước một nút thắt tâm lý cần được tháo gỡ dứt khoát trước khi có thể bước tiếp một cách nhẹ nhõm.`;
        }
    }

    // 4. PHẦN 1: PHÂN TÍCH TỪNG LÁ BÀI BÁM SÁT NGỮ CẢNH CÂU HỎI
    let cardAnalysis1 = "";
    if (theme === "work") {
        if (isToxicBoss) {
            cardAnalysis1 = `Lá bài này phản ánh xuất phát điểm câu chuyện: bạn đã dồn rất nhiều thiện chí và tâm sức cho công việc (${c1.contextualMeaning.toLowerCase()}), nhưng môi trường quản lý độc hại lại liên tục bào mòn năng lượng và không ghi nhận sự cống hiến đó, tạo nên cảm giác ức chế tích tụ lâu ngày.`;
        } else {
            cardAnalysis1 = `Lá bài này đại diện cho nền tảng công việc của bạn: ${c1.isRev ? 'năng lượng đang bị kìm hãm hoặc có những bất cập ban đầu chưa được tháo gỡ dứt điểm (' + c1.contextualMeaning.toLowerCase() + ')' : 'bạn vốn có nền tảng năng lực và sự tận tâm đáng quý (' + c1.contextualMeaning.toLowerCase() + '), chính vì vậy bạn mới trăn trở nhiều khi mọi chuyện không như ý'}.`;
        }
    } else if (theme === "love") {
        if (isReconcile || isColdLove) {
            cardAnalysis1 = `Lá bài này hé lộ cội nguồn cảm xúc giữa hai người: ${c1.isRev ? 'ngay từ giai đoạn trước đã tồn tại những bất đồng ngầm hoặc sự chưa thấu hiểu (' + c1.contextualMeaning.toLowerCase() + ') nhưng cả hai từng chọn cách né tránh thay vì đối thoại' : 'hai bạn từng có giai đoạn gắn kết rất đẹp và chân thành (' + c1.contextualMeaning.toLowerCase() + '), đây là lý do khiến bạn vẫn còn vương vấn và day dứt đến tận hôm nay'}.`;
        } else {
            cardAnalysis1 = `Lá bài này phản ánh nền tảng cảm xúc hiện tại: ${c1.contextualMeaning.toLowerCase()}; tâm lý của bạn đang vừa mong chờ một sự thấu hiểu, vừa e ngại những tổn thương có thể lặp lại.`;
        }
    } else if (theme === "exam") {
        cardAnalysis1 = `Lá bài này soi chiếu giai đoạn chuẩn bị của bạn: ${c1.isRev ? 'quá trình ôn luyện vừa qua dường như có lúc bị gián đoạn hoặc mất tập trung (' + c1.contextualMeaning.toLowerCase() + ')' : 'bạn có sự tích lũy kiến thức và quyết tâm nhất định (' + c1.contextualMeaning.toLowerCase() + '), đặt nền móng quan trọng cho kỳ thi'}.`;
    } else if (theme === "finance") {
        cardAnalysis1 = `Lá bài này đại diện cho nền móng tài chính hiện tại: ${c1.contextualMeaning.toLowerCase()}; những quyết định chi tiêu hoặc đầu tư trong quá khứ đang trực tiếp định hình dòng tiền của bạn lúc này.`;
    } else {
        cardAnalysis1 = `Lá bài này soi chiếu điểm xuất phát của vấn đề: ${c1.contextualMeaning.toLowerCase()}; nó cho thấy thái độ và những lựa chọn ban đầu của bạn đang tạo đà cho cục diện hôm nay.`;
    }

    let cardAnalysis2 = "";
    if (theme === "work") {
        if (c2.d.id === 'major-16') {
            cardAnalysis2 = `Lá bài này chỉ thẳng vào điểm chạm thực tế tàn khốc: cấu trúc hiện tại đã rạn nứt đến mức không thể tự hàn gắn; sự chèn ép hoặc áp lực công việc đã chạm ngưỡng chịu đựng của bạn, nhắc bạn không thể tiếp tục dùng sự chịu đựng để hy vọng một phép màu tự đến.`;
        } else {
            cardAnalysis2 = `Lá bài này phản ánh nút thắt thực tại: ${c2.contextualMeaning.toLowerCase()}. ${c2.isRev ? 'Tâm lý của bạn đang bị đè nặng bởi sự hoang mang, sợ thay đổi và e ngại rủi ro khi bước ra khỏi vùng quen thuộc.' : 'Thực tế đòi hỏi bạn phải có lập trường sắc bén và ranh giới rõ ràng, không thể tiếp tục nhận phần thiệt thòi về mình.'}`;
        }
    } else if (theme === "love") {
        if (c2.d.id === 'major-16') {
            cardAnalysis2 = `Lá bài này mô tả cú sốc hoặc sự rạn nứt không thể che giấu: một sự việc hoặc một cuộc trò chuyện đã làm vỡ tan những kỳ vọng viển vông; cả hai đang phải đối diện với sự thật trần trụi về những điều không thể dung hòa.`;
        } else {
            cardAnalysis2 = `Lá bài này phản ánh thực trạng cảm xúc giữa đôi bên: ${c2.contextualMeaning.toLowerCase()}. ${c2.isRev ? 'Cả bạn và người ấy đều đang dựng lên bức tường phòng thủ tâm lý, ai cũng sợ bị tổn thương nên chọn cách im lặng hoặc tỏ ra bất cần.' : 'Năng lượng đòi hỏi sự thẳng thắn; nếu không dám ngồi lại làm rõ nút thắt này, khoảng cách giữa hai người sẽ ngày càng xa hơn.'}`;
        }
    } else if (theme === "exam") {
        cardAnalysis2 = `Lá bài này phản chiếu điểm nghẽn lớn nhất lúc này: ${c2.contextualMeaning.toLowerCase()}. Tâm lý căng cứng và nỗi sợ thất bại đang là rào cản lớn nhất; nếu không giải tỏa được sự lo âu, bạn sẽ rất dễ mắc bẫy ở những phần thi quan trọng.`;
    } else if (theme === "finance") {
        cardAnalysis2 = `Lá bài này chỉ ra thử thách thực tế: ${c2.contextualMeaning.toLowerCase()}. Dòng tiền đang chịu sức ép từ các khoản chi phí phát sinh hoặc sự do dự trong việc cắt lỗ/tái cơ cấu.`;
    } else {
        cardAnalysis2 = `Lá bài này phản chiếu thử thách hiện tại: ${c2.contextualMeaning.toLowerCase()}; đây là nút thắt bạn bắt buộc phải đối mặt chứ không thể tiếp tục trì hoãn.`;
    }

    let cardAnalysis3 = "";
    if (theme === "work") {
        if (c3.d.id === 'major-17' || !c3.isRev) {
            cardAnalysis3 = `Lá bài này mở ra hướng chuyển biến rất tích cực: ${c3.contextualMeaning.toLowerCase()}. Khi bạn dám đưa ra quyết định giải phóng bản thân và hành động dứt khoát, nguồn năng lượng hy vọng và những cơ hội mới sẽ xuất hiện, giúp bạn tìm lại sự tự chủ và nhẹ nhõm.`;
        } else {
            cardAnalysis3 = `Lá bài này cảnh báo xu hướng tiếp theo: ${c3.contextualMeaning.toLowerCase()}. Nếu bạn vẫn ngập ngừng và không chịu thiết lập lại kế hoạch hành động, sự mông lung và mệt mỏi này sẽ còn kéo dài thêm một khoảng thời gian nữa.`;
        }
    } else if (theme === "love") {
        if (c3.d.id === 'major-17' || !c3.isRev) {
            cardAnalysis3 = `Lá bài này mang năng lượng hồi phục và chữa lành: ${c3.contextualMeaning.toLowerCase()}. Dù tương lai có quay lại hay bước tiếp riêng rẽ, bạn cũng sẽ tìm lại được sự bình yên và thấu suốt trong lòng mình; sự chân thành sẽ dẫn lối bạn đến đúng nơi bạn thuộc về.`;
        } else {
            cardAnalysis3 = `Lá bài này cho thấy diễn biến tiếp theo nếu không thay đổi: ${c3.contextualMeaning.toLowerCase()}. Việc níu giữ trong mù quáng chỉ khiến bạn thêm hao mòn tâm lực; bạn cần học cách yêu thương và trân trọng giá trị của bản thân trước tiên.`;
        }
    } else if (theme === "exam") {
        cardAnalysis3 = `Lá bài này chỉ ra kết quả cuối cùng: ${c3.contextualMeaning.toLowerCase()}. Thành quả sẽ phản ánh đúng mức độ bạn làm chủ tâm lý và kiên trì rà soát kiến thức đến giây phút cuối cùng.`;
    } else if (theme === "finance") {
        cardAnalysis3 = `Lá bài này mở ra hướng tài chính tương lai: ${c3.contextualMeaning.toLowerCase()}. Một giải pháp tháo gỡ hoặc cơ hội tăng thu nhập sẽ xuất hiện nếu bạn giữ được kỷ luật thép trong việc quản lý chi tiêu.`;
    } else {
        cardAnalysis3 = `Lá bài này chỉ ra hướng chuyển hóa: ${c3.contextualMeaning.toLowerCase()}; kết quả cuối cùng hoàn toàn phụ thuộc vào việc bạn có dũng cảm thay đổi lối mòn suy nghĩ hiện tại hay không.`;
    }

    // 5. PHẦN 2: GHÉP CẢ 3 LÁ (TỔNG HỢP DÒNG CHẢY NĂNG LƯỢNG)
    let condensedMessage = "";
    let flowCause = "";
    let flowState = "";
    let flowTrend = "";

    if (isReconcile) {
        condensedMessage = totalScore >= 0
            ? "Còn cửa hàn gắn, nhưng chiếc chìa khóa nằm ở việc chữa lành tổn thương cũ chứ không phải vội vã nhắn tin nối lại quan hệ."
            : "Cánh cửa này đã hoàn thành sứ mệnh; bài học lớn nhất lúc này là buông tay để giữ lại sự tự tôn và bình an cho chính mình.";
        flowCause = "Sự thiếu lắng nghe và những kỳ vọng không thành thật trong quá khứ đã âm thầm tích tụ thành vết rạn.";
        flowState = "Hiện tại đôi bên đều đang trong trạng thái phòng thủ, nửa muốn kết nối lại nửa lại sợ bị đối phương làm tổn thương lần nữa.";
        flowTrend = "Nếu tiếp tục giữ sự giằng co và cái tôi này, mối quan hệ sẽ trôi dần vào khoảng lặng nguội lạnh; ngược lại nếu cho nhau khoảng không gian để tự nhìn nhận lại mình, mọi sự sẽ sáng tỏ.";
    } else if (isToxicBoss || isQuitJob) {
        condensedMessage = "Môi trường cũ không còn đất để bạn phát triển; rời đi là điều sớm muộn, nhưng hãy biến nó thành một cuộc rút lui có chiến lược thay vì một sự bộc phát.";
        flowCause = "Sự bất cân xứng giữa công sức bạn bỏ ra và cách đối đãi của môi trường quản lý đã chạm đến giới hạn chịu đựng.";
        flowState = "Bạn đang ở trong tình trạng vừa cạn kiệt năng lượng vừa sợ hãi cảm giác bấp bênh khi phải bắt đầu lại từ con số không.";
        flowTrend = "Nếu tiếp tục cam chịu, sức khỏe tinh thần của bạn sẽ bị tàn phá nặng nề; nhưng nếu bạn âm thầm chuẩn bị kỹ năng và tài chính dự phòng từ hôm nay, cánh cửa mới sẽ mở ra rất êm đẹp.";
    } else if (isExam) {
        condensedMessage = "Thực lực của bạn có đủ để vượt qua, rào cản duy nhất lúc này là sự xao nhãng và áp lực tâm lý tự tạo.";
        flowCause = "Quá trình chuẩn bị có lúc mất tập trung khiến bạn nảy sinh sự hoài nghi về khả năng của bản thân.";
        flowState = "Tâm lý hồi hộp trước kỳ thi đang khiến bạn dễ bị rối trí khi giải quyết các dạng đề hóc búa.";
        flowTrend = "Nếu giữ vững kỷ luật trong những ngày cuối và bước vào phòng thi với tâm thế bình thản, kết quả chắc chắn sẽ không phụ công bạn.";
    } else if (isFinance) {
        condensedMessage = "Cần hạ nhiệt mọi toan tính mạo hiểm; ưu tiên bảo toàn nguồn vốn và bịt các lỗ rò rỉ dòng tiền trước khi nghĩ đến việc sinh lời.";
        flowCause = "Các quyết định chi tiêu cảm tính hoặc kỳ vọng lợi nhuận quá nhanh đang tạo ra áp lực tài chính ngắn hạn.";
        flowState = "Bạn đang phải cân đối giữa nhu cầu chi trả trước mắt và mong muốn tích lũy dài hạn.";
        flowTrend = "Nếu kiên nhẫn thắt chặt chi tiêu và từ chối các cơ hội kiếm tiền thiếu minh bạch, bạn sẽ nhanh chóng lấy lại thế chủ động tài chính.";
    } else {
        condensedMessage = totalScore >= 0
            ? "Mọi chuyển biến đang mở ra đúng thời điểm; hãy kiên định với mục tiêu và lắng nghe trực giác của mình."
            : "Nút thắt này nhắc bạn cần dũng cảm dừng lại để tái định vị bản thân thay vì cố chấp đâm đầu vào ngõ cụt.";
        flowCause = "Những thói quen và sự do dự trong quá khứ đang là cội nguồn của sự ngổn ngang hôm nay.";
        flowState = "Bạn đang đứng ở ngã ba đường với rất nhiều suy nghĩ giằng xé nội tâm chưa tìm được lời giải.";
        flowTrend = "Chỉ khi bạn dám dứt khoát buông bỏ những điều không còn phù hợp, dòng chảy năng lượng mới có thể thông suốt trở lại.";
    }

    // 6. PHẦN 3: LỜI KHUYÊN HÀNH ĐỘNG THỰC TẾ (Guidance)
    let advice1 = "";
    let advice2 = "";

    if (isReconcile || isColdLove) {
        advice1 = "**Cho bản thân và người ấy một khoảng lặng 7 - 14 ngày:** Tạm ngừng mọi hành động kiểm tra trang cá nhân, ngừng suy đoán tâm lý đối phương; hãy dùng thời gian này để chăm sóc cơ thể, ngủ một giấc sâu và lấy lại sự cân bằng cảm xúc.";
        advice2 = "**Khi đối thoại, hãy thẳng thắn làm rõ gốc rễ vấn đề cũ:** Nếu có cơ hội trò chuyện lại, hãy dùng ngôn từ chia sẻ cảm xúc ('Mình cảm thấy...') thay vì trách móc ('Tại sao anh/em...'); chỉ đồng ý quay lại khi cả hai đã có giải pháp cụ thể cho nguyên nhân rạn nứt trước đây.";
    } else if (isToxicBoss || isQuitJob) {
        advice1 = "**Thiết lập ranh giới tâm lý ngay hôm nay:** Chỉ làm tròn trách nhiệm trong phạm vi công việc được giao; kiên quyết không nhận sự bực dọc vô cớ từ cấp trên vào lòng và tắt toàn bộ thông báo công việc sau giờ làm để tái tạo năng lượng.";
        advice2 = "**Chuẩn bị đường lui trong thầm lặng:** Dành thời gian cuối tuần này rà soát lại quỹ tiết kiệm khẩn cấp (đủ sống từ 3 - 6 tháng) và cập nhật lại CV để gửi đến 2-3 cơ hội mới; khi biết mình luôn có lựa chọn khác, sự uy hiếp của môi trường cũ sẽ không còn làm bạn sợ hãi nữa.";
    } else if (isExam) {
        advice1 = "**Lập bảng tổng kết các lỗi sai hay gặp:** Dành 80% thời gian còn lại để làm lại những câu hỏi đã từng làm sai thay vì cố nhồi nhét thêm kiến thức mới; hiểu chắc những gì mình đã học là cách tốt nhất để không mất điểm oan.";
        advice2 = "**Tập thở sâu và mô phỏng áp lực phòng thi:** Mỗi ngày dành 1 tiếng làm bài nghiêm túc không dùng điện thoại để rèn luyện sự bình tĩnh và phản xạ tập trung cho não bộ.";
    } else if (isFinance) {
        advice1 = "**Nguyên tắc hạ nhiệt 7 ngày:** Với bất kỳ quyết định mua sắm hoặc đầu tư lớn nào lúc này, hãy bắt buộc bản thân hoãn lại ít nhất một tuần để lý trí có thời gian cân nhắc cẩn trọng.";
        advice2 = "**Cắt bỏ triệt để các khoản chi vô hình:** Rà soát lại tài khoản ngân hàng và hủy ngay những dịch vụ đăng ký hàng tháng không thực sự cần thiết; tích lũy từng khoản nhỏ sẽ giúp bạn gia tăng tấm đệm an toàn tài chính.";
    } else {
        advice1 = "**Dành 30 phút viết hết những lo âu ra giấy:** Việc gọi tên chính xác điều bạn đang sợ hãi sẽ giúp bộ não giảm tải căng thẳng và nhận ra rằng thực tế không hề tồi tệ như bạn tưởng tượng.";
        advice2 = "**Chọn ra 1 hành động nhỏ nhất để giải quyết dứt điểm trong 24 giờ:** Đừng cố ôm đồm thay đổi toàn bộ cuộc sống cùng một lúc; một bước đi nhỏ nhưng dứt khoát sẽ kích hoạt lại cảm giác tự chủ cho bạn.";
    }

    // TỔNG HỢP VĂN BẢN THEO ĐÚNG FORMAT MẪU CHUẨN
    const markdown = `${directOpening}

---

### ✦ Phần 1: Phân tích từng lá bài bám sát ngữ cảnh câu hỏi

- **${c1.nameVi} (${c1.isRev ? 'Ngược' : 'Xuôi'})** — *${c1.posName}*:
  ${cardAnalysis1}

- **${c2.nameVi} (${c2.isRev ? 'Ngược' : 'Xuôi'})** — *${c2.posName}*:
  ${cardAnalysis2}

- **${c3.nameVi} (${c3.isRev ? 'Ngược' : 'Xuôi'})** — *${c3.posName}*:
  ${cardAnalysis3}

---

### ✦ Phần 2: Ghép cả 3 lá (Tổng hợp dòng chảy năng lượng)

> **Thông điệp cô đọng:** “${condensedMessage}”

- **Nguyên nhân gốc rễ:** ${flowCause}
- **Thực trạng hiện tại:** ${flowState}
- **Xu hướng tiến triển:** ${flowTrend}

---

### ✦ Phần 3: Lời khuyên hành động thực tế (Guidance)

1. ${advice1}
2. ${advice2}`;

    return markdown;
}

// Test với câu hỏi người dùng đưa ra
console.log("================ TEST 1: CÓ QUAY LẠI ĐƯỢC KHÔNG? ================");
const testCards1 = [
    { data: bookData['major-16'] || bookData[16], isReversed: false }, // Tower
    { data: bookData['major-8'] || bookData[8], isReversed: true },   // Strength rev
    { data: bookData['major-17'] || bookData[17], isReversed: false }  // Star
];
console.log(generateMasterTarotInterpretation("Em và người yêu cũ có quay lại được không ạ?", testCards1));

console.log("\n================ TEST 2: SẾP TOXIC NGHỈ VIỆC KHÔNG? ================");
console.log(generateMasterTarotInterpretation("Mình có nên nghỉ việc không vì sếp toxic quá?", testCards1));
