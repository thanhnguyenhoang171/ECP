package com.example.ecp_api.mapper;

import com.example.ecp_api.dto.request.BarcodeScanRequest;
import com.example.ecp_api.dto.response.BarcodeScanResponse;
import com.example.ecp_api.entity.mongodb.BarcodeScan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BarcodeScanMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "scannedAt", ignore = true)
    BarcodeScan toEntity(BarcodeScanRequest request);

    BarcodeScanResponse toResponse(BarcodeScan barcodeScan);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "scannedAt", ignore = true)
    void updateBarcodeScanFromRequest(BarcodeScanRequest request, @MappingTarget BarcodeScan barcodeScan);
}
