const fs = require('fs');
const bookData = JSON.parse(fs.readFileSync('./tarot_book.json', 'utf8'));

function testGenerateReadingV2(question, cards) {
    const rawQuestion = (question || "").trim() || "Điều gì đang chờ đợi mình phía trước?";
    const q = rawQuestion.toLowerCase();

    // 1. Nhận diện các chi tiết thực tế trong câu chuyện của user
    const hasBoss = /(sếp|quản lý|trưởng phòng|leader)/.test(q);
    const isToxic = /(toxic|độc hại|chèn ép|áp bức|bắt nạt|ngột ngạt|bất công)/.test(q);
    const isExhausted = /(mệt|áp lực|kiệt sức|quá tải|chán nản|stress|bế tắc|rệu rã)/.test(q) || isToxic;
    const isQuitJob = /(nghỉ việc|đổi việc|thôi việc|nhảy việc|bỏ việc|rút lui)/.test(q);
    const isColdLove = /(lạnh nhạt|vô tâm|xa cách|im lặng|không nhắn tin|hờ hững|né tránh)/.test(q);
    const isExLove = /(người cũ|quay lại|chia tay|dứt khoát|chia tay rồi|tổn thương cũ)/.test(q);
    const isDoubtLove = /(còn yêu|còn thương|thương mình không|nghĩ gì về mình|có tương lai|thật lòng)/.test(q);
    const isFinanceWorry = /(tiền|nợ|thua lỗ|đầu tư|lời lỗ|kinh tế|cháy túi|chứng khoán|đất)/.test(q);
    const isExamWorry = /(học|thi|kỳ thi|điểm|đỗ|trượt|tốt nghiệp|bằng cấp)/.test(q);
    const isCrossroad = /(nên|hay không|chọn|phân vân|lựa chọn|ở lại hay đi|đi hay ở|có đáng)/.test(q);

    let topic = "general";
    if (isColdLove || isExLove || isDoubtLove || /(yêu|tình|crush|người ấy|hẹn hò|kết hôn|chồng|vợ)/.test(q)) {
        topic = "love";
    } else if (hasBoss || isToxic || isQuitJob || /(việc|công ty|nghề|dự án|đồng nghiệp|sự nghiệp|lương)/.test(q)) {
        topic = "work";
    } else if (isFinanceWorry) {
        topic = "finance";
    } else if (isExamWorry) {
        topic = "study";
    }

    // Xác định đối tượng/chi tiết cụ thể của câu chuyện để lồng ghép vào từng lá bài
    let storySubject = "";
    if (topic === "work") {
        if (hasBoss && isToxic) storySubject = "cái môi trường độc hại và người quản lý đang tạo áp lực lên bạn";
        else if (isQuitJob) storySubject = "quyết định buông bỏ công việc này để tìm lối thoát cho bản thân";
        else if (isToxic) storySubject = "bầu không khí ngột ngạt và sự chèn ép mà bạn đang phải chịu đựng mỗi ngày";
        else storySubject = "công việc và định hướng sự nghiệp hiện tại";
    } else if (topic === "love") {
        if (isColdLove) storySubject = "sự lạnh nhạt và khoảng cách im lặng đang lớn dần giữa hai người";
        else if (isExLove) storySubject = "những vương vấn và vết thương chưa lành với người cũ";
        else if (isDoubtLove) storySubject = "sự bất an về tình cảm thực sự mà người ấy dành cho bạn";
        else storySubject = "chuyện tình cảm và sự gắn kết giữa hai người";
    } else if (topic === "finance") {
        storySubject = "áp lực tài chính và những toan tính tiền bạc đang làm bạn bận lòng";
    } else if (topic === "study") {
        storySubject = "kỳ thi và áp lực kết quả đang đè nặng lên vai";
    } else {
        storySubject = "nút thắt ngổn ngang mà bạn đang một mình đối diện";
    }

    // 2. Mở đầu: Một câu ngắn phản chiếu lại điều mình cảm nhận được từ câu chuyện user (thực sự lắng nghe)
    let opening = "";
    if (hasBoss && isToxic) {
        opening = `Đọc câu chuyện bạn vừa kể về *"**${rawQuestion}**"*, mình cảm nhận được sự ngột ngạt và cảm giác bị đè nén mà bạn đã phải gắng gượng chịu đựng suốt một thời gian dài.`;
    } else if (isExhausted) {
        opening = `Nghe bạn chia sẻ về *"**${rawQuestion}**"*, mình cảm thấy bạn đang thực sự kiệt sức — không chỉ là mệt mỏi về thể xác, mà là một sự bào mòn năng lượng từ bên trong.`;
    } else if (isColdLove || isDoubtLove) {
        opening = `Đọc dòng tâm sự *"**${rawQuestion}**"* của bạn, mình cảm nhận được một nỗi chông chênh rất rõ — nơi bạn vừa muốn tìm kiếm một câu trả lời dứt khoát, nhưng trong lòng vẫn còn đầy những bất an khó tỏ bày.`;
    } else if (isCrossroad) {
        opening = `Lắng nghe câu hỏi *"**${rawQuestion}**"* của bạn, mình thấy bạn đang đứng trước một ngã rẽ mà bên nào dường như cũng mang theo những đắn đo và cả nỗi sợ rằng mình sẽ chọn sai.`;
    } else {
        opening = `Lắng nghe điều bạn gửi gắm qua *"**${rawQuestion}**"*, mình cảm nhận được bạn đang tìm kiếm một khoảng lặng để nhìn rõ hơn điều gì đang thực sự diễn ra bên dưới những trăn trở lúc này.`;
    }

    // 3. Trích xuất dữ liệu chi tiết của 3 lá bài
    function extractCardDetails(c) {
        const d = c.data;
        const isRev = c.isReversed;
        let meaning = "";
        if (topic === "love" && d.love) {
            meaning = isRev ? d.love.reversed : d.love.upright;
        } else if (topic === "work" && d.work) {
            meaning = isRev ? d.work.reversed : d.work.upright;
        } else if (topic === "finance" && d.finance) {
            meaning = isRev ? d.finance.reversed : d.finance.upright;
        } else if (topic === "study" && d.study) {
            meaning = isRev ? d.study.reversed : d.study.upright;
        } else {
            meaning = isRev ? (d.reversed || d.upright) : d.upright;
        }
        return {
            id: d.id,
            name: d.nameVi,
            nameEn: d.nameEn,
            isRev,
            meaning: (meaning || "").replace(/\.$/, ''),
            keywords: (d.keywords || []).slice(0, 2).join(', '),
            element: d.element || 'Hài hòa'
        };
    }

    const [c1, c2, c3] = cards.map(extractCardDetails);

    // Diễn giải từng lá bài gắn trực tiếp với bối cảnh câu chuyện cụ thể (Principle 2)
    function interpretCardInContext(c, position) {
        // Handle special iconic cards if applicable
        if (c.id === 'major-16') { // The Tower
            if (topic === "work" && isToxic) {
                return `lá **${c.name}** không nói về lý thuyết xa xôi, mà đang nói thẳng vào ${storySubject}: nó không bền đâu — kiểu gì cũng sẽ vỡ, vấn đề là bạn chọn chủ động buông trước để giữ lấy chính mình hay cứ tiếp tục để nó kéo bạn kiệt sức theo`;
            }
            return `lá **${c.name}** đang chỉ thẳng vào sự đổ vỡ của những ảo tưởng hay một cấu trúc vốn đã quá rạn nứt: sự việc này sớm muộn gì cũng phải đi đến điểm kết thúc để dọn chỗ cho điều mới mẻ hơn`;
        }
        if (c.id === 'major-18') { // The Moon
            if (c.isRev) return `lá **${c.name} (ngược)** cho thấy màn sương mù và những nỗi hoang mang vô căn cứ xung quanh ${storySubject} đang dần tan bớt, sự thật trần trụi đang lộ diện để bạn không còn tự lừa dối mình nữa`;
            return `lá **${c.name}** phản chiếu chính nỗi sợ mơ hồ và sự suy diễn đang bủa vây lấy bạn quanh ${storySubject}: nhiều khi điều làm bạn đau khổ nhất không phải là thực tế, mà là những kịch bản đen tối do tâm trí bạn tự vẽ ra`;
        }
        if (c.id === 'major-15') { // The Devil
            if (c.isRev) return `lá **${c.name} (ngược)** là tín hiệu rằng bạn đã bắt đầu nhận ra sợi xích vô hình đang trói buộc mình vào ${storySubject} và bạn đã có đủ nhận thức để tháo gỡ nó`;
            return `lá **${c.name}** chỉ rõ sự ràng buộc độc hại hay cảm giác phụ thuộc vào ${storySubject}: bạn cảm thấy như mình bị mắc kẹt, nhưng thực ra chìa khóa thoát ra luôn nằm trong tay bạn`;
        }
        if (c.id === 'major-17') { // The Star
            return `lá **${c.name}** mang đến một làn gió tươi mát của sự chữa lành và niềm tin mới: một khi bạn dám đặt ${storySubject} lại phía sau, một không gian bình yên và những cơ hội tốt đẹp hơn sẽ lập tức xuất hiện`;
        }
        if (c.id === 'major-0') { // The Fool
            return `lá **${c.name}** khuyên bạn hãy can đảm bước một bước đi mới, rũ bỏ hết gánh nặng của ${storySubject} để làm lại từ đầu với một tâm thế nhẹ bẫng và tự do`;
        }

        // Generic contextualizer for all other cards
        const m = c.meaning.toLowerCase();
        if (position === 1) {
            if (c.isRev) {
                return `lá **${c.name} (ở chiều ngược)** hé lộ rằng ngay từ cội nguồn, đối với ${storySubject}, dường như đã có những điểm nghẽn hoặc những gượng ép (${m}) mà bạn từng cố nhắm mắt bỏ qua với hy vọng mọi thứ sẽ tự ổn hơn`;
            } else {
                return `lá **${c.name} (chiều xuôi)** cho thấy bạn từng bước vào ${storySubject} với rất nhiều thiện chí và sự chân thành (${m}), chính vì đã từng dốc lòng như vậy nên bây giờ bạn mới cảm thấy trăn trở và khó buông đến thế`;
            }
        } else if (position === 2) {
            if (c.isRev) {
                return `lá **${c.name} (ở chiều ngược)** chạm thẳng vào điểm mù lớn nhất lúc này: ${m}. Nó cho thấy bạn đang tự làm khó mình khi cố gồng gánh một trách nhiệm vượt quá giới hạn của bản thân`;
            } else {
                return `lá **${c.name} (chiều xuôi)** phản chiếu trực diện thực trạng bạn đang phải đối diện quanh ${storySubject}: ${m}. Đây là lúc bạn không thể tiếp tục dùng sự im lặng hay cam chịu để giải quyết vấn đề được nữa`;
            }
        } else {
            if (c.isRev) {
                return `lá **${c.name} (ở chiều ngược)** chỉ ra rằng lối thoát không nằm ở việc cố làm hài lòng hoàn cảnh, mà nằm ở việc bạn tháo gỡ sự dằn vặt bên trong: ${m}. Hãy cho phép mình buông tay những thứ không thuộc về quyền kiểm soát của bạn`;
            } else {
                return `lá **${c.name} (chiều xuôi)** mang lại tín hiệu mở ra một cánh cửa mới đầy tích cực: ${m}. Khi bạn dám đặt ra ranh giới rõ ràng cho mình, năng lượng tích cực và sự tự chủ sẽ quay trở lại`;
            }
        }
    }

    // 4. Kết nối 3 lá thành MỘT dòng chảy liền mạch (Principle 3, 4, 5)
    const p1 = `Khi nhìn lại hành trình đã đưa bạn đến tình thế hiện tại, ${interpretCardInContext(c1, 1)}. Bạn đã kiên nhẫn chịu đựng và hy sinh khá nhiều, nhưng việc cứ tiếp tục nén cảm xúc xuống dường như đang làm cái giá bạn phải trả ngày một đắt hơn.`;

    const p2 = `Chính sự dồn nén âm ỉ ấy dẫn thẳng đến nút thắt ở hiện tại, nơi ${interpretCardInContext(c2, 2)}. Có phải đôi khi bạn tự hỏi, liệu mình cố thêm một chút nữa thì mọi chuyện có đổi khác không? Nhưng lá bài này đang hỏi ngược lại bạn: bạn định đổi thêm bao nhiêu sự bình yên nữa cho một nơi không hề biết trân trọng bạn?`;

    const p3 = `Và khi bạn dám đối diện thẳng thắn với câu hỏi đó mà không còn tự dối lòng, dòng chảy tương lai sẽ dịch chuyển qua ${interpretCardInContext(c3, 3)}. Tarot không phải là một bản án phán quyết số phận, mà là chiếc gương để bạn nhìn thấy sức mạnh tự quyết của chính mình: bạn luôn có quyền chọn dừng lại để bảo vệ bản thân.`;

    const storyBody = `${p1}\n\n${p2}\n\n${p3}`;

    // 5. Kết: 1 câu hỏi gợi mở + 1-2 gợi ý hành động cụ thể, thiết thực
    let reflectiveQuestion = "";
    let actionItems = [];

    if (topic === "work") {
        if (hasBoss && isToxic) {
            reflectiveQuestion = "Nếu ngày mai bạn không còn phải bước chân vào văn phòng đó nữa, cảm xúc đầu tiên xuất hiện trong lồng ngực bạn là gì — sự tiếc nuối, hay là một tiếng thở phào nhẹ nhõm?";
            actionItems = [
                "**Đặt lại ranh giới tâm lý ngay hôm nay:** Chỉ làm đúng phần việc trong phạm vi trách nhiệm, chấm dứt việc ôm đồm hay nhận sự cáu bẳn vô cớ từ sếp vào người; khi hết giờ làm, tắt thông báo công việc để cơ thể được nghỉ ngơi.",
                "**Chuẩn bị đường lui trong thầm lặng:** Dành tối nay cập nhật lại CV, liên hệ kín với 1-2 người bạn trong nghề hoặc nộp hồ sơ vào vài vị trí mới; khi bạn biết mình có lựa chọn khác, sự uy hiếp của môi trường cũ sẽ không còn làm bạn sợ hãi nữa."
            ];
        } else if (isQuitJob) {
            reflectiveQuestion = "Bạn đang ngần ngại rời đi vì nơi đó còn cơ hội thực sự cho bạn phát triển, hay bạn chỉ đang sợ hãi cảm giác phải bắt đầu lại từ đầu ở một nơi xa lạ?";
            actionItems = [
                "**Tính toán quỹ sinh hoạt an toàn:** Tính xem số tiền tiết kiệm hiện tại đủ để bạn trang trải cuộc sống cơ bản trong bao nhiêu tháng (lý tưởng là 3 - 6 tháng) để ra quyết định một cách tự tin và chủ động.",
                "**Liệt kê 3 điều kiện tiên quyết cho công việc tiếp theo:** Viết rõ tiêu chí về văn hóa công ty, mức lương và cách quản lý mà bạn mong muốn để không vô tình bước chân vào một môi trường tương tự."
            ];
        } else {
            reflectiveQuestion = "Công việc này hiện tại đang là bàn đạp giúp bạn phát triển, hay chỉ là một thói quen an toàn đang giam hãm tiềm năng của bạn?";
            actionItems = [
                "**Tập trung vào 3 ưu tiên cốt lõi tuần này:** Xếp thứ tự việc quan trọng nhất và giải quyết dứt điểm từng việc, học cách nói lời từ chối khéo với các yêu cầu phát sinh ngoài lề.",
                "**Ghi chép lại những thành quả cá nhân:** Tạo một file riêng ghi lại các đóng góp của bạn để chuẩn bị cho buổi review lương hoặc làm giàu thêm hồ sơ nghề nghiệp của bản thân."
            ];
        }
    } else if (topic === "love") {
        if (isColdLove || isDoubtLove) {
            reflectiveQuestion = "Trong mối quan hệ này, bạn đang thực sự cảm nhận được tình yêu từ hành động thực tế của người ấy, hay bạn chỉ đang tự níu giữ những kỷ niệm đẹp đã qua trong quá khứ?";
            actionItems = [
                "**Cho bản thân 48 giờ lùi lại:** Tạm ngừng chủ động nhắn tin, ngừng kiểm tra trạng thái online hay suy đoán tâm lý đối phương; hãy dùng thời gian đó đi dạo, nghe nhạc hoặc ăn một món bạn thích.",
                "**Lắng nghe cơ thể khi ở cạnh họ:** Hãy để ý xem mỗi khi nhắn tin hay gặp gỡ người ấy, bạn cảm thấy bình an, ấm áp hay luôn thấp thỏm, hoang mang và bất an? Trực giác của cơ thể hiếm khi nói dối."
            ];
        } else if (isExLove) {
            reflectiveQuestion = "Bạn muốn người ấy quay lại vì còn yêu thương chân thành, hay chỉ vì bạn chưa quen với cảm giác một mình và sợ sự trống trải?";
            actionItems = [
                "**Cắt đứt thói quen theo dõi:** Tạm ẩn hoặc hủy theo dõi tài khoản của người cũ trong 14 ngày để tâm trí bạn có không gian thực sự hồi phục.",
                "**Viết ra giấy bức thư không gửi:** Trút hết tất cả ấm ức, tổn thương và lời xin lỗi ra một trang giấy rồi xé đi; đó là nghi thức tinh thần để bạn trả lại sự tự do cho chính mình."
            ];
        } else {
            reflectiveQuestion = "Điều gì bạn đang khao khát được sẻ chia cùng người ấy nhất lúc này nhưng vẫn còn ngập ngừng chưa dám mở lời?";
            actionItems = [
                "**Bắt đầu cuộc trò chuyện bằng cảm xúc của mình:** Hãy nói 'Mình cảm thấy...' thay vì dùng lời trách móc 'Tại sao anh/em...', điều này sẽ giúp cả hai không rơi vào thế phòng thủ.",
                "**Tạo một buổi hẹn chỉ có hai người:** Tắt điện thoại trong 1 tiếng và cùng nhau làm một việc giản dị để kết nối lại ánh mắt và cảm xúc."
            ];
        }
    } else if (topic === "finance") {
        reflectiveQuestion = "Quyết định tài chính này đến từ một phép tính cẩn trọng dài hạn, hay phần nhiều là sự sốt ruột và nỗi sợ bị bỏ lại phía sau?";
        actionItems = [
            "**Nguyên tắc hạ nhiệt 7 ngày:** Với bất kỳ khoản tiền đầu tư hoặc mua sắm lớn nào lúc này, hãy hoãn lại một tuần trước khi bấm nút xác nhận.",
            "**Rà soát và bịt các lỗ rò rỉ dòng tiền:** Liệt kê các chi phí cố định và tạm cắt bỏ những khoản đăng ký dịch vụ không còn sử dụng."
        ];
    } else {
        reflectiveQuestion = "Nếu biết chắc rằng mọi sự gãy đổ hay thay đổi lúc này đều đang dọn đường cho một phiên bản mạnh mẽ hơn của bạn, bạn sẽ chọn bước đi nào khiến bạn thấy nhẹ lòng nhất?";
        actionItems = [
            "**Viết ra 3 điều bạn có thể buông bỏ ngay tối nay:** Đó có thể là một cuộc tranh luận vô ích, một suy nghĩ tự trách mình, hoặc một kỳ vọng thái quá về người khác.",
            "**Làm một điều tử tế cho bản thân trong ngày mai:** Một giấc ngủ đủ, một bữa ăn ngon hoặc một buổi đi dạo không có điện thoại — bạn xứng đáng được chăm sóc trước tiên."
        ];
    }

    const actionsFormatted = actionItems.map(item => `- ${item}`).join('\n');

    return `${opening}

${storyBody}

---

**Một điều gợi mở để bạn cùng suy ngẫm:**
*${reflectiveQuestion}*

${actionsFormatted}`;
}

const testCards = [
    { data: bookData[16], isReversed: false }, // The Tower
    { data: bookData[8], isReversed: true },   // Strength reversed
    { data: bookData[17], isReversed: false }  // The Star
];

console.log("=== TEST CHUYÊN SÂU: CÔNG VIỆC SẾP TOXIC ===");
console.log(testGenerateReadingV2("Mình có nên nghỉ việc không? Môi trường công ty dạo này toxic quá, sếp hay ép việc và chèn ép nhân viên, mình thấy kiệt sức.", testCards));
