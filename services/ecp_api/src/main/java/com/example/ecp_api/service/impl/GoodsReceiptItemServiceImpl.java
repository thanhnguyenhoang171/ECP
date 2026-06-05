package com.example.ecp_api.service.impl;

import com.example.ecp_api.dto.request.GoodsReceiptItemRequest;
import com.example.ecp_api.dto.response.GoodsReceiptItemResponse;
import com.example.ecp_api.dto.response.PageResponse;
import com.example.ecp_api.entity.jpa.GoodsReceipt;
import com.example.ecp_api.entity.jpa.GoodsReceiptItem;
import com.example.ecp_api.entity.jpa.Sku;
import com.example.ecp_api.enums.common.ReceiptStatus;
import com.example.ecp_api.exception.AppException;
import com.example.ecp_api.mapper.GoodsReceiptItemMapper;
import com.example.ecp_api.repository.jpa.GoodsReceiptItemRepository;
import com.example.ecp_api.repository.jpa.GoodsReceiptRepository;
import com.example.ecp_api.repository.jpa.SkuRepository;
import com.example.ecp_api.service.AuditLogService;
import com.example.ecp_api.service.GoodsReceiptItemService;
import com.example.ecp_api.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoodsReceiptItemServiceImpl implements GoodsReceiptItemService {

    private final GoodsReceiptItemRepository goodsReceiptItemRepository;
    private final GoodsReceiptRepository goodsReceiptRepository;
    private final SkuRepository skuRepository;
    private final GoodsReceiptItemMapper goodsReceiptItemMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public GoodsReceiptItemResponse addItemToReceipt(GoodsReceiptItemRequest request) {
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(request.getReceiptId()))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Không thể thêm hàng vào phiếu đã xử lý.", HttpStatus.BAD_REQUEST);
        }

        Sku sku = skuRepository.findById(UUID.fromString(request.getSkuId()))
                .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU.", HttpStatus.NOT_FOUND));

        GoodsReceiptItem item = goodsReceiptItemMapper.toEntity(request);
        item.setGoodsReceipt(receipt);
        item.setSku(sku);

        item = goodsReceiptItemRepository.save(item);

        auditLogService.log("ADD_RECEIPT_ITEM", SecurityUtils.getCurrentUsername(), 
                "Added item to GR " + receipt.getReceiptCode() + ": SKU " + sku.getSkuCode() + " qty: " + item.getQuantity());

        return goodsReceiptItemMapper.toResponse(item);
    }

    @Override
    @Transactional
    public List<GoodsReceiptItemResponse> addItemsToReceipt(List<GoodsReceiptItemRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        String receiptId = requests.get(0).getReceiptId();
        GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(receiptId))
                .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập.", HttpStatus.NOT_FOUND));

        if (receipt.getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Không thể thêm hàng vào phiếu đã xử lý.", HttpStatus.BAD_REQUEST);
        }

        List<GoodsReceiptItem> itemsToSave = new ArrayList<>();
        for (GoodsReceiptItemRequest request : requests) {
            if (!request.getReceiptId().equals(receiptId)) {
                throw new AppException("INVALID_REQUEST", "Tất cả các mặt hàng phải thuộc cùng một phiếu nhập.", HttpStatus.BAD_REQUEST);
            }

            Sku sku = skuRepository.findById(UUID.fromString(request.getSkuId()))
                    .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU với ID: " + request.getSkuId(), HttpStatus.NOT_FOUND));

            GoodsReceiptItem item = goodsReceiptItemMapper.toEntity(request);
            item.setGoodsReceipt(receipt);
            item.setSku(sku);
            itemsToSave.add(item);
        }

        List<GoodsReceiptItem> savedItems = goodsReceiptItemRepository.saveAll(itemsToSave);

        auditLogService.log("BULK_ADD_RECEIPT_ITEMS", SecurityUtils.getCurrentUsername(), 
                "Added " + savedItems.size() + " items to GR " + receipt.getReceiptCode());

        return goodsReceiptItemMapper.toResponseList(savedItems);
    }

    @Override
    @Transactional
    public GoodsReceiptItemResponse updateItem(String id, GoodsReceiptItemRequest request) {
        GoodsReceiptItem item = goodsReceiptItemRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("ITEM_NOT_FOUND", "Không tìm thấy chi tiết phiếu nhập.", HttpStatus.NOT_FOUND));

        if (item.getGoodsReceipt().getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Không thể cập nhật hàng trong phiếu đã xử lý.", HttpStatus.BAD_REQUEST);
        }

        goodsReceiptItemMapper.updateEntityFromRequest(request, item);
        
        if (!item.getGoodsReceipt().getId().toString().equals(request.getReceiptId())) {
            GoodsReceipt receipt = goodsReceiptRepository.findById(UUID.fromString(request.getReceiptId()))
                    .orElseThrow(() -> new AppException("RECEIPT_NOT_FOUND", "Không tìm thấy phiếu nhập mới.", HttpStatus.NOT_FOUND));
            item.setGoodsReceipt(receipt);
        }

        if (!item.getSku().getId().toString().equals(request.getSkuId())) {
            Sku sku = skuRepository.findById(UUID.fromString(request.getSkuId()))
                    .orElseThrow(() -> new AppException("SKU_NOT_FOUND", "Không tìm thấy SKU mới.", HttpStatus.NOT_FOUND));
            item.setSku(sku);
        }

        item = goodsReceiptItemRepository.save(item);

        auditLogService.log("UPDATE_RECEIPT_ITEM", SecurityUtils.getCurrentUsername(), 
                "Updated item " + item.getId() + " in GR " + item.getGoodsReceipt().getReceiptCode());

        return goodsReceiptItemMapper.toResponse(item);
    }

    @Override
    public GoodsReceiptItemResponse getItemById(String id) {
        GoodsReceiptItem item = goodsReceiptItemRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("ITEM_NOT_FOUND", "Không tìm thấy chi tiết phiếu nhập.", HttpStatus.NOT_FOUND));
        return goodsReceiptItemMapper.toResponse(item);
    }

    @Override
    public List<GoodsReceiptItemResponse> getItemsByReceiptId(String receiptId) {
        List<GoodsReceiptItem> items = goodsReceiptItemRepository.findByGoodsReceiptId(UUID.fromString(receiptId));
        return goodsReceiptItemMapper.toResponseList(items);
    }

    @Override
    public PageResponse<GoodsReceiptItemResponse> getAllItems(com.example.ecp_api.dto.request.GoodsReceiptItemFilterRequest filter, Pageable pageable) {
        Specification<GoodsReceiptItem> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (filter != null) {
                if (StringUtils.hasText(filter.getReceiptId())) {
                    predicates.add(cb.equal(root.get("goodsReceipt").get("id"), UUID.fromString(filter.getReceiptId())));
                }
                if (StringUtils.hasText(filter.getSkuId())) {
                    predicates.add(cb.equal(root.get("sku").get("id"), UUID.fromString(filter.getSkuId())));
                }
                if (StringUtils.hasText(filter.getBatchCode())) {
                    predicates.add(cb.like(root.get("batchCode"), "%" + filter.getBatchCode() + "%"));
                }
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<GoodsReceiptItem> page = goodsReceiptItemRepository.findAll(spec, pageable);
        return goodsReceiptItemMapper.toPageResponse(page);
    }

    @Override
    @Transactional
    public void deleteItem(String id) {
        GoodsReceiptItem item = goodsReceiptItemRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new AppException("ITEM_NOT_FOUND", "Không tìm thấy chi tiết phiếu nhập.", HttpStatus.NOT_FOUND));

        if (item.getGoodsReceipt().getStatus() != ReceiptStatus.DRAFT) {
            throw new AppException("INVALID_STATUS", "Không thể xóa hàng trong phiếu đã xử lý.", HttpStatus.BAD_REQUEST);
        }

        goodsReceiptItemRepository.delete(item);

        auditLogService.log("DELETE_RECEIPT_ITEM", SecurityUtils.getCurrentUsername(), 
                "Deleted item " + item.getId() + " from GR " + item.getGoodsReceipt().getReceiptCode());
    }
}
