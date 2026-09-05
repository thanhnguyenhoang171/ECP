export const ErrorMessages: Record<string, string> = {
  // --- 1. Authentication & Authorization (AUTH_*) ---
  AUTH_UNAUTHORIZED: 'Yêu cầu đăng nhập hoặc phiên làm việc không hợp lệ.',
  AUTH_ACCOUNT_DISABLED: 'Tài khoản của bạn đã bị vô hiệu hóa.',
  AUTH_ACCOUNT_LOCKED: 'Tài khoản đã bị tạm khóa do vi phạm bảo mật.',
  AUTH_INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  AUTH_ACCESS_DENIED: 'Bạn không có quyền truy cập hoặc thực hiện thao tác này.',
  AUTH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  INVALID_GOOGLE_TOKEN: 'Xác thực tài khoản Google không thành công.',
  ACCOUNT_DISABLED: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.',
  FORBIDDEN: 'Bạn không có quyền thao tác trên tài nguyên này.',

  // --- 2. System / Generic (SYS_*, HTTP fallbacks) ---
  SYS_VALIDATION_FAILED: 'Dữ liệu nhập vào không hợp lệ, vui lòng kiểm tra lại.',
  SYS_MALFORMED_JSON: 'Định dạng dữ liệu gửi lên máy chủ không đúng chuẩn.',
  SYS_INVALID_PARAM_TYPE: 'Kiểu dữ liệu của tham số không hợp lệ.',
  SYS_MISSING_PARAM: 'Thiếu tham số bắt buộc trong yêu cầu.',
  SYS_METHOD_NOT_ALLOWED: 'Phương thức HTTP không được máy chủ hỗ trợ.',
  SYS_FILE_TOO_LARGE: 'Dung lượng tệp tải lên vượt quá giới hạn cho phép.',
  SYS_DATA_CONFLICT: 'Xung đột dữ liệu hoặc dữ liệu đã tồn tại trong hệ thống.',
  SYS_RESOURCE_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu trên hệ thống.',
  SYS_INTERNAL_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  SYS_NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.',
  SYS_TOO_MANY_ERRORS: 'Hệ thống gặp lỗi liên tục. Vui lòng thử lại sau.',
  SYS_UNKNOWN_ERROR: 'Đã có lỗi xảy ra, vui lòng thử lại.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  CONFLICT: 'Dữ liệu đã tồn tại trong hệ thống.',
  BAD_REQUEST: 'Yêu cầu không hợp lệ hoặc dữ liệu không đúng quy chuẩn.',
  INVALID_PARAM: 'Tham số gửi lên không hợp lệ.',
  INVALID_STATUS: 'Trạng thái hiện tại không cho phép thực hiện thao tác này.',

  // --- 3. Roles & Permissions (ROLE_*, PERMISSION_*) ---
  ROLE_CODE_EXISTS: 'Mã vai trò đã tồn tại trong hệ thống.',
  ROLE_NAME_EXISTS: 'Tên vai trò đã tồn tại trong hệ thống.',
  ROLE_NOT_FOUND: 'Không tìm thấy vai trò tương ứng trong hệ thống.',
  PERMISSION_NOT_FOUND: 'Không tìm thấy quyền hạn trong hệ thống.',
  PERMISSION_CODE_EXISTS: 'Mã quyền hạn đã tồn tại trong hệ thống.',
  CANNOT_DELETE_SYSTEM_ROLE: 'Không thể xóa vai trò mặc định của hệ thống.',
  CANNOT_MODIFY_SYSTEM_ROLE: 'Không thể thay đổi mã của vai trò mặc định hệ thống.',

  // --- 4. Users (USER_*, OTP_*) ---
  USER_ALREADY_EXISTS: 'Email hoặc tên đăng nhập đã được sử dụng.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin tài khoản người dùng.',
  USER_EMAIL_EXISTS: 'Địa chỉ email này đã tồn tại trong hệ thống.',
  USER_PHONE_EXISTS: 'Số điện thoại này đã tồn tại trong hệ thống.',
  EMAIL_ALREADY_VERIFIED: 'Địa chỉ email đã được xác thực trước đó.',
  INVALID_OTP: 'Mã xác thực OTP không chính xác hoặc đã hết hạn.',
  OTP_COOLDOWN: 'Vui lòng đợi giây lát trước khi yêu cầu mã OTP mới.',

  // --- 5. Files & Upload (FILE_*, INVALID_FILE*) ---
  INVALID_FILE: 'Tệp tải lên rỗng hoặc không có nội dung.',
  INVALID_FILE_TYPE: 'Định dạng tệp không hợp lệ (chỉ chấp nhận JPEG, PNG, WebP, SVG).',
  FILE_UPLOAD_FAILED: 'Tải tệp tin lên hệ thống lưu trữ thất bại.',
  FILE_DELETE_FAILED: 'Xóa tệp tin trên hệ thống lưu trữ thất bại.',
  FILE_NOT_FOUND: 'Không tìm thấy tệp tin trên hệ thống lưu trữ.',

  // --- 6. Products & SKUs & Brands & Categories ---
  PRODUCT_CODE_EXISTS: 'Mã sản phẩm đã tồn tại trong hệ thống.',
  PRODUCT_SLUG_EXISTS: 'Đường dẫn (slug) sản phẩm đã tồn tại.',
  PRODUCT_NOT_FOUND: 'Không tìm thấy thông tin sản phẩm.',
  PRODUCT_IN_USE: 'Không thể xóa sản phẩm đang có dữ liệu đơn hàng hoặc tồn kho.',
  SKU_EXISTS: 'Mã SKU sản phẩm đã tồn tại trong hệ thống.',
  SKU_CODE_EXISTS: 'Mã SKU sản phẩm đã tồn tại trong hệ thống.',
  SKU_BARCODE_EXISTS: 'Mã vạch (Barcode) SKU đã tồn tại trong hệ thống.',
  SKU_NOT_FOUND: 'Không tìm thấy thông tin SKU sản phẩm.',
  VARIANT_SKU_EXIST: 'Mã SKU của biến thể sản phẩm đã tồn tại.',
  CATEGORY_NOT_FOUND: 'Không tìm thấy danh mục sản phẩm.',
  CATEGORY_SLUG_EXISTS: 'Đường dẫn (slug) của danh mục đã tồn tại.',
  CATEGORY_CODE_EXISTS: 'Mã danh mục sản phẩm đã tồn tại.',
  CATEGORY_HAS_CHILDREN: 'Không thể xóa hoặc đổi danh mục cha vì danh mục đang chứa danh mục con.',
  CATEGORY_INVALID_PARENT: 'Danh mục cha không hợp lệ (không thể chọn chính nó hoặc danh mục con làm cha).',
  CATEGORY_HAS_PRODUCTS: 'Không thể xóa danh mục đang có sản phẩm liên kết.',
  CATEGORY_IMPORT_FAILED: 'Xử lý tệp nhập danh mục thất bại.',
  IMPORT_PARTIAL_ERROR: 'Một số dòng dữ liệu trong tệp nhập bị lỗi.',
  NAME_REQUIRED: 'Tên không được để trống.',
  BRAND_NOT_FOUND: 'Không tìm thấy thông tin thương hiệu.',
  BRAND_NAME_EXISTS: 'Tên thương hiệu đã tồn tại trong hệ thống.',
  BRAND_SLUG_EXISTS: 'Đường dẫn (slug) thương hiệu đã tồn tại.',

  // --- 7. Warehouses & Inventory (WAREHOUSE_*, INVENTORY_*, STOCK_*) ---
  WAREHOUSE_CODE_EXISTS: 'Mã kho hàng đã tồn tại trong hệ thống.',
  WAREHOUSE_NAME_EXISTS: 'Tên kho hàng đã tồn tại trong hệ thống.',
  WAREHOUSE_NOT_FOUND: 'Không tìm thấy thông tin kho hàng.',
  WAREHOUSE_HAS_INVENTORY: 'Không thể xóa hoặc ngưng hoạt động kho vẫn còn hàng tồn.',
  WAREHOUSE_HAS_TRANSACTIONS: 'Không thể xóa kho đã có phát sinh giao dịch hoặc đơn hàng.',
  INSUFFICIENT_STOCK: 'Số lượng hàng tồn kho không đủ để thực hiện giao dịch.',
  INVENTORY_NOT_EMPTY: 'Không thể xóa bản ghi kho vẫn còn số dư tồn hàng.',
  STOCK_NOT_FOUND: 'Không tìm thấy thông tin tồn kho của sản phẩm.',

  // --- 8. Suppliers & Purchase Orders & Goods Receipts (SUPPLIER_*, PO_*, RECEIPT_*) ---
  SUPPLIER_NOT_FOUND: 'Không tìm thấy thông tin nhà cung cấp.',
  SUPPLIER_NAME_EXISTS: 'Tên nhà cung cấp đã tồn tại trong hệ thống.',
  SUPPLIER_EMAIL_EXISTS: 'Email nhà cung cấp đã tồn tại trong hệ thống.',
  SUPPLIER_TAX_CODE_EXISTS: 'Mã số thuế của nhà cung cấp đã tồn tại.',
  SUPPLIER_CODE_EXISTS: 'Mã nhà cung cấp đã tồn tại trong hệ thống.',
  SUPPLIER_HAS_TRANSACTIONS: 'Không thể xóa nhà cung cấp đã có phát sinh đơn mua hàng.',
  PO_NOT_FOUND: 'Không tìm thấy đơn mua hàng tương ứng.',
  PURCHASE_ORDER_NOT_FOUND: 'Không tìm thấy đơn mua hàng tương ứng.',
  PO_CODE_EXISTS: 'Mã đơn mua hàng đã tồn tại trong hệ thống.',
  PURCHASE_ORDER_CODE_EXISTS: 'Mã đơn mua hàng đã tồn tại trong hệ thống.',
  RECEIPT_NOT_FOUND: 'Không tìm thấy phiếu nhập kho.',
  RECEIPT_CODE_EXISTS: 'Mã phiếu nhập kho đã tồn tại trong hệ thống.',
};

/**
 * Custom error class to carry API error code and HTTP status
 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Trả về câu thông báo lỗi Tiếng Việt chuẩn hóa dựa vào error code hoặc server message.
 */
export const getErrorMessage = (code?: string | null, serverMessage?: string | null): string => {
  if (code && ErrorMessages[code]) {
    return ErrorMessages[code];
  }
  if (serverMessage && typeof serverMessage === 'string' && serverMessage.trim() !== '') {
    return serverMessage;
  }
  return ErrorMessages.SYS_UNKNOWN_ERROR;
};

/**
 * Trích xuất mã lỗi và chuyển dịch thành câu Tiếng Việt thân thiện từ bất kỳ đối tượng lỗi nào.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage = 'Đã có lỗi xảy ra, vui lòng thử lại'
): string => {
  if (!error) return fallbackMessage;

  // Trường hợp error là instance của ApiError
  if (error instanceof ApiError) {
    if (ErrorMessages[error.code]) {
      return ErrorMessages[error.code];
    }
    return error.message || fallbackMessage;
  }

  // Trường hợp error là string trực tiếp
  if (typeof error === 'string') {
    if (ErrorMessages[error]) {
      return ErrorMessages[error];
    }
    return error;
  }

  // Trường hợp error là object có thuộc tính code
  const errObj = error as Record<string, unknown>;
  const code = (errObj.code ||
    (errObj.error as Record<string, unknown>)?.code ||
    (errObj.response as Record<string, unknown>)?.data &&
      ((errObj.response as Record<string, unknown>).data as Record<string, unknown>)?.code) as string | undefined;

  if (code && typeof code === 'string' && ErrorMessages[code]) {
    return ErrorMessages[code];
  }

  // Trường hợp error là Error instance
  if (error instanceof Error) {
    if (ErrorMessages[error.message]) {
      return ErrorMessages[error.message];
    }
    if (error.message && error.message !== 'Failed to fetch' && error.message !== 'Load failed') {
      return error.message;
    }
  }

  return fallbackMessage;
};

/**
 * Kiểm tra xem lỗi có phải là lỗi 403 Forbidden (không có quyền truy cập) hay không.
 */
export const isForbiddenError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (error instanceof ApiError) {
    if (error.status === 403 || error.code === 'AUTH_ACCESS_DENIED' || error.code === 'FORBIDDEN') {
      return true;
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (errObj.status === 403 || errObj.statusCode === 403) {
      return true;
    }
    if (errObj.code === 'AUTH_ACCESS_DENIED' || errObj.code === 'FORBIDDEN') {
      return true;
    }
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('403') ||
      msg.includes('forbidden') ||
      msg.includes('không có quyền') ||
      msg.includes('access denied')
    ) {
      return true;
    }
  }

  return false;
};
