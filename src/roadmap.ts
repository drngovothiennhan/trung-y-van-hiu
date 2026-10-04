// Trang "Lộ trình ôn thi trắc nghiệm" trong Thư viện (chỉ là dữ liệu nguồn, không thêm màn hình mới).
import type { PInfo, PTerm } from './priority';

export function buildRoadmapSource(ranked: PTerm[], info: Map<string, PInfo>, slideCount: number) {
  const tierA = ranked.filter(t => info.get(t.hanzi)?.tier === 'A');
  const topAll = ranked.filter(t => (info.get(t.hanzi)?.slides || 0) >= 3);
  const byGroup = new Map<string, PTerm[]>();
  for (const t of tierA) byGroup.set(t.group, [...(byGroup.get(t.group) || []), t]);
  const line = (t: PTerm) => t.hanzi + ' ' + t.hv + ' = ' + t.meaning;

  const pages: { page: number; label: string; text: string }[] = [];

  pages.push({
    page: 1,
    label: 'Cách ưu tiên & lịch ôn',
    text: `LỘ TRÌNH ÔN THI TRẮC NGHIỆM — TRUNG VĂN CHUYÊN NGÀNH
(Cơ sở: slide bài giảng đã nạp + giáo trình Lê Minh Hoàng 2022. Đây là lộ trình suy ra từ tài liệu, KHÔNG phải đề thi thật.)

Hình thức: thi kết thúc học phần 70% là TRẮC NGHIỆM; thường xuyên 30%.

Từ nào được học trước? App đã xếp ${ranked.length} từ theo mức xuất hiện trong ${slideCount} bộ slide:
• Mức A (${tierA.length} từ): có ở ≥2 slide, hoặc có ở slide và cũng có trong giáo trình → học TRƯỚC.
• Mức B: chỉ thấy ở 1 slide. • Mức C: chỉ có trong giáo trình/phần mở rộng → học SAU.
Từ có ở ≥3 slide (${topAll.length} từ): ${topAll.map(t => t.hanzi).join(' ')} — thuộc chắc đầu tiên.

LỊCH GỢI Ý (thi khoảng tháng 11 — vào mục Ôn thi, chọn ngày thi để app tự chia mỗi ngày):
Tuần 1 — Nền: 木火土金水, 肝心脾肺肾, 目舌口鼻耳, 筋脉肉皮肤骨头; 的/地/得. Mỗi ngày 25–30 từ mức A, học bằng thẻ Nhìn → Nhận biết.
Tuần 2 — Quan hệ Ngũ hành: 相生/相克/相乘/相侮, 资生/制约, 乘虚侵袭/恃强凌弱, 扶土抑木. Thuộc thứ tự sinh–khắc bằng câu; làm Trắc nghiệm "Gốc sách".
Tuần 3 — Âm Dương + Tạng Phủ: 对立/互根/消长/转化; 既……又……; 就……来说. Làm Đọc hiểu mỗi ngày 3 đoạn.
Tuần 4 — Khí Huyết – Kinh Lạc – Du huyệt – Lục dâm Thất tình: chỉ mức A và B, phần C để cuối.
Tuần 5 — Tổng ôn: mỗi ngày 1 bài Ôn thi (30 thẻ) + 1 bộ Trắc nghiệm tổng hợp; chỉ ôn từ KHÓ và từ đến hạn.
3 ngày cuối: không học từ mới; chỉ ôn từ KHÓ, câu sai, bảng sinh–khắc, bảng tạng–thể–khiếu.`
  });

  pages.push({
    page: 2,
    label: 'Dạng câu trắc nghiệm & lưu ý',
    text: `CÁC DẠNG CÂU TRẮC NGHIỆM VÀ CÁCH LÀM
1) Chữ Hán → nghĩa / Hán Việt: nhìn bộ thủ và nhóm chủ đề. Các tạng 肝 肺 肾 脾 đều có bộ 月 — nhớ phần còn lại: 肝(干) 肺(巿) 肾(又) 脾(卑).
2) Nghĩa → chữ Hán: đừng đọc lướt, chọn đúng cả hai chữ của từ 2 chữ (资生 ≠ 滋润, 制约 ≠ 克服 nhưng cùng nghĩa tương khắc).
3) Câu ghép tạng–thể–khiếu: học theo bộ ba, không học rời.
   木 肝 筋 目 | 火 心 脉 舌头 | 土 脾 肉 口 | 金 肺 皮肤 鼻子 | 水 肾 骨头 耳朵.
4) Thứ tự sinh–khắc: sinh = 木→火→土→金→水→木 (vòng liền kề); khắc = 木→土→水→火→金→木 (cách một hành).
5) Phân biệt THỪA và VŨ: 乘 = khắc đúng chiều nhưng quá mức (木乘土: Can bệnh làm hại Tỳ); 侮 = khắc ngược chiều, còn gọi 反克 (土侮木: Tỳ bệnh ảnh hưởng ngược lên Can). Cả hai là mất điều hòa; 相生 相克 là bình thường.
6) 的 地 得: sau là DANH từ → 的; sau là ĐỘNG từ → 地; trước là động từ + bổ ngữ → 得. (红色的血液, 准确地回答, 做得好.)
7) Đúng/sai (判断正误): cẩn thận câu "tuyệt đối" (cả, chỉ, không thể…). Ví dụ bẫy: 相生与相克不能维持平衡 là SAI; 承载/滋润 không phải đặc tính chung của cả ngũ hành.
8) Điền khuyết theo bài khóa: nhớ cả cụm cố định (相互资生、促进和助长; 相互制约或克服; 乘虚侵袭; 恃强凌弱; 不可分割).
9) Đối nghĩa: 相生↔相克, 资生↔制约, 相乘↔相侮, 火↔水.
Mẹo ngày thi: loại 2 đáp án gần nghĩa nhất, sau đó so chữ Hán ký tự-từng-ký tự; câu đã sai trong app thì xem lại giải thích trước khi thi.`
  });

  let page = 3;
  for (const [group, list] of byGroup) {
    const chunk = 40;
    for (let i = 0; i < list.length; i += chunk) {
      const part = list.slice(i, i + chunk);
      pages.push({
        page: page++,
        label: 'Mức A · ' + group,
        text: 'TỪ ƯU TIÊN MỨC A — ' + group + ' (' + (i + 1) + '–' + (i + part.length) + '/' + list.length + ')\n' + part.map(line).join('\n')
      });
    }
  }

  return {
    id: 'roadmap',
    title: 'Lộ trình ôn thi trắc nghiệm & từ ưu tiên',
    pages,
    status: 'Lộ trình + ' + tierA.length + ' từ ưu tiên mức A (theo slide bài giảng)'
  };
}
