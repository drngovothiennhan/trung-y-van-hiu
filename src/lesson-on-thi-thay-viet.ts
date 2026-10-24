// Ôn thi học phần Trung văn chuyên ngành — nội dung buổi 24/10/2026 (Thầy Việt).
// Gồm: Tạng phủ (Phần I–II, đáp án tham khảo, Thầy chưa chấm) và Khí – Huyết – Tân dịch (Phần I–IV, đáp án Thầy Việt).
// Phần điền khuyết chỉ hiện trong Thư viện (không có đáp án nhiễu để làm trắc nghiệm).
// Data only.

type Q = { q: string; o: string[]; a: number; explain: string; source: string; category: string };

const SRC = "Ôn thi học phần · Thầy Việt";
const CAT_TP = "Ôn thi · Tạng phủ (đáp án tham khảo)";
const CAT_KH = "Ôn thi · Khí huyết tân dịch (đáp án Thầy Việt)";

// Đúng/Sai: a = 0 (Đúng) hoặc 1 (Sai). Hai lựa chọn không xáo trộn ở đây; app tự xáo khi làm bài.
const tf = (statement: string, isTrue: boolean, explain: string, category: string): Q => ({
  q: statement,
  o: ["Đúng (√)", "Sai (×)"],
  a: isTrue ? 0 : 1,
  explain,
  source: SRC,
  category,
});

// Trắc nghiệm A–D: key là chỉ số (0–3) của đáp án đúng.
const mc = (question: string, options: string[], key: number, category: string): Q => ({
  q: question,
  o: options,
  a: key,
  explain: "Đáp án đúng: " + options[key],
  source: SRC,
  category,
});

// Đúng/Sai theo mục Khí huyết tân dịch (Phần II): A = 正确, B = 错误.
const tfKH = (statement: string, key: "A" | "B", explain = ""): Q =>
  tf(statement, key === "A", explain || (key === "A" ? "Đáp án Thầy Việt: A (正确)." : "Đáp án Thầy Việt: B (错误)."), CAT_KH);

// ---------- Tạng phủ · Phần I (√ / ×) ----------
export const onThiTangPhuTF: Q[] = [
  tf("五脏包括心、肝、脾、肺、肾。", true, "五脏: 心、肝、脾、肺、肾.", CAT_TP),
  tf("六腑包括胆、胃、小肠、大肠、膀胱和三焦。", true, "六腑: 胆、胃、小肠、大肠、膀胱、三焦.", CAT_TP),
  tf("五脏的主要生理功能是传化水谷。", false, "传化水谷 là chức năng của lục phủ; ngũ tạng là sinh hóa và tàng trữ tinh khí.", CAT_TP),
  tf("六腑的主要生理特点是藏精气而不泻。", false, "藏精气而不泻 là đặc điểm của ngũ tạng; lục phủ là 传化物而不藏.", CAT_TP),
  tf("奇恒之腑包括脑、髓、骨、脉、胆和女子胞。", true, "奇恒之腑: 脑、髓、骨、脉、胆、女子胞.", CAT_TP),
  tf("胆既属于六腑，又属于奇恒之腑。", true, "Mật vừa thuộc lục phủ, vừa thuộc kỳ hằng chi phủ.", CAT_TP),
  tf("心主血脉，并在志为喜。", true, "心主血脉; 在志为喜.", CAT_TP),
  tf("肺主气，司呼吸，并主宣发肃降。", true, "Phế chủ khí, tư hô hấp, chủ tuyên phát túc giáng.", CAT_TP),
  tf("脾主运化，包括运化水谷和运化水湿。", true, "Tỳ chủ vận hóa thủy cốc và thủy thấp.", CAT_TP),
  tf("肾主藏精，主水，并主纳气。", true, "Thận chủ tàng tinh, chủ thủy, chủ nạp khí.", CAT_TP),
  tf("肝的主要生理功能是主运化和统血。", false, "Can chủ sơ tiết và tàng huyết; 运化、统血 là của Tỳ.", CAT_TP),
  tf("胃主受纳和腐熟水谷。", true, "Vị chủ thụ nạp và hủ thục thủy cốc.", CAT_TP),
  tf("小肠主受盛化物和泌别清浊。", true, "Tiểu trường chủ thụ thịnh hóa vật và phân biệt thanh trọc.", CAT_TP),
  tf("大肠的主要功能是贮存和排泄尿液。", false, "Đại trường chủ truyền hóa tạp chất; 贮尿排尿 là của Bàng quang.", CAT_TP),
  tf("膀胱的主要功能是贮尿和排尿。", true, "Bàng quang chủ tàng và xuất nước tiểu.", CAT_TP),
  tf("三焦是六腑之一，具有通行元气、运行水液的作用。", true, "Tam tiêu thông hành nguyên khí, vận hành thủy dịch.", CAT_TP),
  tf("脑属于五脏之一。", false, "Não thuộc 奇恒之腑, không thuộc ngũ tạng.", CAT_TP),
  tf("女子胞与月经和胎孕有密切关系。", true, "Nữ tử bào liên quan mật thiết đến kinh nguyệt và thai nghén.", CAT_TP),
  tf("五脏与六腑之间不存在表里关系。", false, "Tạng và phủ có quan hệ biểu lý.", CAT_TP),
  tf("心与小肠相表里，肺与大肠相表里。", true, "Tâm – tiểu trường, phế – đại trường là cặp biểu lý.", CAT_TP),
];

// ---------- Khí – Huyết – Tân dịch · Phần II (正确 / 错误) ----------
export const onThiKhiHuyetTF: Q[] = [
  tfKH("气是构成人体和维持人体生命活动的基本物质之一。", "A"),
  tfKH("气的运动只有升和降两种形式。", "B", "Khí vận động có 4 hình thức: 升、降、出、入."),
  tfKH("元气根源于肾，是人体最根本、最重要的气。", "A"),
  tfKH("宗气主要由肺吸入的清气和脾胃化生的水谷精气结合而成。", "A"),
  tfKH("营气主要运行于脉外，具有卫外功能。", "B", "Dinh khí vận hành trong mạch; vệ khí vận hành ngoài mạch và có tác dụng chống ngoại tà."),
  tfKH("卫气具有温养脏腑、肌肉和皮毛的作用。", "A"),
  tfKH("气虚一定会导致血瘀，但不会导致其他病理变化。", "B", "Khí hư có thể gây huyết ứ và nhiều biến đổi bệnh lý khác."),
  tfKH("血主要具有营养和滋润全身的作用。", "A"),
  tfKH("心主血脉与血液的正常运行密切相关。", "A"),
  tfKH("肝藏血的功能与调节血量有关。", "A"),
  tfKH("脾统血是指脾能够统摄血液，使其在脉中正常运行。", "A"),
  tfKH("血虚和血瘀是完全相同的病理状态。", "B", "Huyết hư và huyết ứ là hai trạng thái bệnh lý khác nhau."),
  tfKH("气滞可以影响血液运行，导致气滞血瘀。", "A"),
  tfKH("津液只分布于皮肤表面，不进入脏腑组织。", "B", "Tân dịch phân bố khắp cơ thể, vào cả tạng phủ và tổ chức."),
  tfKH("津液具有滋润和濡养脏腑、组织、官窍的作用。", "A"),
  tfKH("津液的生成与脾胃运化水谷精微的功能有关。", "A"),
  tfKH("肺、脾、肾在津液代谢过程中发挥重要作用。", "A"),
  tfKH("津液不足时，人体可能出现口渴、咽干和皮肤干燥。", "A"),
  tfKH("痰饮属于人体正常津液的一种。", "B", "Đàm ẩm là sản phẩm bệnh lý của tân dịch, không phải tân dịch bình thường."),
  tfKH("气、血、津液之间彼此孤立，没有相互影响。", "B", "Khí, huyết, tân dịch liên hệ và ảnh hưởng lẫn nhau."),
];

// ---------- Khí – Huyết – Tân dịch · Phần III (Hoa → Việt) ----------
export const onThiKhiHuyetHoaViet: Q[] = [
  mc("气是人体生命活动的动力。", ["Khí là động lực của hoạt động sống của cơ thể.", "Huyết là nguồn dinh dưỡng của cơ thể.", "Tân dịch là động lực của hoạt động sống.", "Khí chỉ có tác dụng bảo vệ cơ thể."], 0, CAT_KH),
  mc("气的运动称为气机。", ["Khí huyết gọi là khí cơ.", "Sự vận động của khí được gọi là khí cơ.", "Khí cơ chỉ sự vận động của huyết.", "Khí cơ là sự sinh thành của tân dịch."], 1, CAT_KH),
  mc("气有推动、温煦、防御、固摄和气化等作用。", ["Khí chỉ có tác dụng vận chuyển huyết.", "Khí có tác dụng thúc đẩy, ôn ấm, phòng ngự, cố nhiếp và khí hóa.", "Khí chỉ có tác dụng làm ấm cơ thể.", "Khí có tác dụng thanh nhiệt, giải độc và tiêu viêm."], 1, CAT_KH),
  mc("元气是人体最根本、最重要的气。", ["Nguyên khí là loại khí ít quan trọng nhất.", "Tông khí là khí duy nhất của cơ thể.", "Nguyên khí là loại khí căn bản và quan trọng nhất của cơ thể.", "Vệ khí là nguồn gốc của nguyên khí."], 2, CAT_KH),
  mc("宗气积于胸中，贯注于心肺。", ["Tông khí tích tụ ở ngực, liên hệ mật thiết với tâm và phế.", "Nguyên khí tích tụ ở bụng dưới.", "Vệ khí chỉ lưu hành trong mạch.", "Dinh khí tích tụ ở bàng quang."], 0, CAT_KH),
  mc("营气主要具有化生血液和营养全身的作用。", ["Dinh khí chủ yếu làm ấm da lông.", "Dinh khí chủ yếu hóa sinh huyết và nuôi dưỡng toàn thân.", "Vệ khí chủ yếu hóa sinh huyết.", "Nguyên khí chỉ có tác dụng bảo vệ."], 1, CAT_KH),
  mc("卫气运行于脉外，具有防御外邪的作用。", ["Vệ khí vận hành trong mạch, có tác dụng hóa huyết.", "Dinh khí vận hành ngoài mạch, có tác dụng làm mát.", "Vệ khí vận hành ngoài mạch, có tác dụng chống ngoại tà.", "Tông khí vận hành ngoài mạch, điều hòa tiêu hóa."], 2, CAT_KH),
  mc("气能生血，气能行血，气能摄血。", ["Khí có thể sinh huyết, thúc đẩy huyết vận hành và thống nhiếp huyết.", "Huyết có thể sinh khí nhưng không vận hành khí.", "Khí chỉ có thể hóa sinh tân dịch.", "Khí và huyết hoàn toàn độc lập."], 0, CAT_KH),
  mc("气虚无力推动血行，可形成血瘀。", ["Khí hư làm huyết vận hành quá nhanh.", "Khí hư không thể thúc đẩy huyết vận hành, có thể dẫn đến huyết ứ.", "Huyết ứ luôn do nhiệt thịnh.", "Khí hư chỉ gây mất ngủ."], 1, CAT_KH),
  mc("血具有营养和滋润全身的作用。", ["Huyết chỉ có tác dụng vận chuyển chất thải.", "Huyết có tác dụng nuôi dưỡng và làm nhuận toàn thân.", "Huyết chỉ lưu hành ở tạng tâm.", "Huyết không liên quan đến tinh thần."], 1, CAT_KH),
  mc("心主血脉。", ["Tâm chủ thần minh.", "Can chủ cân.", "Tâm chủ huyết mạch.", "Tỳ chủ vận hóa."], 2, CAT_KH),
  mc("肝藏血，能够调节血量。", ["Can tàng huyết, có thể điều tiết lượng huyết.", "Phế tàng huyết, điều tiết lượng khí.", "Tỳ tàng huyết, điều tiết tân dịch.", "Thận tàng huyết, điều tiết mồ hôi."], 0, CAT_KH),
  mc("脾统血，使血液不致溢出脉外。", ["Tỳ chủ sinh tân dịch.", "Tỳ thống huyết, giúp huyết không thoát ra ngoài mạch.", "Tỳ chủ sơ tiết.", "Tỳ chủ nạp khí."], 1, CAT_KH),
  mc("血虚可见面色苍白、头晕、心悸等症状。", ["Huyết ứ gây đau cố định là triệu chứng duy nhất.", "Huyết hư có thể gây mặt nhợt, chóng mặt và hồi hộp.", "Khí trệ gây phù toàn thân là biểu hiện đặc hiệu.", "Tân dịch dư thừa gây mất máu."], 1, CAT_KH),
  mc("津液是人体一切正常水液的总称。", ["Tân dịch là tên gọi chung của tất cả các chất dịch bình thường trong cơ thể.", "Tân dịch chỉ là nước tiểu.", "Tân dịch chỉ là nước bọt.", "Tân dịch là huyết ứ."], 0, CAT_KH),
  mc("津液具有滋润和濡养的作用。", ["Tân dịch có tác dụng làm khô tổ chức.", "Tân dịch có tác dụng làm ấm duy nhất.", "Tân dịch có tác dụng làm nhuận và nuôi dưỡng.", "Tân dịch chỉ tồn tại trong dạ dày."], 2, CAT_KH),
  mc("脾主运化水液。", ["Tỳ chủ tàng huyết.", "Tỳ chủ vận hóa thủy dịch.", "Tâm chủ vận hóa thủy dịch.", "Phế chủ tàng tinh."], 1, CAT_KH),
  mc("肺主宣发肃降，通调水道。", ["Phế chủ sơ tiết và tàng huyết.", "Can chủ tuyên phát túc giáng.", "Phế chủ tuyên phát túc giáng, thông điều thủy đạo.", "Thận chủ tuyên phát túc giáng."], 2, CAT_KH),
  mc("津液不足可导致口渴、咽干和便秘。", ["Tân dịch bất túc có thể gây khát, khô họng và táo bón.", "Tân dịch bất túc luôn gây tiêu chảy.", "Tân dịch bất túc chỉ gây đau lưng.", "Tân dịch bất túc không có triệu chứng."], 0, CAT_KH),
  mc("气、血、津液相互依存，共同维持人体生命活动。", ["Khí, huyết và tân dịch không có quan hệ với nhau.", "Khí, huyết, tân dịch phụ thuộc lẫn nhau, cùng duy trì hoạt động sống của cơ thể.", "Huyết thay thế hoàn toàn khí.", "Tân dịch không liên quan đến sinh lý cơ thể."], 1, CAT_KH),
];

// ---------- Khí – Huyết – Tân dịch · Phần IV (Việt → Hoa) ----------
export const onThiKhiHuyetVietHoa: Q[] = [
  mc("Khí là động lực duy trì hoạt động sống của cơ thể.", ["气是维持人体生命活动的动力。", "血是维持人体生命活动的动力。", "津液是人体唯一的动力。", "气只具有防御作用。"], 0, CAT_KH),
  mc("Sự vận động của khí gọi là khí cơ.", ["血液运行称为气机。", "气的运动称为气机。", "津液的生成称为气机。", "脏腑的形态称为气机。"], 1, CAT_KH),
  mc("Khí có tác dụng thúc đẩy, ôn ấm, phòng ngự, cố nhiếp và khí hóa.", ["气具有营养、滋润和藏血的作用。", "气只有温煦和防御作用。", "气具有推动、温煦、防御、固摄和气化等作用。", "血具有推动、固摄和气化的全部作用。"], 2, CAT_KH),
  mc("Nguyên khí là loại khí căn bản và quan trọng nhất của cơ thể.", ["宗气是人体最根本的气。", "卫气是人体最根本的气。", "营气是人体最根本的气。", "元气是人体最根本、最重要的气。"], 3, CAT_KH),
  mc("Tông khí tích tụ ở ngực, liên hệ mật thiết với tâm và phế.", ["宗气积于胸中，贯注于心肺。", "元气积于胸中，贯注于肝肾。", "卫气积于胸中，贯注于脾胃。", "营气积于胸中，贯注于膀胱。"], 0, CAT_KH),
  mc("Dinh khí có tác dụng hóa sinh huyết và nuôi dưỡng toàn thân.", ["卫气具有化生血液的主要作用。", "营气具有化生血液和营养全身的作用。", "宗气只具有防御作用。", "元气只具有温煦作用。"], 1, CAT_KH),
  mc("Vệ khí vận hành ngoài mạch, có tác dụng chống ngoại tà.", ["营气运行于脉外，抵御外邪。", "宗气运行于脉外，抵御外邪。", "卫气运行于脉外，具有防御外邪的作用。", "元气运行于脉外，专门化生血液。"], 2, CAT_KH),
  mc("Khí có thể sinh huyết, thúc đẩy huyết vận hành và thống nhiếp huyết.", ["血能生气，但不能推动血行。", "气只具有化生津液的作用。", "气不能影响血液运行。", "气能生血，气能行血，气能摄血。"], 3, CAT_KH),
  mc("Khí hư không đủ sức thúc đẩy huyết vận hành có thể dẫn đến huyết ứ.", ["气虚无力推动血行，可导致血瘀。", "血虚必然导致气逆。", "气盛必然导致血虚。", "津液不足必然导致血瘀。"], 0, CAT_KH),
  mc("Huyết có tác dụng nuôi dưỡng và làm nhuận toàn thân.", ["血只具有防御外邪的作用。", "血具有营养和滋润全身的作用。", "血只存在于肝脏。", "血不能濡养脏腑。"], 1, CAT_KH),
  mc("Tâm chủ huyết mạch.", ["肝主血脉。", "脾主血脉。", "心主血脉。", "肺主藏血。"], 2, CAT_KH),
  mc("Can tàng huyết, có thể điều tiết lượng huyết.", ["脾藏血，调节血量。", "肺藏血，调节血量。", "肾藏血，调节血量。", "肝藏血，能够调节血量。"], 3, CAT_KH),
  mc("Tỳ thống huyết, giúp huyết không thoát ra ngoài mạch.", ["脾统血，使血液不致溢出脉外。", "脾主疏泄，使血液运行加快。", "心统血，使津液不外泄。", "肺统血，使血液归藏于肾。"], 0, CAT_KH),
  mc("Huyết hư có thể gây mặt nhợt, chóng mặt và hồi hộp.", ["血瘀可见口渴、咽干和便秘。", "血虚可见面色苍白、头晕、心悸等症状。", "气滞可见皮肤干燥和尿少。", "津液不足可见面色苍白和心悸。"], 1, CAT_KH),
  mc("Tân dịch là tên gọi chung của các chất dịch bình thường trong cơ thể.", ["津液是人体一切异常水液的总称。", "津液只指汗液。", "津液是人体一切正常水液的总称。", "津液只存在于胃肠。"], 2, CAT_KH),
  mc("Tân dịch có tác dụng làm nhuận và nuôi dưỡng.", ["津液具有推动血行的唯一作用。", "津液具有固摄和防御的唯一作用。", "津液只具有温煦作用。", "津液具有滋润和濡养的作用。"], 3, CAT_KH),
  mc("Tỳ chủ vận hóa thủy dịch.", ["脾主运化水液。", "心主运化水液。", "肝主运化水液。", "肺主运化水液。"], 0, CAT_KH),
  mc("Phế chủ tuyên phát túc giáng, thông điều thủy đạo.", ["肾主宣发肃降，通调水道。", "肺主宣发肃降，通调水道。", "脾主宣发肃降，通调水道。", "心主宣发肃降，通调水道。"], 1, CAT_KH),
  mc("Tân dịch bất túc có thể gây khát, khô họng và táo bón.", ["津液充足可导致口渴、咽干和便秘。", "气虚可导致口渴、咽干和便秘。", "津液不足可导致口渴、咽干和便秘。", "血瘀可导致津液充足。"], 2, CAT_KH),
  mc("Khí, huyết và tân dịch phụ thuộc lẫn nhau, cùng duy trì hoạt động sống của cơ thể.", ["气、血、津液彼此独立，互不影响。", "气、血、津液只有一种具有生理作用。", "气、血、津液只参与消化功能。", "气、血、津液相互依存，共同维持人体生命活动。"], 3, CAT_KH),
];

export const onThiQuiz: Q[] = [
  ...onThiTangPhuTF,
  ...onThiKhiHuyetTF,
  ...onThiKhiHuyetHoaViet,
  ...onThiKhiHuyetVietHoa,
];

// ---------- Thư viện: nội dung đầy đủ (gồm cả điền khuyết và bảng đáp án) ----------
export const onThiPages = [
  {
    page: 1,
    label: "Ôn thi · Tạng phủ — Phần I, II (đáp án tham khảo)",
    text: `TẠNG PHỦ — PHẦN I. ĐÚNG (√) / SAI (×)
1. √  2. √  3. ×  4. ×  5. √  6. √  7. √  8. √  9. √  10. √
11. ×  12. √  13. √  14. ×  15. √  16. √  17. ×  18. √  19. ×  20. √

TẠNG PHỦ — PHẦN II. ĐIỀN VÀO CHỖ TRỐNG (đáp án tham khảo)
1. 奇恒之腑  2. 肾  3. 三焦  4. 藏精气  5. 不藏  6. 藏神 (主神明)  7. 藏血  8. 血  9. 宣发  10. 纳气
11. 腐熟  12. 泌别  13. 主津 (吸收水液)  14. 排泄  15. 元气  16. 女子胞  17. 小肠  18. 胆  19. 胃  20. 膀胱

Ghi chú: phần Tạng phủ chưa có đáp án chấm của Thầy Việt; đáp án trên là đáp án tham khảo theo giáo trình.`
  },
  {
    page: 2,
    label: "Ôn thi · Khí huyết tân dịch — Phần I điền trống (đáp án Thầy Việt)",
    text: `1. 防御  2. 滋润  3. 水液  4. 清气  5. 仓廪  6. 宗  7. 元气  8. 气机  9. 脱  10. 摄
11. 藏血  12. 血瘀  13. 气虚症状  14. 失眠  15. 不同  16. 三焦  17. 宣发肃降  18. 水肿  19. 大便干燥  20. 生命

Lưu ý: câu 1 — đề đã có 防御 ở cuối câu, nên 气化 (bài làm của bạn) có vẻ hợp lý hơn; nên hỏi lại Thầy.`
  },
  {
    page: 3,
    label: "Ôn thi · Khí huyết tân dịch — Bảng đáp án Phần II–IV (Thầy Việt)",
    text: `PHẦN II — ĐÚNG SAI (A = 正确, B = 错误)
1. A  2. B  3. A  4. A  5. B  6. A  7. B  8. A  9. A  10. A  11. A  12. B  13. A  14. B  15. A  16. A  17. A  18. A  19. B  20. B

PHẦN III — HOA SANG VIỆT
1. A  2. B  3. B  4. C  5. A  6. B  7. C  8. A  9. B  10. B  11. C  12. A  13. B  14. B  15. A  16. C  17. B  18. C  19. A  20. B

PHẦN IV — VIỆT SANG HOA
1. A  2. B  3. C  4. D  5. A  6. B  7. C  8. D  9. A  10. B  11. C  12. D  13. A  14. B  15. C  16. D  17. A  18. B  19. C  20. D`
  },
];

export const onThiSource = {
  id: "on-thi-thay-viet",
  title: "Ôn thi học phần — Thầy Việt (Tạng phủ, Khí huyết tân dịch)",
  pages: onThiPages,
  total: onThiPages.length,
  status: "Nạp buổi 24/10/2026: 80 câu trắc nghiệm (Tạng phủ 20 + Khí huyết tân dịch 60) và bảng đáp án; Tạng phủ chưa có đáp án chấm của Thầy."
};
