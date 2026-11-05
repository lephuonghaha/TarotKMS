const questions = [
    "Mình có nên nghỉ việc không vì sếp toxic quá?",
    "Sắp tới thi công chức có đỗ không ạ?",
    "Tương lai công việc sắp tới của mình thế nào?",
    "Người ấy có còn yêu mình không?",
    "Dự án này liệu có thành công chăng?",
    "Mình nên chọn ở lại hay chuyển sang công ty mới?",
    "Tình hình tài chính cuối năm nay ra sao?",
    "Năm nay có mua được nhà không?",
    "Em và anh ấy có quay lại được không?"
];

function analyzeQuestion(question) {
    const raw = (question || "").trim();
    const q = raw.toLowerCase();
    const qClean = q.replace(/[?!.,;]/g, ' ').replace(/\s+/g, ' ').trim();

    const hasQuestionEnd = /\b(không|ko|k|hông|được không|chưa|chăng|hay không)(\s+(ạ|nhỉ|vậy|ta))?$/i.test(qClean);
    const hasBinaryKeyword = /\b(có nên|nên hay không|đậu hay rớt|đỗ hay trượt|đi hay ở|ở hay đi|nghỉ hay ở|bỏ hay giữ|phải không|đúng không|ổn không|được không)\b/i.test(qClean);
    const hasBinaryStart = /^(có|liệu|mình có|em có|anh có|nên|mình nên|em nên|liệu có|liệu mình có)\b/i.test(qClean);
    const hasChoice = /\b(hay|hoặc)\b/.test(qClean) && /\b(nên|chọn)\b/.test(qClean);

    const isBinary = hasBinaryKeyword || hasChoice || (hasBinaryStart && /\b(không|ko|k|được|đỗ|đậu|chưa|thành công)\b/i.test(qClean)) || hasQuestionEnd;

    // Detect theme
    let theme = "general";
    if (/(yêu|tình|crush|người yêu|người ấy|hẹn hò|chia tay|quay lại|kết hôn|chồng|vợ|lạnh nhạt|ngoại tình)/i.test(q)) {
        theme = "love";
    } else if (/(việc|công ty|sếp|nghề|đồng nghiệp|lương|nghỉ việc|đổi việc|thôi việc|dự án|kinh doanh|toxic)/i.test(q)) {
        theme = "work";
    } else if (/(thi|học|kỳ thi|điểm|đậu|rớt|đỗ|trượt|tốt nghiệp|bằng cấp|du học)/i.test(q)) {
        theme = "exam";
    } else if (/(tiền|tài chính|đầu tư|lỗ|lời|nợ|chứng khoán|đất|mua nhà|mua xe)/i.test(q)) {
        theme = "finance";
    }

    // Binary sub-type
    let binaryType = "yes_no";
    if (/(nghỉ việc|đổi việc|thôi việc|nghỉ hay ở|ở lại hay đi)/i.test(q)) {
        binaryType = "quit_job";
    } else if (/(thi|đậu|rớt|đỗ|trượt|qua môn|đạt)/i.test(q)) {
        binaryType = "pass_fail";
    } else if (/(quay lại|hàn gắn)/i.test(q)) {
        binaryType = "reconcile";
    } else if (/(còn yêu|còn thương|thật lòng|thương mình)/i.test(q)) {
        binaryType = "love_feelings";
    } else if (/(có nên|nên)/i.test(q)) {
        binaryType = "should_do";
    }

    return { raw, isBinary, theme, binaryType };
}

questions.forEach(q => {
    const res = analyzeQuestion(q);
    console.log(`"${q}" => Binary: ${res.isBinary}, Theme: ${res.theme}, Type: ${res.binaryType}`);
});
