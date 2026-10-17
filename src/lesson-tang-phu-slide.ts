// Bài giảng (slide) "Tạng phủ" (脏腑) — ThS. Hàn Quốc Việt, HIU. Data only.
// Nguồn: file slide TANG_TUONG.pptx (slide 1–35): từ vựng slide 8–23, ngữ pháp slide 26–27,
// câu hỏi lượng giá slide 28–35, bài khóa slide 9–25.
// Phần câu hỏi điền khuyết / trả lời của slide được chuyển thành trắc nghiệm; đáp án lấy theo bài khóa trong slide.
// Các chỗ slide thiếu nghĩa hoặc có lỗi được ghi chú trong explain / status.

export const tangPhuSlidePages = [
  {
    page: 1,
    label: "Slide Tạng phủ · giới thiệu học phần",
    text: `TẠNG PHỦ (脏腑) — slide bài giảng
Học phần Trung văn chuyên ngành (3;0). Giảng viên: ThS. Hàn Quốc Việt.
Giáo trình chính: Lê Minh Hoàng, Giáo trình Trung văn chuyên ngành (NXB Y học, 2022).
Đánh giá: chuyên cần + kiểm tra thường xuyên 30%; thi kết thúc học phần 70% — trắc nghiệm.
Mục tiêu: (1) viết và nắm nghĩa từ mới; (2) dịch từ vựng Trung ↔ Việt; (3) đọc hiểu, dịch bài khóa; (4) dùng đúng cấu trúc 除了……以外 và 以上, 以下.
Bố cục: Bài khóa → Từ vựng → Ngữ pháp → Bài tập.`
  },
  {
    page: 2,
    label: "Slide Tạng phủ · khái niệm và Ngũ tạng",
    text: `脏腑是内脏的总称，包括五脏六腑和奇恒之腑三类。
Tạng phủ là tên gọi chung của nội tạng, gồm ba loại: ngũ tạng, lục phủ và kỳ hằng chi phủ.

五脏，就是心、肝、脾、肺、肾，都是内部充实组织，并有生化和储藏精、气、血、津液功能的脏器。
Ngũ tạng là tim, gan, lách, phổi, thận; đều là tổ chức nội bộ đầy đặc, có chức năng sinh hóa và tàng trữ tinh, khí, huyết, tân dịch.`
  },
  {
    page: 3,
    label: "Slide Tạng phủ · Lục phủ và Kỳ hằng chi phủ",
    text: `六腑，指胆、胃、小肠、大肠、三焦、膀胱，是一些中空腔的器官，具有出纳、输布、传化水谷的功能。
Lục phủ gồm mật, dạ dày, tiểu trường, đại trường, tam tiêu, bàng quang; là các cơ quan có khoang rỗng, có chức năng xuất nạp, thâu bố, truyền hóa thủy cốc.

奇恒之腑包括脑、髓、骨、脉、胆、女子胞（即子宫）六种组织器官。它们形体类似腑，但作用类似脏，所以叫奇恒之腑。
Kỳ hằng chi phủ gồm não, tủy, xương, mạch, mật, nữ tử bào (tức tử cung). Hình thể giống phủ nhưng tác dụng giống tạng nên gọi là kỳ hằng chi phủ.`
  },
  {
    page: 4,
    label: "Slide Tạng phủ · Đông y khác Tây y ở đâu",
    text: `中医脏腑学说中的心、肺、脾、肝、肾等脏器，虽然与现代医学脏器的名称相同，但在生理、病理的含义上，却不完全一样。
Các tạng tâm, phế, tỳ, can, thận trong học thuyết tạng phủ Đông y có tên gọi giống tạng của y học hiện đại, nhưng về ý nghĩa sinh lý và bệnh lý thì không hoàn toàn giống nhau.

Ví dụ tim (心): theo học thuyết tạng phủ, chức năng chính của tâm là:
(1) 心主血脉: 脉 là đường lưu thông của huyết dịch; tâm chủ huyết mạch nghĩa là tim có tác dụng thôi động huyết dịch vận hành trong mạch.
(2) 心藏神: 神 tức 神志, là hoạt động tinh thần và tư duy của con người.

所以中医所说的心，除了代表解剖学上的心以外，还包括了一部分神经系统，特别是大脑的某些功能。
Vì vậy tâm theo Đông y, ngoài đại diện cho tim theo giải phẫu học, còn bao gồm một phần hệ thần kinh, đặc biệt là một số chức năng của não.`
  },
  {
    page: 5,
    label: "Slide Tạng phủ · Tam tiêu",
    text: `只有六腑里面的三焦是中医学专有的名称。三焦分上焦、中焦和下焦。
Chỉ có tam tiêu trong lục phủ là tên gọi riêng của Đông y. Tam tiêu chia thành thượng tiêu, trung tiêu và hạ tiêu.

从部位来说，一般指横膈以上为上焦，包括心、肺；横膈以下到脐为中焦，包括脾和胃；脐以下为下焦，包括肝、肾、大肠、小肠和膀胱。
Xét theo vị trí: trên cơ hoành là thượng tiêu, gồm tâm và phế; từ cơ hoành đến rốn là trung tiêu, gồm tỳ và vị; dưới rốn là hạ tiêu, gồm can, thận, đại trường, tiểu trường và bàng quang.`
  },
  {
    page: 6,
    label: "Slide Tạng phủ · ngữ pháp 除了……以外 và 以上 / 以下",
    text: `Mẫu câu 除了……以外 (chú le … yǐ wài): ngoài …, ngoài … ra. Biểu thị ngoài cái gì ra còn có cái khác. Phía sau thường có 还、也、都 đi kèm.
Ví dụ: 在上焦除了心脏以外，还有肺脏和心包。
Ví dụ: 除了心和心包络以外，其他脏腑的命名都有“月”部。
Cũng dùng để biểu thị không bao gồm người hoặc sự việc đang nói đến.
Ví dụ: 这件事除了老张以外，我们都知道。

Mẫu câu A + 以上 / 以下 (yǐshàng / yǐxià): trở lên (phía trên) / trở xuống (phía dưới). Biểu thị từ mốc vị trí A trở lên hoặc trở xuống.
Ví dụ: 横膈以上为上焦。`
  },
  {
    page: 7,
    label: "Slide Tạng phủ · câu hỏi lượng giá",
    text: `Câu 1: viết từ đối nghĩa — 生理, 上焦, 无关, 以上, 充实.
Câu 2: viết các từ liên quan — ngũ tạng, lục phủ, kỳ hằng chi phủ, và "脏腑" gồm những loại nào.
Câu 3: điền khuyết theo bài khóa (định nghĩa, chức năng, phân chia tam tiêu).
Câu 4: trả lời các câu hỏi về khái niệm, chức năng, tâm, tam tiêu.
Câu 5: dịch sang tiếng Việt các câu bài khóa (đã chuyển thành bài đọc).`
  }
] as const;

const G = "Tạng phủ · Slide";
const GG = "Ngữ pháp · Tạng phủ";

export const tangPhuSlideTerms = [
  { hanzi: "内脏", pinyin: "nèizàng", hv: "nội tạng", meaning: "Nội tạng (cơ quan bên trong cơ thể)", group: G },
  { hanzi: "奇恒之腑", pinyin: "qí héng zhī fǔ", hv: "kỳ hằng chi phủ", meaning: "Phủ kỳ hằng: hình thể giống phủ, tác dụng giống tạng", group: G },
  { hanzi: "中空有腔", pinyin: "zhōngkōng yǒu qiāng", hv: "trung không hữu khang", meaning: "Có khoang rỗng bên trong (đặc điểm của lục phủ)", group: G },
  { hanzi: "充实", pinyin: "chōngshí", hv: "sung thực", meaning: "Tràn đầy, đặc (tổ chức nội bộ đầy đặc)", group: G },
  { hanzi: "空虚", pinyin: "kōngxū", hv: "không hư", meaning: "Rỗng, trống không (trái nghĩa với 充实)", group: G },
  { hanzi: "生化", pinyin: "shēnghuà", hv: "sinh hóa", meaning: "Tạo ra, sinh hóa", group: G },
  { hanzi: "储藏", pinyin: "chǔcáng", hv: "trữ tàng", meaning: "Tàng trữ, cất giữ", group: G },
  { hanzi: "精气", pinyin: "jīngqì", hv: "tinh khí", meaning: "Tinh và khí", group: G },
  { hanzi: "血液", pinyin: "xuèyè", hv: "huyết dịch", meaning: "Máu", group: G },
  { hanzi: "津液", pinyin: "jīnyè", hv: "tân dịch", meaning: "Tân dịch (dịch thể trong cơ thể)", group: G },
  { hanzi: "功能", pinyin: "gōngnéng", hv: "công năng", meaning: "Chức năng", group: G },
  { hanzi: "脏器", pinyin: "zàngqì", hv: "tạng khí", meaning: "Cơ quan nội tạng", group: G },
  { hanzi: "肝胆", pinyin: "gān dǎn", hv: "can đởm", meaning: "Tạng Can và phủ Đởm", group: G },
  { hanzi: "脾胃", pinyin: "pí wèi", hv: "tỳ vị", meaning: "Tạng Tỳ và phủ Vị", group: G },
  { hanzi: "小肠", pinyin: "xiǎocháng", hv: "tiểu trường", meaning: "Phủ Tiểu trường (ruột non)", group: G },
  { hanzi: "大肠", pinyin: "dàcháng", hv: "đại trường", meaning: "Phủ Đại trường (ruột già)", group: G },
  { hanzi: "三焦", pinyin: "sānjiāo", hv: "tam tiêu", meaning: "Phủ Tam tiêu (tên gọi riêng của Đông y)", group: G },
  { hanzi: "膀胱", pinyin: "pángguāng", hv: "bàng quang", meaning: "Phủ Bàng quang", group: G },
  { hanzi: "器官", pinyin: "qìguān", hv: "khí quan", meaning: "Cơ quan", group: G },
  { hanzi: "出纳", pinyin: "chūnà", hv: "xuất nạp", meaning: "Bài tiết và tiếp nhận", group: G },
  { hanzi: "输布", pinyin: "shū bù", hv: "thâu bố", meaning: "Vận chuyển, phân bố", group: G },
  { hanzi: "传化", pinyin: "chuán huà", hv: "truyền hóa", meaning: "Truyền tống, biến hóa", group: G },
  { hanzi: "水谷", pinyin: "shuǐgǔ", hv: "thủy cốc", meaning: "Đồ ăn thức uống", group: G },
  { hanzi: "脑髓", pinyin: "nǎosuǐ", hv: "não tủy", meaning: "Não và tủy", group: G },
  { hanzi: "女子胞", pinyin: "nǚzǐbāo", hv: "nữ tử bào", meaning: "Tử cung (còn gọi 子宫)", group: G },
  { hanzi: "子宫", pinyin: "zǐgōng", hv: "tử cung", meaning: "Tử cung", group: G },
  { hanzi: "形体", pinyin: "xíngtǐ", hv: "hình thể", meaning: "Hình thể, hình dáng cơ thể (slide để trống nghĩa — bổ sung)", group: G },
  { hanzi: "管道", pinyin: "guǎndào", hv: "quản đạo", meaning: "Đường ống, đường lưu thông", group: G },
  { hanzi: "推动", pinyin: "tuīdòng", hv: "thôi động", meaning: "Thúc đẩy, đẩy đi", group: G },
  { hanzi: "运行", pinyin: "yùnxíng", hv: "vận hành", meaning: "Lưu hành, chuyển động", group: G },
  { hanzi: "神志", pinyin: "shénzhì", hv: "thần chí", meaning: "Ý thức, tinh thần, tư duy (神)", group: G },
  { hanzi: "精神", pinyin: "jīngshén", hv: "tinh thần", meaning: "Tinh thần", group: G },
  { hanzi: "思维", pinyin: "sīwéi", hv: "tư duy", meaning: "Lối suy nghĩ, tư duy (động/danh)", group: G },
  { hanzi: "所说", pinyin: "suǒ shuō", hv: "sở thuyết", meaning: "Điều được nói đến, cái gọi là", group: G },
  { hanzi: "解剖", pinyin: "jiěpōu", hv: "giải phẫu", meaning: "Giải phẫu", group: G },
  { hanzi: "神经", pinyin: "shénjīng", hv: "thần kinh", meaning: "Thần kinh", group: G },
  { hanzi: "系统", pinyin: "xìtǒng", hv: "hệ thống", meaning: "Hệ thống", group: G },
  { hanzi: "专有", pinyin: "zhuān yǒu", hv: "chuyên hữu", meaning: "Chuyên ngành, riêng có", group: G },
  { hanzi: "横膈", pinyin: "héngé", hv: "hoành cách", meaning: "Cơ hoành", group: G },
  { hanzi: "脐", pinyin: "qí", hv: "tề", meaning: "Rốn", group: G },
  { hanzi: "上焦", pinyin: "shàngjiāo", hv: "thượng tiêu", meaning: "Thượng tiêu: trên cơ hoành, gồm tâm và phế", group: G },
  { hanzi: "中焦", pinyin: "zhōngjiāo", hv: "trung tiêu", meaning: "Trung tiêu: từ cơ hoành đến rốn, gồm tỳ và vị", group: G },
  { hanzi: "下焦", pinyin: "xiàjiāo", hv: "hạ tiêu", meaning: "Hạ tiêu: dưới rốn, gồm can, thận, đại/tiểu trường, bàng quang", group: G },
  { hanzi: "生理", pinyin: "shēnglǐ", hv: "sinh lý", meaning: "Sinh lý (trái nghĩa: 病理)", group: G },
  { hanzi: "病理", pinyin: "bìnglǐ", hv: "bệnh lý", meaning: "Bệnh lý", group: G },
  { hanzi: "有关", pinyin: "yǒuguān", hv: "hữu quan", meaning: "Có liên quan (trái nghĩa: 无关)", group: G },
  { hanzi: "无关", pinyin: "wúguān", hv: "vô quan", meaning: "Không liên quan", group: G },
  { hanzi: "以上", pinyin: "yǐshàng", hv: "dĩ thượng", meaning: "Trở lên (phía trên)", group: GG },
  { hanzi: "以下", pinyin: "yǐxià", hv: "dĩ hạ", meaning: "Trở xuống (phía dưới)", group: GG },
  { hanzi: "除了……以外", pinyin: "chúle……yǐwài", hv: "trừ liễu … dĩ ngoại", meaning: "Ngoài … ra (còn có)", group: GG }
] as const;

type Q = { q: string; o: string[]; a: number; explain: string; source: string; category: string };
const SRC = "Slide Tạng phủ (HIU)";
const CAT = "Bài Tạng phủ · Slide";

// Trắc nghiệm: đáp án đúng luân phiên vị trí A/B/C/D (app còn tự xáo lại khi làm bài).
let slot = 0;
const mk = (qq: string, correct: string, wrong: string[], explain: string, category = CAT): Q => {
  const idx = slot++ % 4;
  const o = [...wrong];
  o.splice(idx, 0, correct);
  return { q: qq, o, a: idx, explain, source: SRC, category };
};

export const tangPhuSlideQuiz: Q[] = [
  // Câu 1 — viết từ đối nghĩa
  mk("Từ đối nghĩa của 生理 (sinh lý) là gì?", "病理", ["心理", "生化", "功能"], "生理 ↔ 病理.", "Câu 1 · Trái nghĩa"),
  mk("Từ đối nghĩa của 上焦 (thượng tiêu) là gì?", "下焦", ["中焦", "上部", "横膈"], "上焦 ↔ 下焦.", "Câu 1 · Trái nghĩa"),
  mk("Từ đối nghĩa của 无关 (không liên quan) là gì?", "有关", ["无用", "无限", "相同"], "无关 ↔ 有关.", "Câu 1 · Trái nghĩa"),
  mk("Từ đối nghĩa của 以上 (trở lên) là gì?", "以下", ["以外", "以前", "之后"], "以上 ↔ 以下.", "Câu 1 · Trái nghĩa"),
  mk("Từ đối nghĩa của 充实 (đầy đặc) là gì?", "空虚", ["生化", "储藏", "精气"], "充实 ↔ 空虚. Slide để trống đáp án này; mục này theo nghĩa từ, nên kiểm tra lại với giáo trình.", "Câu 1 · Trái nghĩa"),

  // Câu 2 — từ liên quan
  mk("Ngũ tạng (ngoài 心) gồm những tạng nào?", "肝、脾、肺、肾", ["肝、胆、小肠、大肠", "脾、胃、三焦、膀胱", "肺、肾、脑、髓"], "五脏: 心、肝、脾、肺、肾.", "Câu 2 · Từ liên quan"),
  mk("Lục phủ (ngoài 胃) gồm những phủ nào?", "胆、小肠、大肠、三焦、膀胱", ["肝、脾、肺、肾、心", "脑、髓、骨、脉、女子胞", "胆、肝、脾、肺、肾"], "六腑: 胆、胃、小肠、大肠、三焦、膀胱.", "Câu 2 · Từ liên quan"),
  mk("Kỳ hằng chi phủ (ngoài 脑) gồm những gì?", "髓、骨、脉、胆、女子胞", ["心、肝、脾、肺、肾", "胃、小肠、大肠、三焦、膀胱", "髓、骨、肝、肺、肾"], "奇恒之腑: 脑、髓、骨、脉、胆、女子胞 (子宫).", "Câu 2 · Từ liên quan"),
  mk("Tạng phủ (脏腑) gồm ba loại nào?", "五脏、六腑和奇恒之腑", ["五行、六淫和七情", "六腑、奇恒之腑和三焦", "五脏、五行和五体"], "脏腑 = 五脏 + 六腑 + 奇恒之腑.", "Câu 2 · Từ liên quan"),

  // Câu 3 — điền khuyết (theo bài khóa)
  mk("Tạng phủ là gì?", "内脏的总称", ["一种草药的名称", "一个穴位的名称", "六腑的别名"], "脏腑是内脏的总称.", "Câu 3 · Điền khuyết"),
  mk("Ngũ tạng có chức năng gì?", "生化和储藏精、气、血、津液", ["出纳、输布、传化水谷", "推动血液在脉中运行", "排泄糟粕"], "五脏: 有生化和储藏精、气、血、津液功能.", "Câu 3 · Điền khuyết"),
  mk("Đặc điểm chung của lục phủ là gì?", "là những cơ quan có khoang rỗng (中空腔)", ["là tổ chức nội bộ đầy đặc", "không có chức năng gì", "chỉ gồm các tuyến nội tiết"], "六腑是一些中空腔的器官.", "Câu 3 · Điền khuyết"),
  mk("Chức năng của lục phủ là gì?", "出纳、输布、传化水谷", ["生化、储藏精气血津液", "主血脉、藏神", "推动血液在脉中运行"], "六腑的功能: 出纳、输布、传化水谷.", "Câu 3 · Điền khuyết"),
  mk("Vì sao gọi là 奇恒之腑?", "Hình thể giống phủ nhưng tác dụng giống tạng", ["Hình thể giống tạng nhưng tác dụng giống phủ", "Hình thể và tác dụng đều giống tạng", "Hình thể và tác dụng đều giống phủ"], "形体类似腑，但作用类似脏，所以叫奇恒之腑.", "Câu 3 · Điền khuyết"),

  // Câu 4 — trả lời (chuyển thành trắc nghiệm)
  mk("Ngũ tạng theo bài là gì?", "Các tạng có tổ chức nội bộ đầy đặc, có chức năng sinh hóa và tàng trữ", ["Các phủ có khoang rỗng để tiếp nhận thức ăn", "Các tổ chức như não, tủy, xương", "Các đường kinh nối từ đầu đến chân"], "五脏: 内部充实组织的脏器.", "Câu 4 · Trả lời"),
  mk("Trong các mục sau, mục nào KHÔNG thuộc lục phủ?", "脑 (não)", ["胆 (mật)", "胃 (dạ dày)", "膀胱 (bàng quang)"], "脑 thuộc 奇恒之腑, không thuộc 六腑.", "Câu 4 · Trả lời"),
  mk("Nữ tử bào (女子胞) là gì?", "Tử cung", ["Bàng quang", "Tam tiêu", "Đại trường"], "女子胞 即 子宫.", "Câu 4 · Trả lời"),
  mk("Tâm chủ huyết mạch (心主血脉) nghĩa là gì?", "Tim có tác dụng thôi động huyết dịch vận hành trong mạch", ["Tim tàng trữ máu trong gan", "Tim sản xuất tân dịch", "Tim điều hòa hô hấp"], "心主血脉: 心脏有推动血液在脉中运行的作用.", "Câu 4 · Trả lời"),
  mk("Tâm tàng thần (心藏神): 神 là gì?", "Thần chí — hoạt động tinh thần và tư duy", ["Sức khỏe thể chất", "Dịch thể trong cơ thể", "Hệ thống tiêu hóa"], "神，即神志，是指人的精神和思维活动.", "Câu 4 · Trả lời"),
  mk("Theo Đông y, tâm ngoài giải phẫu còn bao gồm gì?", "Một phần hệ thần kinh, đặc biệt là một số chức năng của não", ["Hệ tiêu hóa và gan", "Hệ hô hấp và phổi", "Cơ hoành và rốn"], "所说的心 còn bao gồm 一部分神经系统 và 大脑的某些功能.", "Câu 4 · Trả lời"),
  mk("Tạng phủ Đông y khác y học hiện đại thế nào?", "Tên gọi giống nhau nhưng ý nghĩa sinh lý, bệnh lý không hoàn toàn giống", ["Hoàn toàn giống nhau cả tên và chức năng", "Khác tên nhưng chức năng giống hệt", "Chỉ khác về số lượng cơ quan"], "名称相同，但在生理、病理的含义上不完全一样.", "Câu 4 · Trả lời"),
  mk("Phủ nào trong lục phủ là tên gọi riêng của Đông y?", "三焦 (tam tiêu)", ["心 (tâm)", "肝 (can)", "膀胱 (bàng quang)"], "只有六腑里面的三焦是中医学专有的名称.", "Câu 4 · Trả lời"),
  mk("Tam tiêu được chia thành mấy phần?", "Thượng tiêu, trung tiêu và hạ tiêu", ["Đại tiêu, tiểu tiêu và trung tiêu", "Tâm tiêu, can tiêu và thận tiêu", "Thượng tiêu, hạ tiêu và tiểu tiêu"], "三焦分上焦、中焦和下焦.", "Câu 4 · Trả lời"),
  mk("Thượng tiêu gồm những tạng nào?", "心、肺", ["脾、胃", "肝、肾", "大肠、小肠"], "横膈以上为上焦，包括心、肺.", "Câu 4 · Trả lời"),
  mk("Trung tiêu gồm những tạng nào?", "脾和胃", ["心和肺", "肝和肾", "大肠和小肠"], "横膈以下到脐为中焦，包括脾和胃.", "Câu 4 · Trả lời"),
  mk("Hạ tiêu gồm những tạng nào?", "肝、肾、大肠、小肠和膀胱", ["心、肺", "脾、胃", "脑、髓、骨"], "脐以下为下焦，包括肝、肾、大肠、小肠和膀胱.", "Câu 4 · Trả lời"),
  mk("Mốc phân chia tam tiêu theo vị trí là gì?", "Cơ hoành (横膈) và rốn (脐)", ["Xương đòn và xương sườn", "Thắt lưng và đầu gối", "Cổ và hông"], "以横膈和脐为界.", "Câu 4 · Trả lời"),

  // Ngữ pháp
  mk("Nghĩa của cấu trúc 除了……以外 là gì?", "Ngoài … ra (còn có)", ["Trừ khi … thì", "Tuy … nhưng", "Vì … nên"], "除了……以外: ngoài … ra, thường đi với 还、也、都.", "Ngữ pháp · 除了……以外"),
  mk("Câu nào dùng đúng 除了……以外?", "在上焦除了心脏以外，还有肺脏和心包。", ["在上焦只有心脏，没有肺脏和心包。", "在上焦的心脏不是肺脏和心包。", "在上焦心脏与肺脏以下。"], "在上焦除了心脏以外，还有肺脏和心包 = ngoài tim ra, thượng tiêu còn có phổi và tâm bào.", "Ngữ pháp · 除了……以外"),
  mk("这件事除了老张以外，我们都知道。 nghĩa là gì?", "Việc này, ngoài ông Trương ra, chúng tôi đều biết", ["Việc này chỉ có ông Trương biết", "Chúng tôi đều không biết việc này", "Ông Trương và chúng tôi đều không biết"], "除了……以外 còn dùng để loại trừ người/sự việc.", "Ngữ pháp · 除了……以外"),
  mk("Điền từ thích hợp: 除了心和心包络____，其他脏腑的命名都有“月”部。", "以外", ["以上", "以下", "之前"], "除了……以外 (ngoài … ra).", "Ngữ pháp · 除了……以外"),
  mk("Trong 横膈以上为上焦, 以上 nghĩa là gì?", "Từ mốc đó trở lên (phía trên)", ["Từ mốc đó trở xuống", "Đúng bằng mốc đó", "Cách xa mốc đó"], "A + 以上: từ mốc A trở lên.", "Ngữ pháp · 以上 / 以下"),
  mk("Trong 脐以下为下焦, 以下 nghĩa là gì?", "Từ mốc đó trở xuống (phía dưới)", ["Từ mốc đó trở lên", "Trước mốc đó", "Bên trong mốc đó"], "A + 以下: từ mốc A trở xuống.", "Ngữ pháp · 以上 / 以下"),

  // Từ vựng — dịch nhanh
  mk("“Tiểu trường” viết tiếng Trung là gì?", "小肠", ["大肠", "三焦", "膀胱"], "小肠 (xiǎocháng).", "Từ vựng · Dịch nhanh"),
  mk("“Giải phẫu” tiếng Trung là gì?", "解剖", ["解释", "解答", "剖面"], "解剖 (jiěpōu).", "Từ vựng · Dịch nhanh"),
  mk("“Thần kinh” tiếng Trung là gì?", "神经", ["神志", "精神", "神明"], "神经 (shénjīng).", "Từ vựng · Dịch nhanh"),
  mk("“Cơ hoành” tiếng Trung là gì?", "横膈", ["横向", "脐", "横肉"], "横膈 (héngé).", "Từ vựng · Dịch nhanh"),
  mk("“Rốn” tiếng Trung là gì?", "脐", ["膈", "胃", "脑"], "脐 (qí).", "Từ vựng · Dịch nhanh"),
  mk("“Đồ ăn thức uống” tiếng Trung là gì?", "水谷", ["水源", "谷物", "津液"], "水谷 (shuǐgǔ).", "Từ vựng · Dịch nhanh")
];

type R = {
  title: string; han: string; pinyin: string; vi: string; q: string; options: string[]; answer: number;
  topic: string; source: string; words: [string, string, string][];
};
const RS = "Slide Tạng phủ · bài khóa";
const RT = "Tạng phủ";

export const tangPhuSlideReadings: R[] = [
  {
    title: "Tạng phủ là gì",
    han: "脏腑是内脏的总称，包括五脏六腑和奇恒之腑三类。",
    pinyin: "Zàngfǔ shì nèizàng de zǒngchēng, bāokuò wǔzàng liùfǔ hé qíhéng zhī fǔ sān lèi.",
    vi: "Tạng phủ là tên gọi chung của nội tạng, gồm ba loại: ngũ tạng, lục phủ và kỳ hằng chi phủ.",
    q: "Tạng phủ gồm mấy loại?", options: ["Ba loại", "Hai loại", "Bốn loại", "Năm loại"], answer: 0,
    topic: RT, source: RS,
    words: [["内脏", "nèizàng", "nội tạng"], ["总称", "zǒngchēng", "tên gọi chung"], ["包括", "bāokuò", "bao gồm"]]
  },
  {
    title: "Ngũ tạng",
    han: "五脏，就是心、肝、脾、肺、肾，都是内部充实组织，并有生化和储藏精、气、血、津液功能的脏器。",
    pinyin: "Wǔzàng, jiùshì xīn, gān, pí, fèi, shèn, dōu shì nèibù chōngshí zǔzhī, bìng yǒu shēnghuà hé chǔcáng jīng, qì, xuè, jīnyè gōngnéng de zàngqì.",
    vi: "Ngũ tạng là tim, gan, lách, phổi, thận; đều là tổ chức nội bộ đầy đặc, có chức năng sinh hóa và tàng trữ tinh, khí, huyết, tân dịch.",
    q: "Ngũ tạng có chức năng gì?", options: ["Sinh hóa và tàng trữ tinh, khí, huyết, tân dịch", "Xuất nạp, thâu bố, truyền hóa thủy cốc", "Chủ huyết mạch, tàng thần", "Tiếp nhận và bài tiết"], answer: 0,
    topic: RT, source: RS,
    words: [["充实", "chōngshí", "đầy đặc"], ["生化", "shēnghuà", "sinh hóa"], ["储藏", "chǔcáng", "tàng trữ"], ["津液", "jīnyè", "tân dịch"]]
  },
  {
    title: "Lục phủ",
    han: "六腑，指胆、胃、小肠、大肠、三焦、膀胱，是一些中空腔的器官，具有出纳、输布、传化水谷的功能。",
    pinyin: "Liùfǔ, zhǐ dǎn, wèi, xiǎocháng, dàcháng, sānjiāo, pángguāng, shì yìxiē zhōngkōngqiāng de qìguān, jùyǒu chūnà, shūbù, chuánhuà shuǐgǔ de gōngnéng.",
    vi: "Lục phủ gồm mật, dạ dày, tiểu trường, đại trường, tam tiêu, bàng quang; là các cơ quan có khoang rỗng, có chức năng xuất nạp, thâu bố, truyền hóa thủy cốc.",
    q: "Đặc điểm của lục phủ là gì?", options: ["Là các cơ quan có khoang rỗng", "Là tổ chức nội bộ đầy đặc", "Gồm não và tủy", "Gồm tim và phổi"], answer: 0,
    topic: RT, source: RS,
    words: [["中空腔", "zhōngkōngqiāng", "khoang rỗng"], ["出纳", "chūnà", "xuất nạp"], ["输布", "shūbù", "thâu bố"], ["传化", "chuánhuà", "truyền hóa"], ["水谷", "shuǐgǔ", "thủy cốc"]]
  },
  {
    title: "Kỳ hằng chi phủ",
    han: "奇恒之腑包括脑、髓、骨、脉、胆、女子胞（即子宫）六种组织器官。它们形体类似腑，但作用类似脏，所以叫奇恒之腑。",
    pinyin: "Qíhéng zhī fǔ bāokuò nǎo, suǐ, gǔ, mài, dǎn, nǚzǐbāo (jí zǐgōng) liù zhǒng zǔzhī qìguān. Tāmen xíngtǐ lèisì fǔ, dàn zuòyòng lèisì zàng, suǒyǐ jiào qíhéng zhī fǔ.",
    vi: "Kỳ hằng chi phủ gồm não, tủy, xương, mạch, mật, nữ tử bào (tức tử cung). Hình thể giống phủ nhưng tác dụng giống tạng nên gọi là kỳ hằng chi phủ.",
    q: "Vì sao gọi là 奇恒之腑?", options: ["Hình thể giống phủ, tác dụng giống tạng", "Hình thể giống tạng, tác dụng giống phủ", "Có khoang rỗng và chủ huyết", "Gồm sáu cơ quan có khoang rỗng"], answer: 0,
    topic: RT, source: RS,
    words: [["形体", "xíngtǐ", "hình thể"], ["类似", "lèisì", "giống như"], ["作用", "zuòyòng", "tác dụng"], ["女子胞", "nǚzǐbāo", "nữ tử bào"]]
  },
  {
    title: "Tạng phủ Đông y và Tây y",
    han: "中医脏腑学说中的心、肺、脾、肝、肾等脏器，虽然与现代医学脏器的名称相同，但在生理、病理的含义上，却不完全一样。",
    pinyin: "Zhōngyī zàngfǔ xuéshuō zhōng de xīn, fèi, pí, gān, shèn děng zàngqì, suīrán yǔ xiàndài yīxué zàngqì de míngchēng xiāngtóng, dàn zài shēnglǐ, bìnglǐ de hányì shàng, què bù wánquán yíyàng.",
    vi: "Các tạng tâm, phế, tỳ, can, thận trong học thuyết tạng phủ Đông y có tên gọi giống tạng của y học hiện đại, nhưng về ý nghĩa sinh lý, bệnh lý thì không hoàn toàn giống nhau.",
    q: "Tạng phủ Đông y và y học hiện đại khác nhau ở điểm nào?", options: ["Ý nghĩa sinh lý, bệnh lý không hoàn toàn giống", "Tên gọi khác hẳn nhau", "Hoàn toàn giống nhau", "Chỉ khác số lượng"], answer: 0,
    topic: RT, source: RS,
    words: [["名称", "míngchēng", "tên gọi"], ["生理", "shēnglǐ", "sinh lý"], ["病理", "bìnglǐ", "bệnh lý"], ["含义", "hányì", "ý nghĩa"]]
  },
  {
    title: "Tâm chủ huyết mạch, tâm tàng thần",
    han: "例如心脏，根据中医脏腑学说，心的主要功能是：心主血脉。脉是血液通行的管道，心主血脉，是指心脏有推动血液在脉中运行的作用。心藏神。神，即神志，是指人的精神和思维活动。",
    pinyin: "Lìrú xīnzàng, gēnjù zhōngyī zàngfǔ xuéshuō, xīn de zhǔyào gōngnéng shì: xīn zhǔ xuèmài. Mài shì xuèyè tōngxíng de guǎndào, xīn zhǔ xuèmài, shì zhǐ xīnzàng yǒu tuīdòng xuèyè zài mài zhōng yùnxíng de zuòyòng. Xīn cáng shén. Shén, jí shénzhì, shì zhǐ rén de jīngshén hé sīwéi huódòng.",
    vi: "Lấy ví dụ tim: theo học thuyết tạng phủ, chức năng chính của tâm là tâm chủ huyết mạch — tim có tác dụng thôi động huyết dịch vận hành trong mạch; và tâm tàng thần — thần tức thần chí, là hoạt động tinh thần và tư duy.",
    q: "Trong câu, 脉 được hiểu là gì?", options: ["Đường lưu thông của huyết dịch", "Chức năng tinh thần", "Dịch thể trong cơ thể", "Một tạng trong ngũ tạng"], answer: 0,
    topic: RT, source: RS,
    words: [["主", "zhǔ", "chủ"], ["血脉", "xuèmài", "huyết mạch"], ["推动", "tuīdòng", "thôi động"], ["运行", "yùnxíng", "vận hành"], ["藏", "cáng", "tàng"], ["神志", "shénzhì", "thần chí"]]
  },
  {
    title: "Tâm và hệ thần kinh",
    han: "所以中医所说的心，除了代表解剖学上的心以外，还包括了一部分神经系统，特别是大脑的某些功能。",
    pinyin: "Suǒyǐ zhōngyī suǒshuō de xīn, chúle dàibiǎo jiěpōuxué shàng de xīn yǐwài, hái bāokuòle yí bùfen shénjīng xìtǒng, tèbié shì dànǎo de mǒuxiē gōngnéng.",
    vi: "Vì vậy tâm theo Đông y, ngoài đại diện cho tim theo giải phẫu học, còn bao gồm một phần hệ thần kinh, đặc biệt là một số chức năng của não.",
    q: "Theo câu trên, 除了……以外 làm gì?", options: ["Ngoài tim ra, còn bao gồm thần kinh", "Chỉ nói về tim", "Loại trừ thần kinh", "Nói về trái tim giải phẫu"], answer: 0,
    topic: RT, source: RS,
    words: [["解剖学", "jiěpōuxué", "giải phẫu học"], ["神经系统", "shénjīng xìtǒng", "hệ thần kinh"], ["大脑", "dànǎo", "não"]]
  },
  {
    title: "Tam tiêu",
    han: "只有六腑里面的三焦是中医学专有的名称。从部位来说，横膈以上为上焦，包括心、肺；横膈以下到脐为中焦，包括脾和胃；脐以下为下焦，包括肝、肾、大肠、小肠和膀胱。",
    pinyin: "Zhǐyǒu liùfǔ lǐmiàn de sānjiāo shì zhōngyīxué zhuānyǒu de míngchēng. Cóng bùwèi láishuō, héngé yǐshàng wéi shàngjiāo, bāokuò xīn, fèi; héngé yǐxià dào qí wéi zhōngjiāo, bāokuò pí hé wèi; qí yǐxià wéi xiàjiāo, bāokuò gān, shèn, dàcháng, xiǎocháng hé pángguāng.",
    vi: "Chỉ có tam tiêu trong lục phủ là tên gọi riêng của Đông y. Xét theo vị trí: trên cơ hoành là thượng tiêu gồm tâm, phế; từ cơ hoành đến rốn là trung tiêu gồm tỳ, vị; dưới rốn là hạ tiêu gồm can, thận, đại trường, tiểu trường và bàng quang.",
    q: "Trung tiêu gồm những gì?", options: ["Tỳ và vị", "Tâm và phế", "Can và thận", "Đại trường và tiểu trường"], answer: 0,
    topic: RT, source: RS,
    words: [["上焦", "shàngjiāo", "thượng tiêu"], ["中焦", "zhōngjiāo", "trung tiêu"], ["下焦", "xiàjiāo", "hạ tiêu"], ["横膈", "héngé", "cơ hoành"], ["脐", "qí", "rốn"]]
  }
];
