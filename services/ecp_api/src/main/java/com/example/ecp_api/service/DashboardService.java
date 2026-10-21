package com.example.ecp_api.service;

import com.example.ecp_api.dto.response.DashboardOverviewResponse;

public interface DashboardService {
    DashboardOverviewResponse getOverview(String period);
}
