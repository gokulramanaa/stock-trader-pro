from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DashboardSummaryView, StockViewSet, TradeViewSet

router = DefaultRouter()
router.register(r"stocks", StockViewSet, basename="stock")
router.register(r"trades", TradeViewSet, basename="trade")

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("", include(router.urls)),
]
