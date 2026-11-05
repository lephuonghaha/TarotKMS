/**
 * interpretationEngine.js
 * Bộ máy luận giải Tarot chuyên sâu:
 * 1. Quy tắc xưng hô: Tuyệt đối "mình" - "bạn", điềm tĩnh, từng trải, chân thành, phân tích tâm lý thực tế.
 * 2. Direct Answer First: Mở đầu bằng câu chốt trực tiếp định hướng cho câu hỏi của người hỏi.
 * 3. Cấu trúc chuẩn 3 phần:
 *    - Phần 1: Phân tích từng lá bài bám sát ngữ cảnh câu hỏi (tâm lý, hành vi, năng lượng).
 *    - Phần 2: Ghép cả 3 lá (Thông điệp cô đọng + Nguyên nhân gốc rễ, Thực trạng hiện tại, Xu hướng tiến triển).
 *    - Phần 3: Lời khuyên hành động thực tế (1-2 lời khuyên cụ thể, sâu sắc).
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TarotInterpretationEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    /**
     * BỘ MÁY LUẬN GIẢI OFFLINE ĐỒNG HÀNH CHUYÊN SÂU
     */
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
            const d = c.data || c;
            const isRev = !!c.isReversed;
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
                warningCards.push({ name: d.nameVi || d.nameEn, isRev, d });
            }

            let contextualMeaning = "";
            if (theme === "love" && d.love) contextualMeaning = isRev ? d.love.reversed : d.love.upright;
            else if (theme === "work" && d.work) contextualMeaning = isRev ? d.work.reversed : d.work.upright;
            else if (theme === "finance" && d.finance) contextualMeaning = isRev ? d.finance.reversed : d.finance.upright;
            else if (theme === "exam" && d.study) contextualMeaning = isRev ? d.study.reversed : d.study.upright;
            else {
                const m = d.meanings || {};
                contextualMeaning = isRev ? (m.reversed || d.reversed || d.meaningVi) : (m.upright || d.upright || d.meaningVi);
            }

            return {
                d,
                posName: ["Căn nguyên / Nền tảng", "Thực trạng / Nút thắt", "Xu hướng / Chuyển hóa"][i] || `Vị trí ${i + 1}`,
                nameVi: d.nameVi || d.nameEn,
                nameEn: d.nameEn || "",
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

        // 7. TỔNG HỢP TRI THỨC 3 NGUỒN (TAROT CHÚ GIẢI • HÀNH TRÌNH TAROT • PHILIPPE NGÔ)
        function evalYesNo(cardData, isRev) {
            const raw = (cardData.yes_no_result || 'MAYBE').toUpperCase();
            if (!isRev) return raw;
            if (raw === 'YES') return 'MAYBE';
            if (raw === 'NO') return 'MAYBE';
            return 'MAYBE';
        }

        const c1YesNo = evalYesNo(c1.d, c1.isRev);
        const c2YesNo = evalYesNo(c2.d, c2.isRev);
        const c3YesNo = evalYesNo(c3.d, c3.isRev);

        let yesScore = 0;
        let noScore = 0;
        [ { res: c1YesNo, w: 1 }, { res: c2YesNo, w: 1.5 }, { res: c3YesNo, w: 2 } ].forEach(item => {
            if (item.res === 'YES') yesScore += item.w;
            else if (item.res === 'NO') noScore += item.w;
            else { yesScore += item.w * 0.4; noScore += item.w * 0.4; }
        });

        let finalVerdict = "MAYBE";
        let finalVerdictReason = "";
        if (c3YesNo === 'NO' || noScore >= 2.5) {
            finalVerdict = "NO (Khuyên dừng lại / Chuyển hướng)";
            finalVerdictReason = `Lá bài tương lai (${c3.nameVi}) mang năng lượng cảnh báo: "${c3.d.yes_no_reason || 'chưa phải thời điểm thích hợp'}". Việc cố gượng ép lúc này chỉ tích tụ thêm áp lực; vũ trụ khuyên bạn nên lùi lại để bảo toàn năng lượng và tái định hướng.`;
        } else if (yesScore >= 2.8 && c3YesNo !== 'NO') {
            finalVerdict = "YES (Khẳng định thuận lợi)";
            finalVerdictReason = `Sự cộng hưởng tích cực từ dòng chảy năng lượng, đặc biệt là hướng chuyển hóa của ${c3.nameVi}: "${c3.d.yes_no_reason || 'mọi sự đã sẵn sàng'}". Bạn có thể tự tin chủ động dấn bước.`;
        } else {
            finalVerdict = "MAYBE (Cần cân nhắc / Tùy thuộc vào sự chuyển hóa tâm thức)";
            finalVerdictReason = `Kết quả đang ở thế ngã ba đường với thử thách ở ${c2.nameVi}: "${c2.d.yes_no_reason || 'cần quan sát thêm'}". Tình thế sẽ chuyển biến sáng tỏ khi bạn thấu suốt nguyên nhân gốc rễ thay vì nóng vội ép buộc kết quả.`;
        }

        // MỐC THỜI GIAN THEO NGUYÊN LÝ PHILIPPE NGÔ
        const futureElement = c3.d.suitElement || c3.d.element || 'None';
        let elementTimingPrinciple = "";
        if (futureElement === 'Lửa') {
            elementTimingPrinciple = "Nguyên tố Lửa (Gậy/Wands): Sự việc bùng phát nhanh, tính theo NGÀY hoặc đạt đỉnh vào MÙA XUÂN (Bạch Dương, Sư Tử, Nhân Mã).";
        } else if (futureElement === 'Nước') {
            elementTimingPrinciple = "Nguyên tố Nước (Cốc/Cups): Diễn tiến theo dòng cảm xúc, tính theo THÁNG hoặc thuận lợi vào MÙA HÈ (Cự Giải, Bọ Cạp, Song Ngư).";
        } else if (futureElement === 'Khí') {
            elementTimingPrinciple = "Nguyên tố Khí (Kiếm/Swords): Biến chuyển tư duy và quyết định dứt khoát, tính theo TUẦN hoặc cao điểm vào MÙA THU (Thiên Bình, Bảo Bình, Song Tử).";
        } else if (futureElement === 'Đất') {
            elementTimingPrinciple = "Nguyên tố Đất (Tiền/Pentacles): Thành quả tích lũy bền vững, tính theo NĂM hoặc đơm hoa kết trái vào MÙA ĐÔNG (Ma Kết, Kim Ngưu, Xử Nữ).";
        } else {
            elementTimingPrinciple = "Bộ Ẩn Chính (Major Arcana): Mốc thời gian vận hành theo chu kỳ chiêm tinh lớn và bước ngoặt số mệnh định sẵn.";
        }

        const headlineTiming = c3.d.time_prediction || c2.d.time_prediction || "Khoảng 1 - 3 tháng tới khi tâm thế sẵn sàng.";

        // TỔNG HỢP THEO FORMAT TẬP TRUNG 100% VÀO CÂU HỎI NGƯỜI DÙNG
        return `${directOpening}

---

### ✦ 1. CÂU TRẢ LỜI TRỰC DIỆN CHO VẤN ĐỀ CỦA BẠN
- **Định hướng cốt lõi:** **${finalVerdict}**
- **Thông điệp thức tỉnh:** *“${condensedMessage}”*
- **Dự báo mốc chuyển biến (Philippe Ngô):** ⏳ **${headlineTiming}**

---

### ✦ 2. PHÂN TÍCH CHUYÊN SÂU THEO CÂU HỎI CỦA BẠN (SOI CHIẾU TRI THỨC SÁCH)
- **Nguồn cơn gốc rễ:** ${cardAnalysis1} ${flowCause}
- **Thực trạng & Nút thắt tâm lý hiện tại:** ${cardAnalysis2} ${flowState}
- **Rào cản & Sự giằng xé:** ${c2.d.yes_no_reason ? `Điểm mù lớn nhất lúc này là: ${c2.d.yes_no_reason.toLowerCase()}` : 'Cần đặc biệt tỉnh táo trước những áp lực dồn nén từ hoàn cảnh xung quanh.'}

---

### ✦ 3. XU HƯỚNG DIỄN TIẾN & DỰ BÁO THỜI GIAN
- **Hướng biến chuyển tương lai:** ${cardAnalysis3} ${flowTrend}
- **Mốc thời gian dự đoán (Philippe Ngô):** ⏳ **${headlineTiming}** — *${elementTimingPrinciple}*

---

### ✦ 4. LỜI KHUYÊN HÀNH ĐỘNG CHIẾN LƯỢC CHO BẠN
1. ${advice1}
2. ${advice2}`;
    }

    /**
     * TẠO SYSTEM PROMPT VÀ USER PROMPT CHO GEMINI AI
     */
    function getGeminiSystemPrompt() {
        return `Bạn là một chuyên gia tư vấn Tarot và tâm lý học thực chiến, sâu sắc, từng trải và đầy thấu cảm.
Người dùng tìm đến bạn để được giải đáp trực tiếp cho HOÀN CẢNH CỤ THỂ trong câu hỏi của họ, TUYỆT ĐỐI KHÔNG PHẢI ĐỂ NGHE LÝ THUYẾT Ý NGHĨA LÁ BÀI.

## NGUYÊN TẮC CỐT TỬ (BẮT BUỘC TUÂN THỦ 100%):
1. **XOÁY SÂU 100% VÀO TÌNH TIẾT CỤ THỂ TRONG CÂU HỎI CỦA NGƯỜI DÙNG:**
   - Phải đọc kỹ từng chữ trong câu hỏi của người dùng: Họ đang hỏi về ai? Mối quan hệ/công việc/vấn đề đó đang ở giai đoạn nào (ví dụ: yêu nhau mấy năm, đang cãi vã, chiến tranh lạnh, người cũ, hay áp lực công việc/tài chính cụ thể ra sao)?
   - **MỌI ĐOẠN VĂN, MỌI Ý PHÂN TÍCH VÀ LỜI KHUYÊN** đều phải gắn chặt trực tiếp với tình huống, con người và hoàn cảnh cụ thể trong câu hỏi đó.
2. **CẤM TUYỆT ĐỐI TRẢ LỜI THEO LÝ THUYẾT LÁ BÀI CHUNG CHUNG:**
   - Tuyệt đối KHÔNG viết kiểu: "Lá bài X đại diện cho...", "Năng lượng của lá Y cho thấy sự khởi đầu...", hay chép lại định nghĩa sách vở của lá bài.
   - Hãy chuyển hóa hoàn toàn năng lượng của 3 lá bài thành **phân tích tâm lý, động cơ, hành vi của người hỏi và đối phương/hoàn cảnh thực tế** trong câu hỏi.
3. **XƯNG HÔ & TRÌNH BÀY:**
   - Luôn xưng "mình" và gọi người hỏi là "bạn" (thân tình, điềm đạm, sắc sảo, đi thẳng vào bản chất).
   - Tuyệt đối không nhắc đến tên "Gemini", "AI", "trí tuệ nhân tạo" hay cụm từ "đồng hành và trò chuyện".
   - Bắt buộc viết trọn vẹn, đầy đủ và chi tiết cả 4 phần từ đầu đến dấu chấm câu cuối cùng, không bao giờ ngắt ngang câu.

## CẤU TRÚC BÀI LUẬN GIẢI (MARKDOWN):

[Mở đầu bằng 2-3 câu đi thẳng vào câu chuyện cụ thể trong câu hỏi của người dùng và đưa ra nhận định cốt lõi ngay lập tức]

---

### ✦ 1. CÂU TRẢ LỜI TRỰC DIỆN CHO VẤN ĐỀ CỦA BẠN
- **Định hướng cốt lõi:** **[Khẳng định rõ ràng, trực diện cho câu hỏi của người dùng: Nên/Không nên, Có cơ hội hay không, Khả năng diễn tiến thế nào]**
- **Thông điệp thức tỉnh:** *[1 câu đúc kết sắc bén chạm đúng điểm mù tâm lý trong câu chuyện của người hỏi]*

---

### ✦ 2. GIẢI MÃ SÂU CÂU CHUYỆN & TÂM LÝ TRONG HOÀN CẢNH CỦA BẠN
- **Nguồn cơn gốc rễ của vấn đề:** [Phân tích sâu tại sao câu chuyện của người hỏi lại đi đến bước này; chỉ rõ tâm lý, kỳ vọng hoặc vết xước ngầm giữa những người trong cuộc].
- **Thực trạng & Nút thắt hiện tại:** [Mổ xẻ thẳng thắn điều gì đang thực sự diễn ra ngay lúc này trong câu hỏi của bạn: suy nghĩ thật sự của bạn, thái độ/tâm lý thật sự của đối phương hoặc áp lực thực tế đang đè nặng là gì].
- **Điểm mù cần nhìn thẳng:** [Điều mà người hỏi đang tự dối lòng, sợ hãi hoặc chưa nhìn thấu trong tình huống này].

---

### ✦ 3. XU HƯỚNG DIỄN TIẾN & DỰ BÁO THỜI GIAN
- **Nếu bạn vẫn giữ cách phản ứng/tâm lý hiện tại:** [Dự báo cụ thể diễn biến tiếp theo của câu chuyện sẽ đi về đâu].
- **Nếu bạn chủ động thay đổi chiến lược:** [Bước ngoặt thực tế nào sẽ mở ra cho vấn đề của bạn].
- **Dự báo mốc chuyển biến (Philippe Ngô):** ⏳ **[Mốc thời gian cụ thể gắn với diễn biến câu chuyện của người hỏi]**

---

### ✦ 4. LỜI KHUYÊN HÀNH ĐỘNG CHIẾN LƯỢC DÀNH RIÊNG CHO BẠN
1. **Ứng xử & Quản trị tâm lý ngay lúc này:** [Cách xử lý cảm xúc, thái độ và ranh giới cụ thể cho đúng tình huống trong câu hỏi, có thể kèm gợi ý câu nói/cách phản ứng thực tế].
2. **Kế hoạch hành động cụ thể:** [2 bước hành động thực tế, rõ ràng, sát sườn nhất để tháo gỡ đúng nút thắt mà người dùng đang hỏi].`;
    }

    /**
     * GỌI API LUẬN GIẢI STREAMING VỚI GEMINI 3.8 FLASH (THINKING_LEVEL = LOW GIÚP TỐC ĐỘ NHANH GẤP 3 LẦN MÀ VẪN SÂU SẮC)
     */
    async function streamSingleModel(model, apiKey, systemPrompt, userPromptText, onChunk) {
        const genConfig = {
            maxOutputTokens: 16384
        };
        // Với dòng Gemini 3.x (gemini-3.8-flash, gemini-3.6-flash...), dùng thinkingLevel: "LOW"
        // để giảm 70% thời gian chờ suy nghĩ ngầm (từ medium xuống low) nhưng vẫn phân tích cực chuẩn câu hỏi!
        if (model.startsWith('gemini-3')) {
            genConfig.thinkingConfig = { thinkingLevel: "LOW" };
        } else if (model.includes('2.5-flash')) {
            genConfig.thinkingConfig = { thinkingBudget: 256 };
        }

        const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        let response = await fetch(streamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userPromptText }] }],
                generationConfig: genConfig
            })
        });

        // Nếu model không tương thích tham số thinkingConfig thì gọi lại ngay không có thinkingConfig
        if (response.status === 400 && genConfig.thinkingConfig) {
            delete genConfig.thinkingConfig;
            response = await fetch(streamUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: "user", parts: [{ text: userPromptText }] }],
                    generationConfig: genConfig
                })
            });
        }

        if (!response.ok) {
            throw new Error(`Model ${model} HTTP ${response.status}`);
        }

        if (response.body && typeof response.body.getReader === 'function') {
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let fullText = '';

            const processLine = (line) => {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) return;
                const dataStr = trimmed.slice(5).trim();
                if (!dataStr || dataStr === '[DONE]') return;
                try {
                    const chunkObj = JSON.parse(dataStr);
                    const parts = chunkObj.candidates?.[0]?.content?.parts || [];
                    const chunkText = parts
                        .filter(p => !p.thought && typeof p.text === 'string')
                        .map(p => p.text)
                        .join('');
                    if (chunkText) {
                        fullText += chunkText;
                        if (onChunk) onChunk(fullText);
                    }
                } catch (_) {}
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (buffer.trim()) {
                        buffer.split(/\r?\n/).forEach(processLine);
                    }
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop() || '';
                for (const line of lines) {
                    processLine(line);
                }
            }

            if (fullText.trim().length > 0) {
                return fullText;
            }
        }

        // Fallback nếu môi trường không hỗ trợ ReadableStream
        const resData = await response.json();
        const parts = resData.candidates?.[0]?.content?.parts || [];
        const text = parts
            .filter(p => !p.thought && typeof p.text === 'string')
            .map(p => p.text)
            .join('');
        if (text && text.trim().length > 0) {
            if (onChunk) onChunk(text);
            return text;
        }
        throw new Error(`Model ${model} returned empty response`);
    }

    async function requestGeminiInterpretation(apiKey, question, cards, preferredModel, onStreamChunk) {
        const cardsDetails = cards.map((c, i) => {
            const pos = ["Gốc rễ / Quá khứ", "Thực trạng / Nút thắt hiện tại", "Xu hướng tương lai / Chuyển hóa"][i];
            const d = c.data || c;
            const isRev = Boolean(c.isReversed);
            const m = d.meanings || {};
            const baseMeaning = isRev ? (m.reversed || d.reversed || d.meaningVi) : (m.upright || d.upright || d.meaningVi);
            const keywords = Array.isArray(d.keywords) ? d.keywords.join(', ') : (d.keywords || '');

            return `- [${pos}]: ${d.nameVi || d.nameEn} (${isRev ? 'Chiều Ngược' : 'Chiều Xuôi'}, Nguyên tố ${d.suitElement || d.element || 'Ẩn Chính'})
  + Tín hiệu tâm lý & tình huống: ${baseMeaning || ''} (Từ khóa: ${keywords})
  + Xu hướng Yes/No: ${d.yes_no_result || ''} (${d.yes_no_reason || ''}) | Khung thời gian Philippe Ngô: ${d.time_prediction || ''}`;
        }).join('\n');

        const systemPrompt = getGeminiSystemPrompt();
        const userPromptText = `CÂU CHUYỆN & CÂU HỎI CỤ THỂ CỦA NGƯỜI DÙNG (TRỌNG TÂM DUY NHẤT CẦN GIẢI ĐÁP):
"${question}"

TÍN HIỆU NĂNG LƯỢNG TỪ 3 LÁ BÀI (CHỈ DÙNG LÀM LĂNG KÍNH NGẦM ĐỂ PHÂN TÍCH CÂU HỎI TRÊN, TUYỆT ĐỐI KHÔNG GIẢI THUYẾT LÝ THUYẾT LÁ BÀI):
${cardsDetails}

YÊU CẦU BẮT BUỘC:
1. KHÔNG viết lý thuyết lá bài chung chung. Hãy đọc kỹ từng chi tiết trong câu hỏi "${question}" và phân tích trực tiếp vào hoàn cảnh thực tế đó (ví dụ: nếu người hỏi đang độc thân và chưa để ý ai thì tuyệt đối không nói về người yêu cũ hay đối phương đang giận dỗi, mà phải phân tích thẳng vào trạng thái độc thân, tâm lý đóng/mở lòng và khả năng xuất hiện nhân duyên mới trong 2 tháng tới).
2. Mọi phần (từ Câu trả lời trực diện, Giải mã sâu câu chuyện, Xu hướng diễn tiến cho tới Lời khuyên hành động) đều phải nói thẳng vào bài toán thực tế của người hỏi với chiều sâu tâm lý sắc sảo nhất.
3. Viết đầy đủ trọn vẹn cả 4 phần đến hết câu cuối cùng.`;

        // Luôn ưu tiên gemini-3.5-flash theo yêu cầu
        let cleanPreferred = (preferredModel || '').trim();
        if (!cleanPreferred || cleanPreferred !== 'gemini-3.5-flash') {
            cleanPreferred = 'gemini-3.5-flash';
        }

        const candidateModels = [...new Set([cleanPreferred, 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-2.5-flash'])];
        let lastErr = null;

        for (const model of candidateModels) {
            try {
                return await streamSingleModel(model, apiKey, systemPrompt, userPromptText, onStreamChunk);
            } catch (err) {
                console.warn(`Model ${model} gặp lỗi, chuyển sang model dự phòng:`, err.message);
                lastErr = err;
            }
        }

        throw lastErr || new Error("Không thể kết nối API. Vui lòng kiểm tra lại API Key hoặc mạng internet.");
    }

    return {
        generateMasterTarotInterpretation,
        getGeminiSystemPrompt,
        requestGeminiInterpretation
    };
}));
