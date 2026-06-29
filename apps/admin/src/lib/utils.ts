import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Kiểm tra xem một chuỗi có giống ID (ObjectId 24 ký tự hex hoặc UUID) hay không
 */
export function isIdLike(val: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(val) || /^[0-9a-fA-F-]{36}$/.test(val);
}

/**
 * Chuyển đổi tiếng Việt có dấu thành không dấu
 */
export function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system combine char 
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // / ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ă, Ơ
  // Remove extra spaces
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
}

/**
 * Chuyển đổi page từ UI (1-indexed) sang API (1-indexed, BE đã bật one-indexed-parameters)
 */
export function toApiPage(page: number): number {
  return Math.max(1, page);
}

/**
 * Chuyển đổi page từ API (1-indexed) sang UI (1-indexed)
 */
export function toUiPage(page: number): number {
  return page;
}

/**
 * Đồng bộ hóa dữ liệu phân trang từ API về UI format
 * Hiện tại BE đã trả về 1-indexed, nên hàm này chủ yếu để giữ cấu trúc
 */
export function syncPagination<T>(response: any): T {
  if (response && response.pagination) {
    response.pagination.currentPage = toUiPage(response.pagination.currentPage);
  }
  return response as T;
}

/**
 * Chuyển đổi một chuỗi bất kỳ thành định dạng Slug URL (tên-khong-dau-viet-lien)
 */
export function convertToSlug(str: string): string {
  if (!str) return "";
  str = str.toLowerCase();
  str = removeVietnameseTones(str);
  str = str.replace(/[^a-z0-9 -]/g, ""); // remove invalid chars
  str = str.replace(/\s+/g, "-"); // collapse whitespace and replace by -
  str = str.replace(/-+/g, "-"); // collapse dashes
  str = str.replace(/^-+/, ""); // trim - from start
  str = str.replace(/-+$/, ""); // trim - from end
  return str;
}

/**
 * Trích xuất public_id từ URL hình ảnh Cloudinary
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    const pathPart = parts[1];
    const pathSegments = pathPart.split("/");
    
    // Tìm index của version segment (ví dụ: "v1782188427")
    const versionIndex = pathSegments.findIndex(segment => 
      /^v\d+$/.test(segment)
    );
    
    let publicIdSegments: string[];
    
    if (versionIndex !== -1) {
      // Nếu có version, toàn bộ phần sau version chính là public_id
      publicIdSegments = pathSegments.slice(versionIndex + 1);
    } else {
      // Nếu không tìm thấy version (fallback), loại bỏ các transformation segments
      publicIdSegments = pathSegments.filter(segment => {
        if (!segment) return false;
        
        // Cấu hình transformation chứa dấu phẩy ',' hoặc bắt đầu bằng phím cấu hình (w_, h_, c_...)
        const isTransformation = segment.includes(",") || 
          /^(w|h|c|q|f|r|g|e|b|o|l|u|p|dl|dpr|co|bg|cs|cm|fl|x|y|z|zoom|bo|a|v)_\w+/.test(segment);
          
        return !isTransformation;
      });
    }
    
    if (publicIdSegments.length === 0) return null;
    
    const remainingPath = publicIdSegments.join("/");
    const dotIndex = remainingPath.lastIndexOf(".");
    if (dotIndex !== -1) {
      return remainingPath.substring(0, dotIndex);
    }
    return remainingPath;
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
}

