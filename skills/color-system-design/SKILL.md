---
name: color-system-design
description: "UI/UX color system engineering and color harmony standards. Covers the 60-30-10 distribution rule, semantic functional tokens, WCAG 2.1 contrast ratios, tinted neutral formulas, OKLCH/Tailwind 50-950 scale generation, and industry color psychology."
---

# UI/UX Color System & Color Harmony Standards

A disciplined color system is not just decorative—it establishes visual hierarchy, guarantees accessibility, and directs user attention directly to conversion points without cognitive overload.

---

## 1. Visual Distribution: The 60–30–10 Rule

Always allocate interface color weight according to the visual ratio:

* **60% Dominant (Canvas & Surfaces):**
  * Nền chính, canvas, khoảng trắng (whitespace), container lớn.
  * *Nhiệm vụ:* Tạo khoảng thở thị giác, giảm mỏi mắt, làm nền tảng cho nội dung.
* **30% Secondary (Structure & Brand Presence):**
  * Thanh điều hướng (navbars), sidebar, cards, borders, typography chính, secondary buttons.
  * *Nhiệm vụ:* Định hình cấu trúc phân cấp thông tin và nhận diện thương hiệu.
* **10% Accent (Conversion & Focus):**
  * Duy nhất cho **Primary CTA** (Call To Action), nút thanh toán/đăng ký, badge trạng thái quan trọng, alert highlights.
  * *Quy tắc vàng:* Accent phải có độ tương phản và độ bão hòa nổi bật nhất trên trang. Không lạm dụng màu Accent cho các thành phần không cần người dùng click.

---

## 2. Semantic Color Architecture (Design Tokens)

Không đặt tên token theo màu vật lý (`blue`, `red-dark`). Hãy dùng cấu trúc công năng ngữ nghĩa (Semantic Tokens):

| Token Category | Token Name | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Brand / Primary** | `color-primary-*` | Logo, active navigation states, primary borders, brand highlights |
| **Accent** | `color-accent-*` | Nút kêu gọi hành động (Primary CTA), banner khuyến mãi, link hover |
| **Surface & Neutral** | `color-surface-*`, `color-neutral-*` | Nền trang, background cards, borders, divider, body typography |
| **Feedback: Success** | `color-success-*` | Trạng thái hoàn thành, chỉ số tăng trưởng (thường là Xanh lục) |
| **Feedback: Warning** | `color-warning-*` | Cảnh báo cần chú ý, thao tác có rủi ro (thường là Vàng/Cam) |
| **Feedback: Danger** | `color-danger-*` | Lỗi form, hành động huỷ/xoá dữ liệu (thường là Đỏ) |
| **Feedback: Info** | `color-info-*` | Thông tin giải thích, hướng dẫn phụ trợ (thường là Xanh dương nhạt) |

### Kỹ thuật Tinted Neutrals (Pha sắc thái trung tính)
* **Tuyệt đối tránh:** Dùng đen tuyền (`#000000`) trên nền trắng tinh, hoặc xám trung tính vô cảm (`#808080`).
* **Quy tắc:** Pha thêm **$3\% - 5\%$** sắc độ (Hue) của màu Brand vào dải Neutral:
  * Brand tone ấm $\rightarrow$ **Warm Gray** (tạo cảm giác gần gũi, thân thiện).
  * Brand tone lạnh/công nghệ $\rightarrow$ **Cool Gray / Slate** (tạo cảm giác chính xác, hiện đại).

---

## 3. Harmonic Color Palettes (Công thức phối màu)

Chọn mô hình phối màu dựa trên loại sản phẩm và cảm xúc cốt lõi:

1. **Đơn sắc (Monochromatic):**
   * *Nguyên lý:* Khai thác các biến thể độ sáng/độ bão hòa (Lightness/Chroma) của duy nhất một màu chủ đạo.
   * *Ứng dụng:* B2B SaaS, bảng điều khiển dữ liệu (Dashboard), ứng dụng tài chính/Enterprise cần giảm tối đa phân tâm.
2. **Tương đồng (Analogous):**
   * *Nguyên lý:* Kết hợp 2–3 màu nằm liền kề trên bánh xe màu (ví dụ: Cyan - Sky Blue - Blue).
   * *Ứng dụng:* Ứng dụng thiền định, sức khỏe y tế, du lịch, sinh thái (cảm giác êm dịu, mượt mà).
3. **Bổ túc trực tiếp (Complementary):**
   * *Nguyên lý:* Kết hợp 2 màu đối diện nhau $180^\circ$ trên vòng tròn màu (ví dụ: Deep Navy & Bright Coral/Amber).
   * *Ứng dụng:* E-commerce, Landing Page bán lẻ (sử dụng Navy cho 90% diện tích, Amber rực rỡ cho 10% CTA để tối đa tỷ lệ click).
4. **Bổ túc kép / Chia tách (Split-Complementary / Triadic):**
   * *Nguyên lý:* 1 màu chủ đạo kết hợp với 2 màu nằm 2 bên của màu đối đỉnh, hoặc tam giác đều $120^\circ$.
   * *Ứng dụng:* Sản phẩm EdTech, Creative Agency, Gaming, Web3.

---

## 4. Accessibility & Contrast Standards (WCAG 2.1)

Thiết kế UI bắt buộc phải đảm bảo khả năng tiếp cận chuẩn quốc tế:

* **WCAG Level AA (Tiêu chuẩn tối thiểu cho Web):**
  * **Văn bản thông thường (< 18px regular hoặc < 14px bold):** Tỷ lệ tương phản tối thiểu **$4.5:1$** so với màu nền.
  * **Văn bản lớn ($\ge$ 18px bold hoặc $\ge$ 24px regular) & UI Components:** Tối thiểu **$3:1$** (bao gồm cả viền input, icon trạng thái, active button border).
* **WCAG Level AAA (Khuyến nghị cho ứng dụng chuyên sâu):** Tỷ lệ tương phản **$7:1$** cho body text.
* **Quy tắc Multi-Signal (Không chỉ dựa vào màu sắc):**
  * Không bao giờ dùng *duy nhất màu đỏ* để báo lỗi hoặc *xanh* để báo thành công.
  * Luôn đi kèm: **Màu sắc + Biểu tượng (Icon) + Nội dung mô tả (Text Label)** để người dùng khiếm thị màu (color blind) vẫn hiểu được.

---

## 5. Color Scale Engineering (Thang màu 50–950 & OKLCH)

Khi xây dựng token cho CSS/Tailwind:

### Thang 11 bước tiêu chuẩn:
* `50`: Nền alert, table hover, tint nền rất nhạt.
* `100 - 200`: Viền card, input border, background badge phụ.
* `300 - 400`: Placeholder text, border khi disabled, secondary icon.
* `500 - 600`: **Màu gốc mặc định** của Brand / Buttons (Base State).
* `700`: Hover & active states của button, icon tương tác.
* `800`: Text tiêu đề trên nền màu nhạt.
* `900 - 950`: Text chính (High contrast) hoặc bề mặt Dark mode surface.

### Không gian màu OKLCH vs HEX/RGB:
* Khi điều chỉnh độ đậm nhạt, ưu tiên dùng không gian màu **OKLCH** (`oklch(L C H)`):
  * **L (Lightness):** Kiểm soát độ sáng đồng nhất giữa các màu khác nhau.
  * **C (Chroma):** Độ bão hòa/tươi của màu.
  * **H (Hue):** Góc màu.
* *Ưu điểm:* OKLCH đảm bảo khi chuyển đổi giữa các tone màu khác nhau ở cùng bước `500`, mắt người cảm nhận độ sáng tương đương nhau mà không bị hiện tượng một số màu (như vàng) quá chói còn xanh quá tối.

---

## 6. Industry Color Psychology Reference

| Tone màu | Ý nghĩa tâm lý | Ngành nghề phù hợp |
| :--- | :--- | :--- |
| **Blue (Xanh dương)** | Tin cậy, an toàn, ổn định, logic | Fintech, Ngân hàng, B2B SaaS, Y tế, Logistics |
| **Green (Xanh lá)** | Tăng trưởng, tươi mới, tài chính, sinh thái | Eco, Nông nghiệp, Đầu tư/Wealth, Ứng dụng sức khỏe |
| **Purple (Tím)** | Sang trọng, trí tuệ, công nghệ tương lai | AI Tools, Web3 / Crypto, Luxury, Nền tảng học trực tuyến |
| **Amber/Orange (Cam)** | Nhiệt huyết, thân thiện, hành động nhanh | Food & Beverage, E-commerce, Khóa học ngắn hạn, Thể thao |
| **Red (Đỏ)** | Khẩn cấp, năng lượng cao, kích thích vị giác | F&B, Flash Sales, Cảnh báo an toàn, Thể thao mạo hiểm |
| **Neutral / Monochrome** | Tinh tế, tối giản, trung lập | Thời trang cao cấp, Studio thiết kế kiến trúc, Tạp chí editorial |

---

## 7. Pre-flight Checklist Trước Khi Duyệt Giao Diện

- [ ] Tỷ lệ 60-30-10 đã được bảo toàn (Primary CTA có màu Accent nổi bật nhất).
- [ ] Không có màu đen thuần `#000000` trên nền trắng tinh (đã dùng Tinted Neutral).
- [ ] Mọi cặp Text / Nền đều vượt qua bài kiểm tra WCAG AA (tối thiểu $4.5:1$).
- [ ] Trạng thái lỗi (Error/Warning) có kèm Icon và Text, không dùng đơn lẻ màu sắc.
- [ ] Bảng màu đã được ánh xạ thành các token 50–950 sẵn sàng cho Tailwind/CSS Variables.

---

## 8. Companion Skills
- **Responsive Layout & Ergonomics:** Xem [`responsive-frontend-expert`](../responsive-frontend-expert/SKILL.md) cho breakpoint, mobile dialogs (`100dvh`), và safe-area padding.
- **Landing Page & Conversion Copy:** Xem [`landing-page-design`](../landing-page-design/SKILL.md) cho cấu trúc trang chuyển đổi cao và nguyên lý copywriting.
- **Technical SEO & Semantics:** Xem [`seo`](../seo/SKILL.md) cho cấu trúc dữ liệu JSON-LD Schema và kiểm toán chỉ mục.
