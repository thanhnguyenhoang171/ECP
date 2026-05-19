export const ErrorMessages: Record<string, string> = {
  // --- Auth Errors (AUTH_*) ---
  "AUTH_INVALID_CREDENTIALS": "Đăng nhập bị lỗi. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.",
  "AUTH_ACCESS_DENIED": "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.",
  "AUTH_TOKEN_EXPIRED": "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  
  // --- User Errors (USER_*) ---
  "USER_NOT_FOUND": "Không tìm thấy thông tin người dùng này.",
  "USER_ALREADY_EXISTS": "Tên đăng nhập đã tồn tại trong hệ thống.",
  
  // --- Category Errors (CATEGORY_*) ---
  "CATEGORY_SLUG_EXISTS": "Đường dẫn (slug) của danh mục đã tồn tại.",
  "CATEGORY_HAS_CHILDREN": "Không thể thực hiện vì danh mục này đang chứa danh mục con.",
  "CATEGORY_INVALID_PARENT": "Danh mục cha không hợp lệ (có thể là chính nó hoặc là danh mục con của nó).",
  
  // --- System/Global Errors (SYS_*) ---
  "SYS_VALIDATION_FAILED": "Dữ liệu nhập vào không hợp lệ, vui lòng kiểm tra lại.",
  "SYS_INTERNAL_ERROR": "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  "SYS_NETWORK_ERROR": "Không thể kết nối đến máy chủ.",
  
  // --- Default Fallback ---
  "SYS_UNKNOWN_ERROR": "Đã có lỗi xảy ra, vui lòng thử lại.",
};

/**
 * Hàm tiện ích để lấy câu thông báo lỗi dựa vào business code.
 * @param code Mã lỗi trả về từ Backend
 * @returns Câu thông báo lỗi bằng Tiếng Việt
 */
export const getErrorMessage = (code: string | null | undefined): string => {
  if (!code) return ErrorMessages["SYS_UNKNOWN_ERROR"];
  return ErrorMessages[code] || ErrorMessages["SYS_UNKNOWN_ERROR"];
};
