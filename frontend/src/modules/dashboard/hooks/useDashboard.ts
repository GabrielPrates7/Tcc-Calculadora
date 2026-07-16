import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardResumo } from '../types/index';

export function useDashboard() {
    const [dados, setDados] = useState<DashboardResumo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        dashboardService.getResumo()
            .then(setDados)
            .finally(() => setLoading(false));
    }, []);

    return { dados, loading };
}