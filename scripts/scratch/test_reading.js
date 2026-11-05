const fs = require('fs');
const bookData = JSON.parse(fs.readFileSync('./tarot_book.json', 'utf8'));

function testGenerateReading(question, cards) {
    const rawQuestion = (question || "").trim() || "Điều gì đang chờ đợi mình phía trước?";
    const q = rawQuestion.toLowerCase();

    // 1. Phân loại bối cảnh & sắc thái câu chuyện của user
    let topic = "general";
    if (/(yêu|tình|người yêu|crush|chồng|vợ|bạn trai|bạn gái|chia tay|kết hôn|hẹn hò|quay lại|mập mờ|người cũ|tâm đầu|duyên|thương|nhớ|ly hôn)/.test(q)) {
        topic = "love";
    } else if (/(việc|công ty|sếp|nghề|thăng tiến|kinh doanh|dự án|hợp đồng|phỏng vấn|đổi việc|nghỉ việc|toxic|đồng nghiệp|khởi nghiệp|sự nghiệp|lương)/.test(q)) {
        topic = "work";
    } else if (/(tiền|tài chính|đầu tư|lời|lỗ|kinh tế|mua nhà|mua xe|nợ|giàu|tài lộc|thu nhập|vốn|chứng khoán|bất động sản)/.test(q)) {
        topic = "finance";
    } else if (/(học|thi|điểm|trường|du học|bằng cấp|đỗ|trượt|ôn thi|tốt nghiệp|nghiên cứu|luận văn)/.test(q)) {
        topic = "study";
    }

    const isExhausted = /(toxic|mệt|áp lực|chán|ngột ngạt|bế tắc|quá tải|kiệt sức|stress|chèn ép|tổn thương)/.test(q);
    const isCrossroad = /(nên|không|chọn|nghỉ hay|ở lại|đi hay ở|phân vân|lựa chọn|có đáng|bước tiếp)/.test(q);
    const isDoubtful = /(lo|sợ|bất an|thực sự|có yêu|còn thương|quay lại|quên|sao nữa)/.test(q);

    // 2. Mở đầu: Một câu ngắn phản chiếu cảm xúc (cho thấy mình thực sự lắng nghe)
    let openingReflection = "";
    if (isExhausted) {
        openingReflection = `Đọc câu chuyện bạn vừa kể về *"**${rawQuestion}**"*, mình cảm nhận được một sự ngột ngạt và mệt mỏi mà dường như bạn đã phải tự gồng gánh bấy lâu nay trong cô độc.`;
    } else if (isCrossroad) {
        openingReflection = `Lắng nghe câu hỏi *"**${rawQuestion}**"* của bạn, mình thấy bạn đang đứng trước một ngã rẽ mà bên nào dường như cũng mang theo những đắn đo và cả nỗi sợ rằng mình sẽ chọn sai.`;
    } else if (isDoubtful) {
        openingReflection = `Đọc dòng tâm sự *"**${rawQuestion}**"* của bạn, mình cảm thấy phảng phất một nỗi chênh vênh — nơi bạn vừa muốn tìm kiếm một câu trả lời dứt khoát, nhưng trong lòng vẫn còn những bất an chưa thể nhẹ nhõm buông xuống.`;
    } else if (topic === "love") {
        openingReflection = `Nghe bạn chia sẻ về chuyện *"**${rawQuestion}**"*, mình cảm nhận được những rung cảm và cả những trăn trở sâu lắng mà bạn đang cất giữ trong lòng.`;
    } else if (topic === "work") {
        openingReflection = `Đọc câu hỏi *"**${rawQuestion}**"* của bạn, mình hiểu rằng công việc lúc này không chỉ là chuyện kiếm sống, mà đang tác động trực tiếp đến sự an yên và năng lượng sống mỗi ngày của bạn.`;
    } else {
        openingReflection = `Lắng nghe câu chuyện bạn vừa gửi gắm qua *"**${rawQuestion}**"*, mình cảm nhận được bạn đang tìm kiếm một khoảng lặng để soi tỏ điều gì đang thực sự diễn ra bên dưới những ngổn ngang hiện tại.`;
    }

    // 3. Trích xuất khía cạnh liên quan của từng lá bài
    function getCardContext(cardObj) {
        const d = cardObj.data;
        const isRev = cardObj.isReversed;
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
        const kw = (d.keywords || []).slice(0, 2).join(', ');
        return {
            name: d.nameVi,
            isRev,
            meaning: (meaning || "").replace(/\.$/, ''),
            kw,
            advice: d.advice ? (isRev ? d.advice.reversed : d.advice.upright) : ""
        };
    }

    const [c1, c2, c3] = cards.map(getCardContext);

    // 4. Luận giải 3 lá theo MỘT mạch chuyện kết nối nhân quả/cảm xúc (KHÔNG dùng gạch đầu dòng)
    let storyBody = "";

    // Đoạn 1: Lá 1 - Cội nguồn / Căn nguyên dẫn đến trạng thái này
    let p1 = "";
    if (c1.isRev) {
        p1 = `Khi nhìn về cội nguồn của vấn đề, lá **${c1.name} (ở chiều ngược)** hé lộ rằng ngay từ đầu, dường như đã có những điểm nghẽn hoặc những gợn sóng ngầm mà bạn từng cố bỏ qua với hy vọng mọi thứ sẽ dần ổn thỏa. Đó có thể là ${c1.meaning.toLowerCase()}. Bạn đã cố gắng nhẫn nhịn và thích nghi, nhưng sự chệch nhịp ấy không tự biến mất mà dần tích tụ thành sự quá tải trong lòng bạn lúc này.`;
    } else {
        p1 = `Nhìn lại dòng chảy đã dẫn bạn đến tình thế hiện tại, lá **${c1.name} (chiều xuôi)** cho thấy bạn từng bước vào câu chuyện này với rất nhiều thiện chí và sự chân thành: ${c1.meaning.toLowerCase()}. Bạn đã từng đặt nhiều kỳ vọng vào hành trình này, và chính vì đã từng dốc lòng như thế, nên cảm giác hiện tại mới khiến bạn trăn trở và đau đáu nhiều đến vậy.`;
    }

    // Đoạn 2: Lá 2 - Nút thắt cốt lõi & Thực tế cần đối diện (tiếp nối trực tiếp từ đoạn 1)
    let p2 = "";
    if (c2.isRev) {
        p2 = `Chính sự dồn nén ấy dẫn thẳng đến thực tại bạn đang đối mặt, nơi lá **${c2.name} (ở chiều ngược)** xuất hiện như một lời cảnh tỉnh nhẹ nhàng nhưng chuẩn xác. Lá bài này chạm đúng vào nút thắt: ${c2.meaning.toLowerCase()}. Đôi khi, điều làm bạn kiệt sức không hoàn toàn là hoàn cảnh bên ngoài, mà là cảm giác giằng xé khi bạn cứ mãi tự chất vấn bản thân. Có phải sâu thẳm bên trong, bạn đang cố chấp bám víu vào một điều mà chính bạn cũng biết là nó không còn phục vụ cho sự bình an của mình nữa?`;
    } else {
        p2 = `Từ nền tảng đó, khi nhìn vào thực tế ngay lúc này, lá **${c2.name} (chiều xuôi)** phản chiếu rõ nét trạng thái bạn đang trải qua: ${c2.meaning.toLowerCase()}. Đây là thời điểm nút thắt hiện hình rõ ràng nhất. Bạn không thể tiếp tục lảng tránh hay làm ngơ được nữa; vũ trụ đang đặt bạn vào tình huống đòi hỏi bạn phải thẳng thắn với chính cảm xúc của mình thay vì chỉ cố gắng làm hài lòng người khác.`;
    }

    // Đoạn 3: Lá 3 - Chuyển hóa & Lối mở (kết nối nhân quả từ lá 2)
    let p3 = "";
    if (c3.isRev) {
        p3 = `Và khi bạn dám chấp nhận sự thật của nút thắt ấy, hướng đi tiếp theo được mở ra qua lá **${c3.name} (ở chiều ngược)**. Lá bài này nhắc mình rằng sự chuyển hóa không nhất thiết phải là một cuộc thay đổi đột ngột làm đảo lộn tất cả, mà đôi khi chỉ cần bắt đầu từ việc tháo gỡ sự kháng cự bên trong: ${c3.meaning.toLowerCase()}. Đừng ép bản thân phải có ngay một quyết định hoàn hảo; việc bạn dám chậm lại, buông bớt kỳ vọng và bảo vệ ranh giới cá nhân đã là một bước tiến rất lớn rồi.`;
    } else {
        p3 = `Và điều tuyệt vời là khi bạn can đảm nhìn thẳng vào sự thật để tháo gỡ nút thắt đó, dòng chảy sẽ tự nhiên dịch chuyển về phía lá **${c3.name} (chiều xuôi)**. Đây là một tín hiệu rất ấm áp cho thấy cánh cửa phía trước đang hé mở: ${c3.meaning.toLowerCase()}. Nó khẳng định rằng sự ngột ngạt này chỉ là tạm thời. Một khi bạn chủ động giành lại quyền tự quyết cho cuộc đời mình, bạn sẽ tìm lại được sự nhẹ nhõm và nguồn năng lượng tích cực vốn có.`;
    }

    storyBody = `${p1}\n\n${p2}\n\n${p3}`;

    // 5. Kết bài: 1 câu hỏi gợi mở suy ngẫm + 1-2 gợi ý hành động thiết thực
    let reflectiveQuestion = "";
    let actionItems = [];

    if (topic === "work") {
        if (isExhausted) {
            reflectiveQuestion = "Nếu gạt đi nỗi sợ bấp bênh hay cảm giác tiếc nuối thời gian đã bỏ ra, bạn có thực sự muốn tiếp tục ở lại một nơi đang từng ngày làm cạn kiệt niềm vui sống của mình?";
            actionItems = [
                "**Đặt lại ranh giới tâm lý ngay ngày mai:** Làm đúng bổn phận chuyên môn, không ôm đồm thêm việc ngoài lề và học cách từ chối khéo léo những yêu cầu vô lý để giữ lại năng lượng cho bản thân.",
                "**Chuẩn bị đường lùi trong tĩnh lặng:** Cập nhật lại CV, chủ động liên hệ ngầm với 1-2 người quen trong ngành hoặc lướt tìm cơ hội mới để bạn thấy mình luôn có lối thoát thay vì thế bị động."
            ];
        } else {
            reflectiveQuestion = "Điều gì trong công việc hiện tại thực sự nuôi dưỡng sự phát triển của bạn, và điều gì chỉ đang là thói quen khiến bạn ngại thay đổi?";
            actionItems = [
                "**Lập danh sách 3 ưu tiên cốt lõi:** Chọn ra 3 việc quan trọng nhất cần hoàn thành trong tuần này để tập trung xử lý, gạt bỏ bớt những lo lắng về những thứ bạn không trực tiếp kiểm soát được.",
                "**Chủ động trao đổi thẳng thắn:** Nếu có hiểu lầm hoặc khối lượng việc chưa hợp lý, hãy đề xuất một buổi trò chuyện ngắn gọn, dựa trên số liệu và giải pháp cụ thể thay vì giữ im lặng."
            ];
        }
    } else if (topic === "love") {
        if (isDoubtful || isExhausted) {
            reflectiveQuestion = "Trong mối quan hệ này, bạn đang yêu con người thực tế của họ ở hiện tại, hay bạn đang yêu hình bóng và những tiềm năng mà bạn hy vọng họ sẽ trở thành?";
            actionItems = [
                "**Cho mình một khoảng lặng 48 giờ:** Tạm dừng việc cố gắng phân tích hành động của đối phương hoặc lướt xem trang cá nhân của họ; hãy dùng thời gian đó làm một điều gì đó khiến bản thân bạn thấy thoải mái.",
                "**Lắng nghe cảm giác cơ thể:** Mỗi khi ở bên cạnh hoặc nghĩ về người ấy, cơ thể bạn cảm thấy nhẹ nhõm, bình yên hay luôn trong trạng thái căng thẳng, đề phòng? Hãy tin vào câu trả lời của trực giác."
            ];
        } else {
            reflectiveQuestion = "Nếu bạn được hoàn toàn thành thật mà không sợ bị từ chối hay phán xét, điều gì bạn khao khát được sẻ chia cùng người ấy nhất lúc này?";
            actionItems = [
                "**Mở lời từ cảm xúc của chính mình:** Tránh dùng những câu trách móc bắt đầu bằng 'Tại sao anh/em...', hãy thử bắt đầu bằng 'Mình cảm thấy...' để tạo không gian đối thoại an toàn cho cả hai.",
                "**Tập trung vào hiện tại:** Tránh đào xới lại những lỗi lầm cũ đã qua; hãy cùng nhau tạo ra một khoảnh khắc vui vẻ trọn vẹn trong buổi hẹn tiếp theo."
            ];
        }
    } else if (topic === "finance") {
        reflectiveQuestion = "Quyết định tài chính này xuất phát từ một kế hoạch tỉnh táo dài hạn, hay phần nhiều đến từ sự sốt ruột và nỗi sợ bỏ lỡ cơ hội?";
        actionItems = [
            "**Áp dụng nguyên tắc trì hoãn 7 ngày:** Với bất kỳ khoản chi tiêu hoặc quyết định đầu tư lớn nào lúc này, hãy cho bản thân ít nhất một tuần để suy xét lại sau khi cảm xúc ban đầu đã hạ nhiệt.",
            "**Rà soát dòng tiền thực tế:** Liệt kê các khoản chi tiêu bắt buộc và cắt giảm ngay những khoản phí không cần thiết để tạo vùng đệm an toàn cho tâm lý của bạn."
        ];
    } else {
        reflectiveQuestion = "Nếu biết chắc rằng mọi lựa chọn đều là một bài học cần thiết để bạn trưởng thành, bạn sẽ chọn bước đi nào khiến bạn cảm thấy tự hào về lòng dũng cảm của mình?";
        actionItems = [
            "**Viết ra giấy để giải phóng tâm trí:** Dành 10 phút trước khi ngủ viết ra tất cả những điều bạn đang lo sợ, rồi gạch bỏ những điều bạn không thể kiểm soát được ngay lúc này.",
            "**Thực hiện một hành động nhỏ trong 24 giờ tới:** Đừng đợi đến khi mọi thứ hoàn hảo mới bắt đầu; hãy làm một việc rất nhỏ nhưng hướng thẳng đến sự bình yên mà bạn đang tìm kiếm."
        ];
    }

    const actionsFormatted = actionItems.map(item => `- ${item}`).join('\n');

    return `${openingReflection}

${storyBody}

---

**Một điều gợi mở để bạn cùng suy ngẫm:**
*${reflectiveQuestion}*

${actionsFormatted}`;
}

// Test with sample questions
const testCards = [
    { data: bookData[16], isReversed: false }, // The Tower
    { data: bookData[8], isReversed: true },   // Strength reversed
    { data: bookData[17], isReversed: false }  // The Star
];

console.log("=== TEST 1: CÔNG VIỆC TOXIC ===");
console.log(testGenerateReading("Mình có nên nghỉ việc không? Môi trường công ty dạo này toxic quá, sếp hay ép việc và chèn ép nhân viên, mình thấy kiệt sức.", testCards));

console.log("\n=== TEST 2: TÌNH CẢM BẤT AN ===");
const loveCards = [
    { data: bookData[2], isReversed: true },  // The High Priestess reversed
    { data: bookData[6], isReversed: false }, // The Lovers
    { data: bookData[18], isReversed: true }  // The Moon reversed
];
console.log(testGenerateReading("Người yêu dạo này lạnh nhạt, mình thấy lo lắng không biết họ có còn thương mình không?", loveCards));
