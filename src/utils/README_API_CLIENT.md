# API Client - Tự động xử lý lỗi 401

## Tổng quan

Hệ thống này tự động xử lý lỗi 401 (Unauthorized) từ tất cả API calls và chuyển hướng user về trang đăng nhập.

## Cách hoạt động

### 1. API Client (`src/utils/apiClient.js`)

- **Wrapper cho fetch API**: Tự động thêm Authorization header
- **Xử lý 401 tự động**: 
  - Xóa token khỏi localStorage
  - Gọi logout từ AuthContext
  - Chuyển hướng về `/login`
- **Fallback**: Sử dụng `window.location.href` nếu navigate không khả dụng

### 2. Setup trong App.js

```javascript
import { setNavigate } from './utils/apiClient';

const AppContent = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavigate(navigate); // Cung cấp navigate function cho apiClient
  }, [navigate]);
  
  // ... rest of component
};
```

### 3. Setup trong AuthContext.js

```javascript
import { setAuthContext } from '../utils/apiClient';

export const AuthProvider = ({ children }) => {
  // ... state setup
  
  useEffect(() => {
    setAuthContext({ logout, login }); // Cung cấp auth methods cho apiClient
  }, []);
  
  // ... rest of component
};
```

## Cách sử dụng

### Thay vì fetch thông thường:

```javascript
// CŨ
const response = await fetch(`${API_BASE_URL}/api/data`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(data)
});

// MỚI
import { post } from '../utils/apiClient';

const response = await post('/api/data', data);
```

### Các method có sẵn:

- `get(url, options)` - GET requests
- `post(url, data, options)` - POST requests  
- `put(url, data, options)` - PUT requests
- `del(url, options)` - DELETE requests
- `apiClient(url, options)` - Raw wrapper cho fetch

## Lưu ý quan trọng

1. **Không cần thêm token thủ công** - apiClient tự động thêm từ localStorage
2. **Không cần xử lý 401 thủ công** - tự động logout và redirect
3. **URL có thể relative** - tự động thêm base URL
4. **Backward compatible** - vẫn có thể dùng fetch thông thường cho special cases

## Debugging

Khi gặp lỗi 401, check console log sẽ thấy:
```
API returned 401 - logging out user
```

## Migration checklist

- [x] Thay thế `fetch` calls với `apiClient` methods
- [x] Xóa manual Authorization headers
- [x] Xóa manual 401 handling
- [x] Update dependencies trong useCallback/useEffect
- [x] Test với expired token

## Files đã được cập nhật

- `src/utils/apiClient.js` - API client chính
- `src/context/AuthContext.js` - Setup auth reference
- `src/App.js` - Setup navigate reference
- `src/hooks/useChat.js` - Thay thế tất cả fetch calls
- `src/pages/LeaderboardPage.js` - Thay thế fetch call
- `src/components/shop/AvatarShop.js` - Thay thế fetch calls
- `src/components/AuthForm.js` - Thay thế fetch call (cho consistency) 