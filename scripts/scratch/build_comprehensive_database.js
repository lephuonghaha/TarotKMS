const fs = require('fs');
const path = require('path');

// 1. Load current tarot_book.json
const ROOT_DIR = path.join(__dirname, '..', '..');
const currentCards = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'tarot_book.json'), 'utf8'));

// 2. Define rich mapping for Archetype Story, Yes/No, and Time Prediction
const KNOWLEDGE_ENRICHMENT = {
    // 22 ẨN CHÍNH (MAJOR ARCANA)
    'major-0': {
        archetype_story: 'Nguyên mẫu Đứa Trẻ Thần Thánh (Divine Child) và Linh Hồn Thuần Khiết. Chàng Khờ đứng trước bờ vực với cành hoa hồng trắng và chú chó nhỏ trung thành, tượng trưng cho bước khởi đầu can đảm của con người khi dấn thân vào cõi đời, không bị vấy bẩn bởi định kiến hay nỗi sợ hãi quá khứ.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Vũ trụ mở ra tiềm năng vô hạn nhưng kết quả phụ thuộc vào việc bạn có dám bước ra khỏi vùng an toàn và tin vào trực giác sơ khai hay không; chưa có gì định hình chắc chắn.',
        time_prediction: 'Bất ngờ, ngay tức khắc hoặc thời điểm chuyển giao mùa xuân.'
    },
    'major-1': {
        archetype_story: 'Nguyên mẫu Người Sáng Tạo (The Creator / Magus) và Ý Thức Tỉnh Táo. Pháp Sư một tay chỉ lên trời, một tay trỏ xuống đất, trên bàn hội tụ đủ 4 biểu tượng Đất - Nước - Lửa - Khí, biểu thị năng lực biến ý niệm tinh thần thành hiện thực vật chất thông qua ý chí tập trung cao độ.',
        yes_no_result: 'YES',
        yes_no_reason: 'Bạn đã hội tụ đầy đủ kỹ năng, công cụ và nguồn lực cần thiết; chỉ cần chủ động ra tay hành động là sẽ xoay chuyển cục diện thành công.',
        time_prediction: 'Rất sớm, ngay khi bạn bắt tay vào hành động / Chu kỳ sao Thủy (khoảng 1 - 2 tuần).'
    },
    'major-2': {
        archetype_story: 'Nguyên mẫu Nữ Tính Huyền Bí (Anima) và Tiềm Thức Sâu Thẳm. Ngồi giữa hai cột trụ Đen - Trắng (Boaz & Jachin) cùng bức màn quả lựu, Nữ Tư Tế canh giữ cánh cổng tri thức tâm linh, nhắc nhở con người về sự tĩnh lặng và lắng nghe trực giác trước khi hành động.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Câu trả lời đang bị ẩn giấu trong tiềm thức hoặc hoàn cảnh chưa bộc lộ hết; thời điểm này cần quan sát tĩnh lặng hơn là vội vã đưa ra quyết định.',
        time_prediction: 'Chu kỳ Mặt Trăng (28 ngày hoặc kỳ Trăng tròn tiếp theo).'
    },
    'major-3': {
        archetype_story: 'Nguyên mẫu Đại Mẫu (Great Mother / Mẹ Thiên Nhiên) và Năng Lượng Nuôi Dưỡng. Ngồi giữa cánh đồng lúa mì vàng óng và dòng thác mát lành, Nữ Hoàng đại diện cho sự thụ thai, phát triển trù phú, lòng bao dung và sự tận hưởng cái đẹp giác quan trọn vẹn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Năng lượng phì nhiêu, sinh sôi nảy nở đang bảo bọc dự định của bạn; mọi gieo trồng đều sẽ thu hoạch quả ngọt dồi dào.',
        time_prediction: 'Mùa xuân - Mùa gặt, hoặc chu kỳ thai nghén 9 tháng.'
    },
    'major-4': {
        archetype_story: 'Nguyên mẫu Người Cha (The Father / Phụ Tính) và Trật Tự Xã Hội. Ngồi trên ngai đá chạm khắc đầu cừu uy nghiêm, Hoàng Đế biểu trưng cho lý trí vững vàng, tính kỷ luật, khả năng thiết lập ranh giới và bảo vệ đế chế của bản thân trước hỗn loạn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Tính thực tế, sự kỷ luật và cấu trúc rõ ràng sẽ giúp bạn làm chủ hoàn cảnh và đạt được kết quả như ý.',
        time_prediction: 'Mùa Bạch Dương (21/3 - 19/4) hoặc khoảng 4 tuần tới.'
    },
    'major-5': {
        archetype_story: 'Nguyên mẫu Người Thầy Tâm Linh (The Mentor / Wise Old Man) và Truyền Thống. Ngồi giữa hai môn đồ với quyền trượng ba tầng, Giáo Hoàng đại diện cho hệ thống quy chuẩn đạo đức, sự truyền thừa tri thức và sự hòa nhập vào các cấu trúc xã hội chuẩn mực.',
        yes_no_result: 'YES',
        yes_no_reason: 'Đồng thuận nếu bạn tuân thủ các nguyên tắc đạo đức chuẩn mực, làm theo lời khuyên của người có chuyên môn hoặc đi theo con đường chính thống.',
        time_prediction: 'Mùa Kim Ngưu (20/4 - 20/5) hoặc khoảng 5 tuần.'
    },
    'major-6': {
        archetype_story: 'Nguyên mẫu Sự Hợp Nhất Nhị Nguyên (The Conjunction) và Sự Thức Tỉnh Của Trái Tim. Dưới sự chúc phúc của Thiên thần Raphael, Adam và Eve đại diện cho sự hòa hợp giữa ý thức và tiềm thức, đồng thời đòi hỏi sự lựa chọn dũng cảm theo hệ giá trị cốt lõi.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Kết quả phụ thuộc vào việc bạn có chân thật với trái tim mình hay không; bạn đứng trước ngã rẽ và phải tự chịu trách nhiệm cho lựa chọn đạo đức của mình.',
        time_prediction: 'Mùa Song Tử (21/5 - 20/6) hoặc trong vòng 6 tuần.'
    },
    'major-7': {
        archetype_story: 'Nguyên mẫu Người Hùng Chiến Thắng (The Hero). Chiến binh điều khiển cỗ xe với hai nhân sư trắng - đen bằng sức mạnh ý chí thuần túy chứ không cần dây cương, biểu tượng cho việc vượt qua các xung đột nội tâm để tiến thẳng đến mục tiêu vẻ vang.',
        yes_no_result: 'YES',
        yes_no_reason: 'Ý chí kiên định và quyết tâm cao độ sẽ giúp bạn đập tan mọi trở ngại phía trước; chiến thắng thuộc về người chủ động.',
        time_prediction: 'Mùa Cự Giải (21/6 - 22/7) hoặc diễn ra nhanh chóng trong vòng 1 tháng.'
    },
    'major-8': {
        archetype_story: 'Nguyên mẫu Thuần Hóa Bản Năng (Taming the Beast) và Sức Mạnh Tinh Thần. Người phụ nữ dịu dàng khép miệng sư tử bằng vòng hoa và tình thương, thể hiện triết lý nhu thắng cương, sự kiên nhẫn và lòng trắc ẩn chế ngự dục vọng thô bạo.',
        yes_no_result: 'YES',
        yes_no_reason: 'Bạn có đủ nội lực và sự điềm tĩnh để hóa giải khó khăn; hãy dùng lòng kiên nhẫn và sự dịu dàng thay vì áp đặt thô bạo.',
        time_prediction: 'Mùa Sư Tử (23/7 - 22/8) hoặc khoảng 8 tuần / 2 tháng.'
    },
    'major-9': {
        archetype_story: 'Nguyên mẫu Nhà Thông Thái Đi Tìm Chân Lý (The Wise Hermit). Vị ẩn sĩ đứng một mình trên đỉnh núi tuyết cầm ngọn đèn lồng soi rọi ngôi sao sáu cánh, đại diện cho việc tạm lánh đám đông để tự vấn lương tâm và tìm ra ngọn hải đăng soi sáng bản ngã.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Hiện tại chưa phải lúc mở rộng ra thế giới bên ngoài; bạn cần khoảng lặng nhìn lại chính mình để thấu suốt bản chất sự việc trước khi quyết định.',
        time_prediction: 'Mùa Xử Nữ (23/8 - 22/9) hoặc thời gian cần tĩnh lặng từ 1 đến vài tháng.'
    },
    'major-10': {
        archetype_story: 'Nguyên mẫu Vô Thức Tập Thể và Quy Luật Vô Thường (Samsara). Bánh xe vũ trụ không ngừng luân chuyển giữa bốn sinh vật thần thoại, nhắc nhở con người rằng vạn vật luôn biến dịch; điểm tĩnh tại duy nhất chính là tâm thức bất biến ở trục trung tâm.',
        yes_no_result: 'YES',
        yes_no_reason: 'Vận may và bước ngoặt định mệnh đang xoay chuyển theo chiều hướng thuận lợi; hãy nắm bắt thời cơ khi bánh xe đưa bạn lên đỉnh.',
        time_prediction: 'Bất ngờ, theo bước ngoặt chu kỳ sao Mộc (khoảng 10 ngày hoặc mốc chuyển mùa).'
    },
    'major-11': {
        archetype_story: 'Nguyên mẫu Trật Tự Đạo Đức và Quy Luật Nhân Quả (Karma). Nữ thần cầm thanh kiếm phân định sự thật và chiếc cân cân đo hành vi, thể hiện sự công minh tuyệt đối, tính trách nhiệm và quả ngọt/đắng dựa trên chính những gì bạn đã gieo trồng.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Kết quả sẽ hoàn toàn công bằng dựa trên những gì bạn đã hành xử và nỗ lực; sự thật và tính chính trực sẽ quyết định đáp án cuối cùng.',
        time_prediction: 'Mùa Thiên Bình (23/9 - 22/10) hoặc khoảng 11 ngày/tuần.'
    },
    'major-12': {
        archetype_story: 'Nguyên mẫu Sự Hy Sinh Tự Nguyện và Đổi Góc Nhìn (Surrender & Metanoia). Chàng trai tự nguyện treo ngược chân trên cành cây sự sống với vầng hào quang rạng rỡ, tượng trưng cho sự dừng lại cần thiết để nhìn đời bằng lăng kính hoàn toàn mới.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Mọi việc đang bị trì hoãn để bạn buông bỏ cái tôi cố chấp; cố gượng ép lúc này sẽ không có kết quả, cần học cách chờ đợi và đổi góc nhìn.',
        time_prediction: 'Thời gian trì hoãn từ vài tuần đến vài tháng; sự việc diễn ra chậm rãi.'
    },
    'major-13': {
        archetype_story: 'Nguyên mẫu Sự Tái Sinh và Cái Chết Tâm Lý (Transformation). Kỵ sĩ xương mặc giáp đen cưỡi ngựa trắng bước qua tro tàn hướng về ánh bình minh phía xa, biểu thị sự chấm dứt tất yếu của cái cũ để nhường chỗ cho mầm sống mới đâm chồi.',
        yes_no_result: 'NO',
        yes_no_reason: 'Giai đoạn cũ đã đến lúc phải khép lại; đừng cố níu giữ những gì không còn phục vụ cho sự tiến hóa của tâm hồn bạn.',
        time_prediction: 'Mùa Bọ Cạp (23/10 - 21/11) hoặc thời điểm kết thúc một chu kỳ để bắt đầu cái mới.'
    },
    'major-14': {
        archetype_story: 'Nguyên mẫu Giả Kim Thuật Tâm Hồn (Alchemy) và Cân Bằng Năng Lượng. Thiên thần một chân đặt dưới nước, một chân trên đất liền, rót nước qua lại giữa hai chiếc chén mà không làm sánh một giọt, biểu hiện của sự dung hòa, điều tiết và chữa lành vi diệu.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sự dung hòa, kiên nhễn và điều độ sẽ mang lại kết quả bình an, bền vững và thuận hòa cho mọi phía.',
        time_prediction: 'Mùa Nhân Mã (22/11 - 21/12) hoặc cần khoảng thời gian dung hòa từ 1 đến 3 tháng.'
    },
    'major-15': {
        archetype_story: 'Nguyên mẫu Cái Bóng Tâm Lý (The Shadow) và Xiềng Xích Ảo Tưởng. Cặp đôi bị xích lỏng lẻo dưới chân ác quỷ Baphomet, biểu trưng cho sự lệ thuộc vào dục vọng, nỗi sợ hãi, lòng tham vật chất mà thực chất chỉ là ảo tưởng do tâm trí tự trói buộc.',
        yes_no_result: 'NO',
        yes_no_reason: 'Dấu hiệu của sự độc hại, phụ thuộc mù quáng hoặc cám dỗ nguy hiểm; nếu tiếp tục bạn sẽ đánh mất tự do và quyền tự chủ cá nhân.',
        time_prediction: 'Mùa Ma Kết (22/12 - 19/1) hoặc giai đoạn bế tắc ngắn hạn.'
    },
    'major-16': {
        archetype_story: 'Nguyên mẫu Sự Sụp Đổ Của Bản Ngã (Ego Collapse) và Sấm Sét Thức Tỉnh. Tia sét đánh sụp đỉnh tháp ngạo mạn, hất tung những ảo tưởng để trả con người về mặt đất chân thực; đau đớn nhưng là sự giải phóng tất yếu khỏi một nhà tù tâm lý.',
        yes_no_result: 'NO',
        yes_no_reason: 'Nền tảng hiện tại xây trên ảo tưởng và nguy cơ sụp đổ rất cao; vũ trụ đang buộc bạn thức tỉnh và tái cấu trúc lại từ đầu.',
        time_prediction: 'Đột ngột như sét đánh, diễn ra tức khắc trong vài ngày tới hoặc mùa sao Hỏa.'
    },
    'major-17': {
        archetype_story: 'Nguyên mẫu Hy Vọng và Nguồn Sống Tinh Khiết (The Guiding Star). Người thiếu nữ khỏa thân đổ nước nguồn vào đất và hồ dưới bầu trời đầy sao lấp lánh, tượng trưng cho sự chữa lành sâu sắc sau giông bão, niềm tin vào vũ trụ và vẻ đẹp chân thật.',
        yes_no_result: 'YES',
        yes_no_reason: 'Ánh sáng hy vọng và sự bảo trợ tâm linh đang soi rọi con đường bạn đi; hãy giữ vững niềm tin thuần khiết, ước mơ sẽ thành tựu.',
        time_prediction: 'Mùa Bảo Bình (20/1 - 18/2) hoặc nở rộ sau giai đoạn chữa lành (khoảng 2 - 3 tháng).'
    },
    'major-18': {
        archetype_story: 'Nguyên mẫu Vùng Vô Thức Nguyên Thủy (The Wild Unconscious) và Ảo Ảnh Sợ Hãi. Hai chú chó sói hú dưới ánh trăng mờ ảo cùng con tôm trồi lên từ đầm lầy, đại diện cho những nỗi sợ mơ hồ, ảo tưởng và hành trình vượt qua mê hồn trận của tâm trí.',
        yes_no_result: 'NO',
        yes_no_reason: 'Mọi thứ còn chìm trong sương mù ảo giác và sự nghi kỵ; chưa thể nhìn rõ thực tế nên nếu quyết định lúc này rất dễ bị lừa dối hoặc lạc lối.',
        time_prediction: 'Mùa Song Ngư (19/2 - 20/3) hoặc chu kỳ 1 tháng trăng từ non đến tròn.'
    },
    'major-19': {
        archetype_story: 'Nguyên mẫu Sự Tỏa Sáng Toàn Bích (The Conscious Self) và Hạnh Phúc Thuần Khiết. Đứa trẻ cưỡi ngựa trắng dưới ánh mặt trời rực rỡ và những bông hướng dương nở rộ, biểu tượng của sự hợp nhất hoàn hảo giữa bản ngã và vũ trụ, thành công viên mãn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Năng lượng rực rỡ, may mắn và thành công trọn vẹn; mọi bóng tối hoài nghi đều bị xua tan bởi niềm vui và chân lý sáng ngời.',
        time_prediction: 'Mùa hè rực rỡ, buổi trưa đầy nắng, hoặc diễn ra viên mãn trong vòng 1 tháng.'
    },
    'major-20': {
        archetype_story: 'Nguyên mẫu Sự Phục Sinh và Thức Tỉnh Lương Tri (Resurrection). Tiếng kèn của thiên thần thức tỉnh những linh hồn trỗi dậy từ nấm mồ, đại diện cho việc rũ bỏ quá khứ, tha thứ cho bản thân và bước vào một tầm mức tâm thức cao hơn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Thời điểm chín muồi để đưa ra quyết định bước ngoặt; hãy lắng nghe tiếng gọi chân thật của lương tri và tự tin tái sinh.',
        time_prediction: 'Thời điểm quyết định bước ngoặt, không thể trì hoãn; diễn ra trong vòng vài tuần.'
    },
    'major-21': {
        archetype_story: 'Nguyên mẫu Sự Toàn Vẹn Tự Thân (Individuation / Mandala Vũ Trụ). Người nhảy múa trong vòng nguyệt quế giữa bốn vị thần bảo hộ, tượng trưng cho sự hoàn tất vẻ vang một chu kỳ tiến hóa tâm linh, hợp nhất trọn vẹn với dòng chảy sự sống.',
        yes_no_result: 'YES',
        yes_no_reason: 'Mọi nỗ lực đã đi đến đỉnh cao viên mãn; bạn đang chạm tay vào sự trọn vẹn, mở ra một chương đời mới đầy tự do và thành tựu.',
        time_prediction: 'Kết thúc một chu kỳ lớn (cuối năm hoặc sau khi hoàn thành chu kỳ 4 mùa).'
    },

    // 56 ẨN PHỤ (MINOR ARCANA)
    // 1. BỘ GẬY (WANDS - LỬA - NGÀY / MÙA XUÂN)
    'wands-1': {
        archetype_story: 'Hạt mầm ý chí và ngọn lửa sáng tạo nguyên khôi. Bàn tay vũ trụ trao cây gậy nảy lộc giữa trời mây, biểu tượng cho nguồn cảm hứng bộc phát và sự can đảm khai mở hành trình mới.',
        yes_no_result: 'YES',
        yes_no_reason: 'Ngọn lửa nhiệt huyết và cơ hội mới đang bùng cháy mạnh mẽ; hành động ngay sẽ gặt hái kết quả rực rỡ.',
        time_prediction: '1 ngày hoặc mùa xuân (Bạch Dương).'
    },
    'wands-2': {
        archetype_story: 'Người chỉ huy đứng trên lâu đài cầm quả địa cầu ngắm nhìn đại dương xa xăm. Sự cân nhắc giữa vùng an toàn hiện tại và khát vọng chinh phục thế giới rộng lớn hơn.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Bạn đang đứng trước ngã rẽ lựa chọn mở rộng tầm nhìn; cần lập kế hoạch cụ thể trước khi dấn thân.',
        time_prediction: '2 ngày hoặc đầu mùa xuân (khoảng 21/3 - 30/3).'
    },
    'wands-3': {
        archetype_story: 'Lữ khách đứng trên vách đá ngắm nhìn đoàn thuyền chở hàng xuôi gió ra khơi. Nỗ lực bước đầu đã được phóng thích và bắt đầu mở ra chân trời cơ hội mới.',
        yes_no_result: 'YES',
        yes_no_reason: 'Những hạt mầm bạn gieo và đoàn thuyền bạn gửi đi đang trên đường mang lại tin vui và thành quả mở rộng.',
        time_prediction: '3 ngày hoặc giữa mùa xuân (khoảng 31/3 - 10/4).'
    },
    'wands-4': {
        archetype_story: 'Cổng hoa bốn gậy rực rỡ chào đón đôi uyên ương trong ngày hội mùa màng. Đại diện cho niềm vui sum vầy, sự ổn định gia đình và cột mốc thành công xứng đáng được tán dương.',
        yes_no_result: 'YES',
        yes_no_reason: 'Nền tảng vững chắc, niềm vui sum vầy và thành công xứng đáng được chúc mừng; mọi sự bình an thuận lợi.',
        time_prediction: '4 ngày hoặc mùa xuân hoa nở rộ (khoảng 11/4 - 20/4).'
    },
    'wands-5': {
        archetype_story: 'Năm chàng thanh niên vung gậy tranh đấu lẫn nhau giữa bãi đất trống. Đại diện cho sự cạnh tranh gay gắt, xung đột quan điểm và sự phân tán năng lượng do thiếu tổ chức.',
        yes_no_result: 'NO',
        yes_no_reason: 'Năng lượng đang bị tiêu hao bởi tranh cãi và đấu đá nội bộ; cần tìm kiếm tiếng nói chung thay vì tiếp tục đối đầu.',
        time_prediction: '5 ngày hoặc mùa hè (Sư Tử - khoảng 22/7 - 1/8).'
    },
    'wands-6': {
        archetype_story: 'Người chiến binh đội vòng nguyệt quế cưỡi ngựa trắng diễu hành giữa tiếng reo hò của đám đông. Biểu tượng của vinh quang chiến thắng và sự công nhận từ cộng đồng.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sự công nhận vẻ vang, chiến thắng và sự ngưỡng mộ từ cộng đồng dành cho bạn; tự tin tiến bước.',
        time_prediction: '6 ngày hoặc giữa mùa hè (khoảng 2/8 - 11/8).'
    },
    'wands-7': {
        archetype_story: 'Chiến sĩ kiên cường đứng trên đỉnh đồi cao chống lại sáu chiếc gậy nhắm vào mình từ bên dưới. Biểu thị bản lĩnh giữ vững lập trường và lợi thế địa hình trước áp lực bủa vây.',
        yes_no_result: 'YES',
        yes_no_reason: 'Dù bị bao vây thử thách nhưng vị thế phòng thủ kiên cường của bạn sẽ giúp bạn giữ vững thắng lợi cuối cùng.',
        time_prediction: '7 ngày hoặc cuối mùa hè (khoảng 12/8 - 22/8).'
    },
    'wands-8': {
        archetype_story: 'Tám cành gậy lao vun vút trên bầu trời thanh bình hướng về mặt đất màu mỡ. Tốc độ chuyển dịch cực nhanh, các sự kiện dồn dập đến và không còn trở ngại cản bước.',
        yes_no_result: 'YES',
        yes_no_reason: 'Tốc độ diễn tiến thần tốc, tin tức bất ngờ bay đến tháo gỡ mọi tắc nghẽn và đưa sự việc về đích.',
        time_prediction: 'Rất nhanh trong 1 - 2 ngày tới, hoặc mùa Nhân Mã (khoảng 23/11 - 2/12).'
    },
    'wands-9': {
        archetype_story: 'Người lính băng bó vết thương trên trán nhưng ánh mắt vẫn cảnh giác tựa vào cọc gậy phòng thủ cuối cùng. Sức chịu đựng phi thường và tinh thần kiên cường ở chặng cuối gian nan.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Bạn đã kiệt sức sau chặng đường dài; chỉ cần phòng thủ kiên trì nốt bước cuối cùng, đừng vội bỏ cuộc.',
        time_prediction: '9 ngày hoặc giữa mùa Nhân Mã (khoảng 3/12 - 12/12).'
    },
    'wands-10': {
        archetype_story: 'Người đàn ông còng lưng ôm bó mười cây gậy nặng trĩu tiến về ngôi làng phía trước. Đại diện cho gánh nặng trách nhiệm quá tải, sự ôm đồm và nguy cơ kiệt sức do không biết buông bỏ.',
        yes_no_result: 'NO',
        yes_no_reason: 'Gánh nặng quá sức chịu đựng; cần học cách buông bỏ bớt trách nhiệm và chia sẻ với người khác.',
        time_prediction: '10 ngày hoặc cuối mùa Nhân Mã (khoảng 13/12 - 21/12).'
    },
    'wands-11': {
        archetype_story: 'Chàng trai trẻ đứng giữa sa mạc chăm chú ngắm nhìn mầm chồi xanh biếc nảy nở trên đầu ngọn gậy. Tinh thần phiêu lưu, khát khao học hỏi và đón nhận nguồn cảm hứng mới.',
        yes_no_result: 'YES',
        yes_no_reason: 'Tinh thần khám phá non trẻ và tin tức hào hứng đang truyền cảm hứng cho bạn bắt đầu.',
        time_prediction: 'Vài ngày tới hoặc giai đoạn bắt đầu một dự án mới (mùa Lửa).'
    },
    'wands-12': {
        archetype_story: 'Kỵ sĩ giáp vàng cưỡi ngựa chiến phi nước đại giữa sa mạc rực lửa. Đại diện cho sự bùng nổ nhiệt huyết, hành động quyết liệt không chút sợ hãi và tính bộc phát mạnh mẽ.',
        yes_no_result: 'YES',
        yes_no_reason: 'Hành động thần tốc và lòng quả cảm đưa bạn lao nhanh về phía trước; đừng do dự.',
        time_prediction: 'Diễn ra cực nhanh trong vài ngày hoặc giữa mùa Lửa.'
    },
    'wands-13': {
        archetype_story: 'Hoàng hậu ngồi trên ngai vàng khắc hoa hướng dương và sư tử, tay cầm hoa hướng dương và chú mèo đen bên cạnh. Biểu tượng của sự ấm áp, tự tin, sức quyến rũ và năng lượng tích cực.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sức hút tự tin, sự ấm áp và bản lĩnh giúp bạn làm chủ hoàn toàn tình thế và truyền cảm hứng cho mọi người.',
        time_prediction: 'Khoảng 1 - 2 tuần hoặc mùa xuân ấm áp.'
    },
    'wands-14': {
        archetype_story: 'Vị vua ngồi trên ngai chạm khắc thằn lằn cắn đuôi (Ouroboros) và ngọn lửa uy nghiêm. Đỉnh cao của tầm nhìn lãnh đạo, ý chí sắt đá và khả năng biến ý tưởng vĩ mô thành sự nghiệp hiển hách.',
        yes_no_result: 'YES',
        yes_no_reason: 'Tầm nhìn lãnh đạo uy nghiêm và khả năng truyền cảm hứng dẫn dắt tập thể thành công rực rỡ.',
        time_prediction: 'Khoảng 1 tháng hoặc mùa hè rực lửa.'
    },

    // 2. BỘ CỐC (CUPS - NƯỚC - THÁNG / MÙA HÈ)
    'cups-1': {
        archetype_story: 'Chiếc chén vàng thánh thần tuôn trào năm dòng suối cảm xúc vào đầm sen thanh tịnh, chim bồ câu ngậm bánh thánh hạ xuống. Nguồn cội của tình yêu thương vô điều kiện và sự thức tỉnh tâm linh.',
        yes_no_result: 'YES',
        yes_no_reason: 'Chiếc cốc tình yêu và niềm vui tinh thần đang tràn đầy; hãy mở lòng đón nhận hạnh phúc.',
        time_prediction: '1 tháng hoặc mùa hè (Cự Giải).'
    },
    'cups-2': {
        archetype_story: 'Đôi nam nữ trao nhau chiếc chén ước nguyện dưới biểu tượng gậy thần Hermes (Caduceus) và đầu sư tử có cánh. Sự hòa hợp âm dương, tình yêu đích thực và sự gắn kết tâm hồn sâu sắc.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sự đồng điệu gắn kết của hai tâm hồn, tình cảm thăng hoa và hợp tác bền vững đôi bên cùng có lợi.',
        time_prediction: '2 tháng hoặc đầu mùa hè (khoảng 21/6 - 2/7).'
    },
    'cups-3': {
        archetype_story: 'Ba thiếu nữ nâng cao ba chiếc cốc kết vòng hoa dạo múa giữa vườn nho trĩu quả. Niềm vui gắn kết cộng đồng, tình bạn chân thành và sự sẻ chia hạnh phúc mùa màng.',
        yes_no_result: 'YES',
        yes_no_reason: 'Niềm vui chia sẻ, lễ hội ăn mừng và sự nâng đỡ ấm áp từ bạn bè, hội nhóm.',
        time_prediction: '3 tháng hoặc giữa mùa hè (khoảng 3/7 - 12/7).'
    },
    'cups-4': {
        archetype_story: 'Chàng trai ngồi khoanh tay dưới gốc cây thờ ơ trước ba chiếc cốc trước mặt, không buồn để ý chiếc cốc thứ tư đang được bàn tay vũ trụ trao tặng. Sự chán nản và mù quáng cảm xúc.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Sự thờ ơ, chán nản khiến bạn bỏ qua chiếc cốc kỳ diệu vũ trụ đang trao tặng; hãy mở mắt nhìn lại.',
        time_prediction: '4 tháng hoặc giai đoạn cảm xúc lắng đọng (khoảng 13/7 - 22/7).'
    },
    'cups-5': {
        archetype_story: 'Người áo đen cúi đầu xót xa nhìn ba chiếc cốc đổ rượu lênh láng trên mặt đất, quên mất hai chiếc cốc vẫn còn nguyên vẹn phía sau lưng. Nỗi đau mất mát và sự chấp niệm quá khứ.',
        yes_no_result: 'NO',
        yes_no_reason: 'Bạn đang mải đau buồn nhìn ba chiếc cốc đổ mà quên mất hai chiếc cốc còn nguyên phía sau; hãy quay đầu lại.',
        time_prediction: '5 tháng hoặc mùa Bọ Cạp (khoảng 23/10 - 2/11).'
    },
    'cups-6': {
        archetype_story: 'Hai đứa trẻ thơ ngây trong lâu đài cổ kính trao nhau chiếc cốc chứa đầy hoa trắng thơm ngát. Sự hoài niệm ngọt ngào, lòng vị tha và tình cảm trong sáng từ miền ký ức tuổi thơ.',
        yes_no_result: 'YES',
        yes_no_reason: 'Kỷ niệm ngọt ngào của tuổi thơ, sự tái ngộ nhân duyên cũ và tình cảm chân thành thuần khiết.',
        time_prediction: '6 tháng hoặc giữa mùa Bọ Cạp (khoảng 3/11 - 12/11).'
    },
    'cups-7': {
        archetype_story: 'Hình bóng người đàn ông sững sờ trước bảy chiếc cốc bồng bềnh trong mây mờ, chứa đựng rắn độc, lâu đài, ngọc quý, vòng nguyệt quế và quỷ dữ. Ảo mộng và cám dỗ của dục vọng hư vô.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Quá nhiều ảo tưởng và lựa chọn viển vông; cần kéo tâm trí về thực tại tỉnh táo để chọn một điều duy nhất.',
        time_prediction: '7 tháng hoặc thời điểm trăng tròn (khoảng 13/11 - 22/11).'
    },
    'cups-8': {
        archetype_story: 'Lữ khách quay lưng rời bỏ tám chiếc cốc xếp chồng ngay ngắn, chống gậy đơn độc bước qua dòng suối hướng lên núi cao dưới trăng khuyết. Sự thức tỉnh và can đảm rời bỏ cái quen thuộc.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Sự can đảm dứt áo ra đi khỏi những gì không còn thỏa mãn tâm hồn để tìm kiếm ý nghĩa cao hơn.',
        time_prediction: '8 tháng hoặc mùa Song Ngư (khoảng 19/2 - 28/2).'
    },
    'cups-9': {
        archetype_story: 'Người đàn ông bệ vệ ngồi khoanh tay mỉm cười mãn nguyện trước bức màn xanh treo chín chiếc cúp vàng lấp lánh. Lá bài của ước nguyện thành sự thật và sự thỏa mãn viên mãn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Lá bài ước nguyện thành tựu; sự thỏa mãn sâu sắc cả về cảm xúc lẫn chất lượng sống.',
        time_prediction: '9 tháng hoặc giữa mùa Song Ngư (khoảng 1/3 - 10/3).'
    },
    'cups-10': {
        archetype_story: 'Gia đình hạnh phúc cùng hai đứa trẻ nhảy múa dưới dải cầu vồng kết bằng mười chiếc cốc vàng rực rỡ trên bầu trời quê hương. Sự viên mãn tột cùng của tình yêu thương gia đình.',
        yes_no_result: 'YES',
        yes_no_reason: 'Hạnh phúc gia đình viên mãn, tình yêu trọn vẹn và sự bình an ngập tràn dưới cầu vồng ân sủng.',
        time_prediction: '10 tháng hoặc cuối mùa Song Ngư (khoảng 11/3 - 20/3).'
    },
    'cups-11': {
        archetype_story: 'Chàng trai trẻ duyên dáng đứng bên bờ biển ngắm nhìn chú cá nhỏ nhảy múa trong chiếc cốc trên tay. Thông điệp bất ngờ từ tiềm thức, sự mộng mơ và trực cảm tâm hồn.',
        yes_no_result: 'YES',
        yes_no_reason: 'Thông điệp ngọt ngào từ trái tim, sự ngây thơ trực cảm và cơ hội tình cảm mới chớm.',
        time_prediction: 'Vài tuần tới hoặc đầu mùa Nước.'
    },
    'cups-12': {
        archetype_story: 'Kỵ sĩ áo giáp thêu hình cá bơi lội cưỡi ngựa trắng thong thả bước qua dòng suối hiền hòa, tay nâng cao chiếc cốc tình yêu. Sứ giả của sự lãng mạn, hòa giải và lý tưởng thẩm mỹ.',
        yes_no_result: 'YES',
        yes_no_reason: 'Chàng kỵ sĩ lãng mạn mang đến lời mời hẹn hò, sự hòa giải hoặc cơ hội nghệ thuật đầy cảm hứng.',
        time_prediction: 'Khoảng 1 - 2 tháng hoặc mùa hè.'
    },
    'cups-13': {
        archetype_story: 'Hoàng hậu ngồi trên ngai vàng chạm khắc thiên thần biển, ngắm nhìn chiếc cúp tinh xảo có nắp đóng kín bên bờ đại dương bao la. Biểu tượng của trực giác thấu suốt và sự chữa lành thầm lặng.',
        yes_no_result: 'YES',
        yes_no_reason: 'Trực giác nhạy bén, tấm lòng nhân hậu thấu suốt cảm xúc người khác như mặt hồ yên ả.',
        time_prediction: 'Khoảng 2 - 3 tháng hoặc mùa hè mát mẻ.'
    },
    'cups-14': {
        archetype_story: 'Vị vua ngồi trên ngai vàng nổi trên mặt biển cuộn sóng, tay cầm cúp và quyền trượng, dây chuyền hình cá trước ngực. Khả năng làm chủ cảm xúc phi thường và sự điềm tĩnh trước giông bão đời người.',
        yes_no_result: 'YES',
        yes_no_reason: 'Bậc thầy làm chủ cảm xúc, lòng khoan dung độ lượng và sự thấu hiểu sâu sắc giúp cân bằng mọi quan hệ.',
        time_prediction: 'Khoảng 3 tháng hoặc thời điểm cảm xúc chín muồi.'
    },

    // 3. BỘ KIẾM (SWORDS - KHÍ - TUẦN / MÙA THU)
    'swords-1': {
        archetype_story: 'Bàn tay vũ trụ vươn ra từ đám mây nâng thanh kiếm hai lưỡi cắm vương miện kết lá cọ và ô liu. Sức mạnh tuyệt đối của lý trí, sự thật khách quan và chân lý chiến thắng dối lừa.',
        yes_no_result: 'YES',
        yes_no_reason: 'Lưỡi kiếm chân lý chém tan sương mù dối trá; sự sáng suốt và công lý sẽ mang lại thắng lợi dứt khoát.',
        time_prediction: '1 tuần hoặc mùa thu (Thiên Bình).'
    },
    'swords-2': {
        archetype_story: 'Thiếu nữ bịt mắt ngồi trên bờ đá trước biển đêm, hai tay bắt chéo giữ hai thanh kiếm nặng trĩu. Sự bế tắc do lý trí từ chối đối diện sự thật nhức nhối và đè nén cảm xúc.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Bạn đang bịt mắt né tránh đối diện với sự thật nhức nhối; cần hạ kiếm và mở lòng lắng nghe trực giác.',
        time_prediction: '2 tuần hoặc thời điểm trăng khuyết (khoảng 23/9 - 2/10).'
    },
    'swords-3': {
        archetype_story: 'Trái tim đỏ thắm bị ba lưỡi kiếm đâm xuyên qua giữa bầu trời mây đen vần vũ và mưa tuôn xối xả. Nỗi đau đớn tột cùng của sự chia ly, phản bội và bài học trưởng thành qua tan vỡ.',
        yes_no_result: 'NO',
        yes_no_reason: 'Nỗi đau thấu tim, sự chia ly hoặc phản bội; cần để nước mắt rửa trôi vết thương lòng trước khi đưa ra quyết định.',
        time_prediction: '3 tuần hoặc mùa thu nhiều gió (khoảng 3/10 - 12/10).'
    },
    'swords-4': {
        archetype_story: 'Hiệp sĩ nằm tịnh dưỡng trên lăng mộ đá với ba thanh kiếm treo trên tường và một thanh kiếm đặt bên cạnh, cửa sổ kính màu chiếu sáng. Khoảng lặng tĩnh tâm và hồi phục sinh lực sau chiến trận.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Thời điểm cơ thể và tâm trí cần được nghỉ ngơi phục hồi sau chuỗi ngày kiệt quệ; tạm hoãn hành động lúc này.',
        time_prediction: '4 tuần (khoảng 1 tháng) nghỉ ngơi tịnh dưỡng (khoảng 13/10 - 22/10).'
    },
    'swords-5': {
        archetype_story: 'Kẻ chiến thắng mỉm cười xảo quyệt thu gom các thanh kiếm trong khi hai kẻ bại trận cúi đầu lầm lũi bỏ đi bờ biển gió lốc. Thắng lợi cay đắng làm tổn hại mối quan hệ và danh dự.',
        yes_no_result: 'NO',
        yes_no_reason: 'Thắng lợi kiểu Pyrrhus - cái tôi giành phần thắng nhưng mối quan hệ tan vỡ; hãy rút lui để bảo toàn phẩm giá.',
        time_prediction: '5 tuần hoặc mùa Bảo Bình (khoảng 20/1 - 29/1).'
    },
    'swords-6': {
        archetype_story: 'Người chèo đò chở hai mẹ con cùng sáu thanh kiếm cắm trên mạn thuyền rời vùng nước xoáy tiến sang vùng nước êm đềm phía trước. Hành trình chữa lành và thoát khỏi gian truân.',
        yes_no_result: 'YES',
        yes_no_reason: 'Chiếc thuyền đang chèo qua vùng nước động để hướng về bờ bến bình yên; giông bão sắp lùi lại phía sau.',
        time_prediction: '6 tuần hoặc thời điểm chuyển mùa (khoảng 30/1 - 8/2).'
    },
    'swords-7': {
        archetype_story: 'Kẻ trộm lén lút ôm năm thanh kiếm chuồn khỏi trại lính trong khi hai thanh kiếm vẫn cắm lại sau lưng. Hành vi vụng trộm, sự thiếu minh bạch và chiến thuật né tránh đối đầu trực diện.',
        yes_no_result: 'NO',
        yes_no_reason: 'Cảnh báo về sự gian dối, trốn tránh trách nhiệm hoặc những mưu mô thiếu minh bạch phía sau lưng.',
        time_prediction: '7 tuần hoặc thời điểm bí mật bị phơi bày (khoảng 9/2 - 18/2).'
    },
    'swords-8': {
        archetype_story: 'Người phụ nữ bị bịt mắt, trói tay đứng giữa tám thanh kiếm cắm xung quanh trên bãi đất lầy lội. Sự bất lực giả tạo khi tâm trí tự dựng nên rào cản giam cầm chính mình.',
        yes_no_result: 'NO',
        yes_no_reason: 'Nhà tù tâm trí do chính nỗi sợ hãi tự thắt chặt; hãy nhận ra sợi dây trói vốn rất lỏng lẻo và tự bước ra.',
        time_prediction: '8 tuần hoặc giai đoạn cần tự cởi trói tâm lý (Song Tử: 21/5 - 31/5).'
    },
    'swords-9': {
        archetype_story: 'Người ôm mặt khóc than trên giường ngủ giữa đêm đen u tối với chín thanh kiếm treo trên tường đầu giường. Cơn ác mộng nửa đêm, sự ân hận và nỗi dằn vặt tâm can quá mức.',
        yes_no_result: 'NO',
        yes_no_reason: 'Cơn ác mộng nửa đêm và nỗi lo lắng bi kịch hóa; thực tế không tồi tệ như tâm trí bạn thêu dệt, hãy bật đèn thức dậy.',
        time_prediction: '9 tuần hoặc trong những đêm mất ngủ (khoảng 1/6 - 10/6).'
    },
    'swords-10': {
        archetype_story: 'Người đàn ông gục ngã trên bờ biển với mười thanh kiếm đâm dọc sống lưng, nhưng phía chân trời xa mây đen đang tan và ánh bình minh vàng hé lộ. Điểm chạm đáy của đau thương và sự tái sinh.',
        yes_no_result: 'NO',
        yes_no_reason: 'Đã chạm đáy nỗi đau cũ; không thể rơi sâu hơn được nữa, chu kỳ cũ đã chết và ánh bình minh tái sinh đang ló rạng.',
        time_prediction: '10 tuần hoặc thời điểm kết thúc triệt để chu kỳ cũ (khoảng 11/6 - 20/6).'
    },
    'swords-11': {
        archetype_story: 'Chàng trai đứng trên đỉnh đồi lộng gió cầm kiếm giương cao với ánh mắt sắc lạnh cảnh giác. Tinh thần tò mò, trí tuệ sắc sảo, thích khám phá sự thật nhưng cần cẩn trọng lời ăn tiếng nói.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Tính tò mò, thăm dò thông tin và sự sắc sảo nhưng còn thiếu trải nghiệm thực tế; cần thận trọng phát ngôn.',
        time_prediction: 'Vài ngày đến 1 tuần hoặc mùa Khí.'
    },
    'swords-12': {
        archetype_story: 'Kỵ sĩ cưỡi ngựa chiến phi như gió lốc giữa bầu trời mây rách, vung kiếm lao thẳng vào kẻ thù. Đại diện cho sự quyết liệt, thông minh vượt trội nhưng dễ rơi vào hiếu chiến và tàn nhẫn.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Tốc độ lao đi như bão táp nhưng quá nóng nảy và thiếu suy tính; cẩn thận va chạm gây tổn thương đôi bên.',
        time_prediction: 'Cực kỳ nhanh chóng trong vài ngày tới.'
    },
    'swords-13': {
        archetype_story: 'Hoàng hậu ngồi trên ngai vàng khắc hình bướm và thiên thần, một tay cầm kiếm thẳng đứng, một tay đưa ra phía trước. Sự sáng suốt, từng trải qua đau thương để đạt được lý trí thép và sự độc lập.',
        yes_no_result: 'YES',
        yes_no_reason: 'Lý trí sắc bén như dao cạo, phân định đúng sai công tâm và sự độc lập kiên cường giúp bạn vượt qua sóng gió.',
        time_prediction: 'Khoảng 1 tháng hoặc mùa thu se lạnh.'
    },
    'swords-14': {
        archetype_story: 'Vị vua ngồi trên ngai cao giữa bầu trời trong vắt, tay cầm gươm báu công lý với ánh nhìn uy nghiêm thấu suốt tâm can. Bậc thầy tư duy phân tích, quy chuẩn luật lệ và sự thật tối thượng.',
        yes_no_result: 'YES',
        yes_no_reason: 'Bậc thầy tư duy chiến lược, sự thật khách quan và uy tín lãnh đạo bằng công lý đưa ra kết luận chuẩn xác.',
        time_prediction: 'Khoảng 1 - 2 tháng hoặc mùa đông lập thu.'
    },

    // 4. BỘ TIỀN (PENTACLES - ĐẤT - NĂM / MÙA ĐÔNG)
    'pentacles-1': {
        archetype_story: 'Bàn tay vũ trụ chìa đồng tiền vàng lấp lánh ra từ đám mây trên khu vườn sum suê hoa cỏ dẫn lối qua cổng vòm. Hạt mầm vật chất màu mỡ, cơ hội đầu tư tài chính và phước lành thực tế.',
        yes_no_result: 'YES',
        yes_no_reason: 'Hạt mầm tài chính, cơ hội đầu tư và sự thịnh vượng thực tế đang được vũ trụ trao tận tay bạn; hãy đón nhận.',
        time_prediction: '1 năm hoặc mùa đông (Ma Kết).'
    },
    'pentacles-2': {
        archetype_story: 'Chàng trai nhún nhảy trên bờ biển tung hứng hai đồng tiền vàng trong vòng vô cực (Lemniscate) trong khi tàu bè chao đảo trên sóng dữ. Khả năng thích ứng linh hoạt và giữ thăng bằng giữa biến động.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Bạn đang tung hứng giữa hai dòng tiền hoặc hai trách nhiệm; cần linh hoạt thích ứng giữ thăng bằng thay vì phân tâm.',
        time_prediction: '2 năm hoặc giai đoạn biến động tài chính ngắn hạn (khoảng 22/12 - 31/12).'
    },
    'pentacles-3': {
        archetype_story: 'Người thợ điêu khắc chăm chú hoàn thiện thánh đường dưới sự bàn bạc của nhà sư và kiến trúc sư cầm bản vẽ. Tinh thần hợp tác chuyên môn, rèn luyện tay nghề bậc thầy và xây dựng công trình vĩ đại.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sự hợp tác nhóm ăn ý, tay nghề chuyên môn cao được công nhận và công trình xây dựng đạt chuẩn mực vững bền.',
        time_prediction: '3 năm hoặc mùa xuân/thu hoạch công trình (khoảng 1/1 - 10/1).'
    },
    'pentacles-4': {
        archetype_story: 'Người đàn ông ngồi ôm chặt đồng tiền trước ngực, hai đồng tiền dưới chân và một đồng trên vương miện, phía sau là thành phố sầm uất. Nỗi sợ mất mát của cải dẫn đến sự bo bo giữ của và bế tắc.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Bám víu quá mức vào tiền bạc và an toàn ảo giác; sự keo kiệt sẽ chặn đứng dòng chảy thịnh vượng mới.',
        time_prediction: '4 năm hoặc giai đoạn tích lũy phòng thủ (khoảng 11/1 - 19/1).'
    },
    'pentacles-5': {
        archetype_story: 'Hai kẻ hành khất tàn tật lầm lũi bước qua bão tuyết bên ngoài cửa sổ kính màu ấm áp của thánh đường. Cảm giác bị bỏ rơi, nghèo đói và mù quáng không nhận ra sự giúp đỡ ngay bên cạnh.',
        yes_no_result: 'NO',
        yes_no_reason: 'Cảm giác thiếu thốn, cô độc trong đêm đông giá rét; hãy nhìn lên cửa sổ thánh đường ấm áp đón nhận sự trợ giúp.',
        time_prediction: '5 năm hoặc đỉnh điểm mùa đông giá rét (Kim Ngưu: 20/4 - 30/4).'
    },
    'pentacles-6': {
        archetype_story: 'Thương nhân giàu có cầm chiếc cân công lý ban phát tiền bạc cho hai người khốn khó dưới chân. Quy luật lưu thông của tiền bạc, sự hào phóng chính trực và luật nhân quả về vật chất.',
        yes_no_result: 'YES',
        yes_no_reason: 'Dòng chảy cho và nhận hào phóng, sự bảo trợ từ quý nhân và sự cân bằng tài chính công bằng.',
        time_prediction: '6 năm hoặc thời điểm nhận được khoản hỗ trợ/thưởng (khoảng 1/5 - 10/5).'
    },
    'pentacles-7': {
        archetype_story: 'Người nông dân dừng cuốc ngắm nhìn giàn nho trĩu bảy đồng tiền vàng với ánh mắt trầm tư. Giai đoạn kiên nhẫn chờ đợi hạt giống sinh sôi, đánh giá tiến độ trước mùa gặt lớn.',
        yes_no_result: 'MAYBE',
        yes_no_reason: 'Thời điểm dừng tay đánh giá lại thành quả lao động; kiên nhẫn chờ quả chín, không nên vội vã hái non.',
        time_prediction: '7 năm hoặc mùa thu hoạch sau chuỗi ngày vun xới (khoảng 11/5 - 20/5).'
    },
    'pentacles-8': {
        archetype_story: 'Người thợ thủ công trẻ tuổi cần mẫn ngồi đục chạm từng đồng tiền vàng treo thành hàng ngay ngắn trên cột gỗ. Sự kỷ luật thép, tinh thần cầu toàn rèn giũa kỹ năng và đạo đức nghề nghiệp.',
        yes_no_result: 'YES',
        yes_no_reason: 'Sự cần mẫn mài giũa kỹ năng, chăm chỉ học nghề từng ngày sẽ xây đắp thành công bậc thầy vững chãi.',
        time_prediction: '8 năm hoặc quá trình rèn luyện tính bằng nhiều tháng/năm (Xử Nữ: 23/8 - 1/9).'
    },
    'pentacles-9': {
        archetype_story: 'Quý bà thanh lịch dạo bước trong vườn nho trĩu quả với chú chim ưng đậu trên tay và chú ốc sên dưới chân. Đỉnh cao của sự độc lập tự chủ, thành tựu tài chính cá nhân và cuộc sống an nhàn quý phái.',
        yes_no_result: 'YES',
        yes_no_reason: 'Tự do tài chính, độc lập tự chủ và phong thái quý phái tận hưởng khu vườn thành quả của chính mình.',
        time_prediction: '9 năm hoặc mùa thu hoạch thịnh vượng (khoảng 2/9 - 11/9).'
    },
    'pentacles-10': {
        archetype_story: 'Ba thế hệ gia tộc sum vầy trước cổng dinh thự cổ kính cùng hai chú chó cưng dưới vòm cây sự sống kết bằng mười đồng tiền vàng. Sự hưng thịnh vững bền của gia tộc và di sản truyền đời.',
        yes_no_result: 'YES',
        yes_no_reason: 'Gia tộc hưng vượng, nền móng vững chắc qua nhiều thế hệ và di sản vật chất viên mãn dài lâu.',
        time_prediction: '10 năm hoặc mục tiêu lâu dài nhiều thế hệ (khoảng 12/9 - 22/9).'
    },
    'pentacles-11': {
        archetype_story: 'Chàng thiếu niên chăm chú nâng niu đồng tiền vàng giữa cánh đồng xanh mướt dưới trời quang đãng. Tinh thần học nghề thực tế, tính cẩn trọng và khát khao tích lũy tri thức ứng dụng.',
        yes_no_result: 'YES',
        yes_no_reason: 'Khát khao học hỏi thực tế, sự chăm chỉ tích lũy và tin vui khởi sắc về công việc/tiền bạc.',
        time_prediction: 'Vài tuần đến vài tháng hoặc mùa Đất.'
    },
    'pentacles-12': {
        archetype_story: 'Kỵ sĩ ngồi trên lưng chiến mã đen đứng trầm mặc giữa cánh đồng cày xới, tay cầm đồng tiền với sự kiên định tối thượng. Đại diện cho sự bền bỉ phi thường, phương châm chậm mà chắc và sự trung thành tuyệt đối.',
        yes_no_result: 'YES',
        yes_no_reason: 'Chậm mà chắc, tính kiên định và trách nhiệm chu đáo tuyệt đối; thành quả bền vững như bàn thạch.',
        time_prediction: 'Diễn tiến chậm rãi trong vài tháng đến 1 năm.'
    },
    'pentacles-13': {
        archetype_story: 'Hoàng hậu ngồi trên ngai vàng trạm trổ giữa cỏ hoa sum suê ôm đồng tiền vàng với tình thương bao la, bên cạnh là chú thỏ hoang dã. Biểu tượng của người phụ nữ đảm đang, thịnh vượng và nuôi dưỡng gia đình sung túc.',
        yes_no_result: 'YES',
        yes_no_reason: 'Người mẹ đảm đang nuôi dưỡng, quản lý tài chính khéo léo và mang lại sự sung túc ấm êm cho tổ ấm.',
        time_prediction: 'Khoảng vài tháng đến 1 năm hoặc mùa đông ấm áp.'
    },
    'pentacles-14': {
        archetype_story: 'Vị vua ngồi trên ngai khắc hình đầu bò đực giữa lâu đài nguy nga và vườn nho vàng óng, áo choàng thêu chùm nho trù phú. Bậc thầy làm chủ vật chất, đỉnh cao thành đạt kinh doanh và sự thịnh vượng vững chắc.',
        yes_no_result: 'YES',
        yes_no_reason: 'Đế chế tài chính hùng mạnh, bậc thầy làm chủ đồng tiền và uy tín kinh doanh vững chãi tối thượng.',
        time_prediction: 'Khoảng 1 năm hoặc thời điểm chốt sổ gặt hái thành công lớn.'
    }
};

// 3. Map suit element to standard (Lửa / Nước / Khí / Đất / None)
function getStandardSuitElement(card) {
    if (card.suit === 'wands') return 'Lửa';
    if (card.suit === 'cups') return 'Nước';
    if (card.suit === 'swords') return 'Khí';
    if (card.suit === 'pentacles') return 'Đất';
    if (card.element) {
        if (['Lửa', 'Nước', 'Khí', 'Đất'].includes(card.element)) return card.element;
    }
    return 'None';
}

// 4. Enrich all cards
const enrichedCards = currentCards.map(c => {
    const enrichment = KNOWLEDGE_ENRICHMENT[c.id] || {
        archetype_story: 'Nguyên mẫu năng lượng tâm lý học phản chiếu trạng thái tâm thức con người trong hành trình cuộc đời.',
        yes_no_result: 'YES',
        yes_no_reason: 'Năng lượng lá bài chỉ dẫn hành động tích cực theo trực giác bản thân.',
        time_prediction: 'Trong tương lai gần khi hội tụ đủ điều kiện thực tế.'
    };

    const suitElement = getStandardSuitElement(c);

    return {
        ...c,
        suitElement: suitElement,
        archetype_story: enrichment.archetype_story,
        yes_no_result: enrichment.yes_no_result,
        yes_no_reason: enrichment.yes_no_reason,
        time_prediction: enrichment.time_prediction
    };
});

console.log('Enriched cards count:', enrichedCards.length);

// 5. Write back to tarot_book.json & tarot_book.js
fs.writeFileSync(path.join(ROOT_DIR, 'data', 'tarot_book.json'), JSON.stringify(enrichedCards, null, 2), 'utf8');
const jsContent = `// Tự động sinh từ 3 nguồn: "Tarot Chú Giải" + "Hành Trình Tarot" + "Dự Đoán Thời Gian - Philippe Ngô"
window.TAROT_BOOK_DATA = ${JSON.stringify(enrichedCards, null, 2)};
`;
fs.writeFileSync(path.join(ROOT_DIR, 'src', 'tarot_book.js'), jsContent, 'utf8');
console.log('Updated tarot_book.json and tarot_book.js successfully.');

// 6. Generate Database.sql (Đúng 2 bảng: TarotCard và ReadingSession)
const databaseSql = `-- ==============================================================================
-- DỰ ÁN: TAROTCUAHALLE (HỆ THỐNG LUẬN GIẢI TAROT & THEO DÕI PHIÊN TRẢI BÀI)
-- FILE: Database.sql
-- MÔ TẢ: Khởi tạo cấu trúc cơ sở dữ liệu MySQL chuẩn (ENGINE=InnoDB DEFAULT CHARSET=utf8mb4)
-- TÍCH HỢP 3 NGUỒN TRI THỨC CỐT LÕI:
--   1. Sách "Tarot Chú Giải" (Phùng Lâm): Cấu trúc 78 lá, từ khóa, nghĩa xuôi & ngược.
--   2. Sách "Hành Trình Tarot": Câu chuyện nguyên mẫu tâm lý học & định hướng Yes/No chiều sâu.
--   3. Tài liệu "Dự đoán thời gian trong Tarot - Philippe Ngô": Mốc thời gian dự đoán.
-- GỒM ĐÚNG 2 BẢNG:
--   - TarotCard: Bảng lưu trữ 78 lá bài Tarot tích hợp 3 nguồn tri thức.
--   - ReadingSession: Bảng theo dõi lịch sử phiên trải bài (Tracking KMS).
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS \`tarot_db\`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE \`tarot_db\`;

-- Xóa bảng cũ theo thứ tự quan hệ khóa ngoại
DROP TABLE IF EXISTS \`ReadingSession\`;
DROP TABLE IF EXISTS \`TarotCard\`;

-- ==============================================================================
-- 1. BẢNG TarotCard (Danh mục 78 lá bài Tarot tích hợp 3 nguồn tri thức cốt lõi)
-- ==============================================================================
CREATE TABLE \`TarotCard\` (
    \`card_id\` VARCHAR(50) NOT NULL COMMENT 'Mã lá bài duy nhất (Primary Key, VD: major-0, wands-1)',
    \`name_vi\` VARCHAR(100) NOT NULL COMMENT 'Tên tiếng Việt đầy đủ của lá bài',
    \`name_en\` VARCHAR(100) NOT NULL COMMENT 'Tên tiếng Anh chuẩn quốc tế của lá bài',
    \`arcana_type\` VARCHAR(20) NOT NULL COMMENT 'Phân loại bộ ẩn: Major (Ẩn Chính) hoặc Minor (Ẩn Phụ)',
    \`suit_element\` VARCHAR(20) DEFAULT 'None' COMMENT 'Nguyên tố: Lửa / Nước / Khí / Đất / None',
    \`keywords\` TEXT DEFAULT NULL COMMENT 'Từ khóa cốt lõi trích từ sách Tarot Chú Giải',
    \`upright_meaning\` MEDIUMTEXT DEFAULT NULL COMMENT 'Ý nghĩa chiều xuôi trích từ sách Tarot Chú Giải',
    \`reversed_meaning\` MEDIUMTEXT DEFAULT NULL COMMENT 'Ý nghĩa chiều ngược trích từ sách Tarot Chú Giải',
    \`archetype_story\` MEDIUMTEXT DEFAULT NULL COMMENT 'Câu chuyện nguyên mẫu tâm lý học trích từ sách Hành Trình Tarot',
    \`yes_no_result\` VARCHAR(10) NOT NULL COMMENT 'Định hướng câu hỏi Có/Không (YES / NO / MAYBE)',
    \`yes_no_reason\` TEXT DEFAULT NULL COMMENT 'Lý do tâm lý/triết lý giải thích kết quả Yes/No từ Hành Trình Tarot',
    \`time_prediction\` VARCHAR(255) DEFAULT NULL COMMENT 'Mốc thời gian dự đoán sự việc từ tài liệu Philippe Ngô',
    \`image_path\` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn file ảnh lá bài (VD: cards/the_fool.jpg)',
    PRIMARY KEY (\`card_id\`),
    KEY \`idx_arcana\` (\`arcana_type\`),
    KEY \`idx_suit_element\` (\`suit_element\`),
    KEY \`idx_yes_no\` (\`yes_no_result\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu trữ thông tin 78 lá bài Tarot tích hợp 3 nguồn tri thức';

-- ==============================================================================
-- 2. BẢNG ReadingSession (Theo dõi phiên trải bài - Tracking KMS)
-- ==============================================================================
CREATE TABLE \`ReadingSession\` (
    \`session_id\` VARCHAR(50) NOT NULL COMMENT 'Mã định danh duy nhất của phiên trải bài (Primary Key)',
    \`user_question\` TEXT NOT NULL COMMENT 'Nội dung câu hỏi hoặc tâm sự của người dùng',
    \`topic\` VARCHAR(50) DEFAULT NULL COMMENT 'Chủ đề: general, love, work, finance, exam...',
    \`card_1_id\` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 1 (Quá khứ / Căn nguyên)',
    \`card_2_id\` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 2 (Hiện tại / Thử thách & Nút thắt)',
    \`card_3_id\` VARCHAR(50) DEFAULT NULL COMMENT 'Lá bài 3 (Tương lai / Lời khuyên dẫn lối)',
    \`reading_result\` LONGTEXT DEFAULT NULL COMMENT 'Nội dung bài luận giải chi tiết từ hệ thống/AI',
    \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm diễn ra phiên trải bài',
    PRIMARY KEY (\`session_id\`),
    KEY \`idx_card_1\` (\`card_1_id\`),
    KEY \`idx_card_2\` (\`card_2_id\`),
    KEY \`idx_card_3\` (\`card_3_id\`),
    KEY \`idx_created_at\` (\`created_at\`),
    CONSTRAINT \`fk_session_card1\` FOREIGN KEY (\`card_1_id\`) 
        REFERENCES \`TarotCard\` (\`card_id\`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT \`fk_session_card2\` FOREIGN KEY (\`card_2_id\`) 
        REFERENCES \`TarotCard\` (\`card_id\`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT \`fk_session_card3\` FOREIGN KEY (\`card_3_id\`) 
        REFERENCES \`TarotCard\` (\`card_id\`) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng theo dõi lịch sử phiên trải bài Tarot (Tracking KMS)';

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(path.join(ROOT_DIR, 'data', 'database', 'Database.sql'), databaseSql, 'utf8');
console.log('Generated 04-Database/Database.sql successfully.');

// 7. Generate Sample_Data.sql
function escapeSql(val) {
    if (val === null || val === undefined) return 'NULL';
    const s = String(val)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
    return `'${s}'`;
}

let sampleSql = `-- ==============================================================================
-- DỰ ÁN: TAROTCUAHALLE
-- FILE: Sample_Data.sql
-- MÔ TẢ: Dữ liệu nạp mẫu (Seed Data) chuẩn MySQL cho bảng TarotCard và ReadingSession
-- TÍCH HỢP TRỌN BỘ 78 LÁ BÀI TỪ 3 NGUỒN TRI THỨC CỐT LÕI:
--   1. Tarot Chú Giải (Từ khóa, nghĩa xuôi, nghĩa ngược)
--   2. Hành Trình Tarot (Câu chuyện nguyên mẫu & Yes/No lý giải tâm lý)
--   3. Dự đoán thời gian trong Tarot - Philippe Ngô (Mốc thời gian dự đoán)
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE \`tarot_db\`;

-- ------------------------------------------------------------------------------
-- 1. NẠP DỮ LIỆU TOÀN BỘ 78 LÁ BÀI TAROT VÀO BẢNG: TarotCard
-- ------------------------------------------------------------------------------
`;

enrichedCards.forEach((c, index) => {
    const cardId = c.id;
    const nameVi = c.nameVi;
    const nameEn = c.nameEn;
    const arcanaType = c.arcana;
    const suitElement = c.suitElement;
    const keywords = Array.isArray(c.keywords) ? c.keywords.join(', ') : (c.keywords || '');
    const uprightMeaning = c.upright || '';
    const reversedMeaning = c.reversed || '';
    const archetypeStory = c.archetype_story || '';
    const yesNoResult = c.yes_no_result || 'YES';
    const yesNoReason = c.yes_no_reason || '';
    const timePrediction = c.time_prediction || '';
    const imagePath = c.image || '';

    sampleSql += `-- [${index + 1}/78] ${c.id}: ${c.nameEn} (${c.nameVi})\n`;
    sampleSql += `INSERT INTO \`TarotCard\` (\`card_id\`, \`name_vi\`, \`name_en\`, \`arcana_type\`, \`suit_element\`, \`keywords\`, \`upright_meaning\`, \`reversed_meaning\`, \`archetype_story\`, \`yes_no_result\`, \`yes_no_reason\`, \`time_prediction\`, \`image_path\`) ` +
                 `VALUES (${escapeSql(cardId)}, ${escapeSql(nameVi)}, ${escapeSql(nameEn)}, ${escapeSql(arcanaType)}, ${escapeSql(suitElement)}, ${escapeSql(keywords)}, ${escapeSql(uprightMeaning)}, ${escapeSql(reversedMeaning)}, ${escapeSql(archetypeStory)}, ${escapeSql(yesNoResult)}, ${escapeSql(yesNoReason)}, ${escapeSql(timePrediction)}, ${escapeSql(imagePath)}) ` +
                 `ON DUPLICATE KEY UPDATE \`name_vi\` = VALUES(\`name_vi\`), \`name_en\` = VALUES(\`name_en\`), \`arcana_type\` = VALUES(\`arcana_type\`), \`suit_element\` = VALUES(\`suit_element\`), \`keywords\` = VALUES(\`keywords\`), \`upright_meaning\` = VALUES(\`upright_meaning\`), \`reversed_meaning\` = VALUES(\`reversed_meaning\`), \`archetype_story\` = VALUES(\`archetype_story\`), \`yes_no_result\` = VALUES(\`yes_no_result\`), \`yes_no_reason\` = VALUES(\`yes_no_reason\`), \`time_prediction\` = VALUES(\`time_prediction\`), \`image_path\` = VALUES(\`image_path\`);\n\n`;
});

sampleSql += `-- ------------------------------------------------------------------------------
-- 2. NẠP BẢN GHI MẪU PHIÊN TRẢI BÀI VÀO BẢNG: ReadingSession (Tracking KMS)
-- ------------------------------------------------------------------------------
INSERT INTO \`ReadingSession\` (
    \`session_id\`,
    \`user_question\`,
    \`topic\`,
    \`card_1_id\`,
    \`card_2_id\`,
    \`card_3_id\`,
    \`reading_result\`,
    \`created_at\`
) VALUES (
    'session-kms-sample-01',
    'Tôi có nên bắt đầu dự án khởi nghiệp công nghệ trong tháng này không và khi nào sự việc sẽ đạt được kết quả thuận lợi?',
    'work',
    'major-0',
    'wands-1',
    'major-1',
    '【BÁO CÁO PHIÊN TRẢI BÀI TAROTCUAHALLE - HỆ THỐNG TRI THỨC 3 NGUỒN】\\n\\n1. QUYẾT ĐỊNH YES/NO TỔNG HỢP: YES (Khẳng định mạnh mẽ)\\n- Lý giải tâm lý: Lá The Fool mở ra tiềm năng vô hạn, Ace of Wands bùng cháy ngọn lửa nhiệt huyết và The Magician khẳng định bạn đã hội tụ đầy đủ nguồn lực cùng kỹ năng để biến ý niệm thành hiện thực.\\n\\n2. MỐC THỜI GIAN DỰ ĐOÁN (Theo Philippe Ngô):\\n- Khởi phát: Ngay lập tức trong vòng vài ngày tới (Ace of Wands - Lửa/Ngày).\\n- Đạt đỉnh thành tựu: Chu kỳ mùa xuân hoặc trong vòng 1 - 2 tuần khi bắt tay vào hành động cụ thể.\\n\\n3. BÀI HỌC NGUYÊN MẪU & HÀNH TRÌNH TÂM THỨC:\\n- Căn nguyên (The Fool): Đứa trẻ thuần khiết dám bước ra khỏi vùng an toàn.\\n- Hiện tại (Ace of Wands): Ngọn lửa ý chí đã được vũ trụ trao tận tay.\\n- Tương lai (The Magician): Làm chủ 4 nguyên tố để định hình thực tại thành công.',
    NOW()
) ON DUPLICATE KEY UPDATE
    \`user_question\` = VALUES(\`user_question\`),
    \`topic\` = VALUES(\`topic\`),
    \`reading_result\` = VALUES(\`reading_result\`);

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync(path.join(ROOT_DIR, 'data', 'database', 'Sample_Data.sql'), sampleSql, 'utf8');
console.log('Generated 04-Database/Sample_Data.sql successfully.');
