from django.contrib import admin

from .models import Stock, Trade


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("symbol", "company_name", "last_price", "daily_change_percent", "last_updated")
    search_fields = ("symbol", "company_name")
    ordering = ("symbol",)


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ("stock", "action", "quantity", "notional", "status", "executed_at")
    list_filter = ("action", "status")
    search_fields = ("stock__symbol", "notes")
    autocomplete_fields = ("stock",)
    ordering = ("-executed_at",)
