# Cập nhật hệ thống chọn môn học - Gộp Lý Hóa Sinh

## Thay đổi mới nhất: Gộp 3 môn Lý, Hóa, Sinh thành "Khoa học Tự nhiên"

### Trước đây
Cấp 2 có 3 môn riêng biệt:
- Vật lý (Physics)
- Hóa học (Chemistry)
- Sinh học (Biology)

### Bây giờ
Cấp 2 chỉ có **1 môn gộp**: **Khoa học Tự nhiên** (Natural Sciences)

## Thay đổi thực hiện

### 1. Backend Prompts
- ✅ Gộp prompts: physics + chemistry + biology → natural_sciences
- ✅ Prompt mới tích hợp kiến thức từ cả 3 môn
- ✅ API vẫn gửi `natural_sciences` cho cấp 2

### 2. Frontend
- ✅ Loại bỏ: physics, chemistry, biology từ danh sách chọn
- ✅ Thêm: natural_sciences cho cấp 2
- ✅ UI hiển thị "Khoa học Tự nhiên" thay vì 3 môn riêng

### 3. Mapping tự động (`src/utils/subjectMapping.js`)

```javascript
// Mapping cập nhật
'mathematics' -> 'natural_sciences'
'natural_sciences' -> 'natural_sciences'  // Môn gộp mới

'history' -> 'social_sciences'
'geography' -> 'social_sciences'
'civics' -> 'social_sciences'
'literature' -> 'social_sciences'
'foreign_language' -> 'social_sciences'

'english_language' -> 'english_language' // Standalone
```

### 2. UI đã cập nhật

**Components được chỉnh sửa:**
- `src/components/chat/Welcome.js` - Màn hình chào mừng
- `src/components/chat/NewChatModal.js` - Modal tạo chat mới

**Thay đổi:**
- ❌ Bỏ dropdown "Lĩnh vực khoa học"  
- ❌ Bỏ dropdown "Môn học cụ thể" phụ thuộc lĩnh vực
- ✅ Thêm dropdown "Môn học" duy nhất với tất cả môn

### 3. Backend không đổi

✅ **Prompts được giữ nguyên**: Backend vẫn có đầy đủ prompts cho:
- `natural_sciences` (Khoa học Tự nhiên)
- `social_sciences` (Khoa học Xã hội)  
- Từng môn học cụ thể

✅ **API không đổi**: Vẫn nhận `educationLevel`, `subjectArea`, `course`

## Lợi ích đạt được

### 🎯 **UX tốt hơn**
- Ít step hơn: 2 dropdown → 1 dropdown
- Không cần hiểu về "lĩnh vực khoa học"
- Chọn trực tiếp môn học mình muốn học

### 🧠 **Thông minh hơn**  
- Hệ thống tự động biết Toán = Khoa học Tự nhiên
- Hệ thống tự động biết Lịch sử = Khoa học Xã hội
- User không cần nhớ classification

### 🛡️ **Backward Compatible**
- Backend prompts không đổi
- API format không đổi  
- Existing conversations vẫn hoạt động

## Code Examples

### Sử dụng trong component:

```javascript
import { getSubjectArea } from '../utils/subjectMapping';

// User chọn "mathematics"
const selectedSubject = "mathematics";
const subjectArea = getSubjectArea(selectedSubject); // "natural_sciences"

// Gửi đến backend
const settings = {
  educationLevel: "middle",
  subjectArea: subjectArea,        // "natural_sciences" 
  course: selectedSubject          // "mathematics"
};
```

### Kiểm tra loại môn học:

```javascript
import { isNaturalScience, isSocialScience } from '../utils/subjectMapping';

isNaturalScience("physics");     // true
isSocialScience("history");      // true
isNaturalScience("literature");  // false
```

## Files đã thay đổi

### Mới tạo:
- `src/utils/subjectMapping.js` - Logic mapping tự động

### Đã cập nhật:
- `src/components/chat/Welcome.js` - UI chọn môn học
- `src/components/chat/NewChatModal.js` - Modal tạo chat

### Không thay đổi:
- ✅ Backend prompts (`backend/src/locales/`)
- ✅ Backend API endpoints
- ✅ Database schema
- ✅ Existing conversations

## Test Cases

Để test thay đổi:

1. **Khởi tạo chat mới**:
   - Chọn môn học bất kỳ
   - Chat phải hoạt động với prompts đúng lĩnh vực

2. **Test các môn khác nhau**:
   - Toán/Vật lý → Prompt Khoa học Tự nhiên
   - Lịch sử/Địa lý → Prompt Khoa học Xã hội  
   - Tiếng Anh → Prompt riêng

3. **Existing conversations**: Vẫn load và hoạt động bình thường

## Migration Notes

- **Không cần migration data**: Existing conversations vẫn hoạt động
- **Deploy an toàn**: Frontend và backend có thể deploy độc lập
- **Rollback dễ dàng**: Chỉ cần revert frontend changes nếu cần 